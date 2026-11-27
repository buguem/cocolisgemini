import React, { useEffect, useState } from 'react';
import { Language, Shipment } from '../types/shipment';
import { UserProfile } from '../types/auth';
import { formatCAD, formatDate, formatDistance, getCategoryLabel } from '../lib/formatters';
import {
  acceptProposalApi,
  ApiEscrow,
  ApiProposal,
  fetchShipmentProposalsApi,
  submitProposalApi,
} from '../lib/api';
import {
  X,
  Calendar,
  Weight,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Star,
  DollarSign,
  Send,
  Info,
  MessageSquare,
  KeyRound,
  Shield,
} from 'lucide-react';

interface ShipmentModalProps {
  shipment: Shipment | null;
  currentUser?: UserProfile | null;
  currentLang: Language;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
  onOpenChat: (shipment: Shipment) => void;
  onOpenDeliveryCodeModal: (shipment: Shipment, deliveryCode?: string | null) => void;
  onOfferAccepted?: (shipment: Shipment, deliveryCode: string) => void;
}

export const ShipmentModal: React.FC<ShipmentModalProps> = ({
  shipment,
  currentUser,
  currentLang,
  onClose,
  onSuccessToast,
  onOpenChat,
  onOpenDeliveryCodeModal,
  onOfferAccepted,
}) => {
  const [offerAmountCAD, setOfferAmountCAD] = useState<number>(shipment?.priceCAD || 50);
  const [tripDate, setTripDate] = useState<string>(shipment?.departureDate || '2026-12-15');
  const [driverMessage, setDriverMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEscrowBreakdown, setShowEscrowBreakdown] = useState<boolean>(false);
  const [proposals, setProposals] = useState<ApiProposal[]>([]);
  const [escrow, setEscrow] = useState<ApiEscrow | null>(null);
  const [isSender, setIsSender] = useState<boolean>(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (!shipment) return;
    setOfferAmountCAD(shipment.priceCAD);
    setTripDate(shipment.departureDate || '2026-12-15');
    setDriverMessage('');
    setIsSubmitted(false);
    setErrorMsg(null);

    let active = true;
    fetchShipmentProposalsApi(shipment.id)
      .then((data) => {
        if (!active) return;
        setProposals(data.proposals);
        setEscrow(data.escrow);
        setIsSender(data.isSender);
      })
      .catch(() => {
        if (!active) return;
        setProposals([]);
        setEscrow(null);
        setIsSender(Boolean(currentUser && shipment.senderId === currentUser.id));
      });

    return () => {
      active = false;
    };
  }, [shipment?.id, currentUser?.id]);

  if (!shipment) return null;

  const platformFee = Math.round((offerAmountCAD || shipment.priceCAD) * 0.15);
  const netDriverPayout = (offerAmountCAD || shipment.priceCAD) - platformFee;

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const created = await submitProposalApi(
        shipment.id,
        offerAmountCAD,
        tripDate,
        driverMessage || undefined
      );
      setProposals((prev) => [created, ...prev]);
      setIsSubmitted(true);
      if (onSuccessToast) {
        onSuccessToast(
          currentLang === 'fr'
            ? `Offre de ${formatCAD(offerAmountCAD, 'fr')} enregistrée dans Neon Postgres !`
            : `Offer of ${formatCAD(offerAmountCAD, 'en')} saved to Neon Postgres!`
        );
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : currentLang === 'fr'
            ? "Impossible d'envoyer cette offre."
            : 'Unable to submit offer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    setAcceptingId(proposalId);
    setErrorMsg(null);
    try {
      const res = await acceptProposalApi(proposalId);
      setEscrow(res.escrow);
      setProposals((prev) =>
        prev.map((p) => ({ ...p, isAccepted: p.id === proposalId }))
      );
      if (onOfferAccepted) {
        onOfferAccepted(shipment, res.deliveryCode);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l’acceptation.');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              {getCategoryLabel(shipment.category, currentLang)}
            </span>
            <span className="text-xs text-slate-400">
              ID: <strong className="text-slate-200">{shipment.id}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Profil Vérifié</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Title & Description */}
          <div className="pt-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
                  {shipment.title[currentLang]}
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                  {shipment.description[currentLang]}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat(shipment);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>{currentLang === 'fr' ? 'Discuter' : 'Chat'}</span>
              </button>
            </div>
          </div>

          {/* Route Visualizer */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-4">
            <div className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>{currentLang === 'fr' ? 'Itinéraire Canadien' : 'Canadian Route'}</span>
              <span className="text-emerald-400 text-xs font-extrabold">
                {formatDistance(shipment.distanceKm, currentLang)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
                  A
                </div>
                <div>
                  <span className="text-xs text-emerald-400 font-bold block">
                    {currentLang === 'fr' ? 'Départ (Origine)' : 'Departure (Origin)'}
                  </span>
                  <div className="text-sm font-bold text-white">
                    {shipment.origin.city}, {shipment.origin.province}
                  </div>
                  <div className="text-xs text-slate-400">
                    {shipment.origin.name}{shipment.origin.postalCode ? ` (${shipment.origin.postalCode})` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-teal-400/20 text-teal-300 flex items-center justify-center font-black text-xs shrink-0">
                  B
                </div>
                <div>
                  <span className="text-xs text-teal-300 font-bold block">
                    {currentLang === 'fr' ? 'Arrivée (Destination)' : 'Arrival (Destination)'}
                  </span>
                  <div className="text-sm font-bold text-white">
                    {shipment.destination.city}, {shipment.destination.province}
                  </div>
                  <div className="text-xs text-slate-400">
                    {shipment.destination.name}{shipment.destination.postalCode ? ` (${shipment.destination.postalCode})` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>{currentLang === 'fr' ? 'Date souhaitée :' : 'Desired Date:'} {formatDate(shipment.departureDate, currentLang)}</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <Truck className="w-3.5 h-3.5" />
                <span>{shipment.vehicleNeeded[currentLang]}</span>
              </span>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-3 rounded-xl text-center">
              <Weight className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block">{currentLang === 'fr' ? 'Poids du colis' : 'Package weight'}</span>
              <span className="text-sm font-extrabold text-white">{shipment.weightKg} kg</span>
            </div>

            <div className="glass-card p-3 rounded-xl text-center">
              <Truck className="w-4 h-4 text-teal-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block">{currentLang === 'fr' ? 'Dimensions' : 'Dimensions'}</span>
              <span className="text-xs font-bold text-white truncate block">{shipment.dimensions}</span>
            </div>

            <div className="glass-card p-3 rounded-xl text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-slate-400 block">{currentLang === 'fr' ? 'Séquestre Stripe' : 'Stripe Escrow'}</span>
              <span className="text-xs font-bold text-emerald-400">
                {escrow ? escrow.status : currentLang === 'fr' ? '100% Garanti' : '100% Guaranteed'}
              </span>
            </div>
          </div>

          {/* Escrow Payout Breakdown Calculator V2 */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-sm font-bold text-white block">
                    {currentLang === 'fr' ? 'Paiement sous séquestre Stripe Connect' : 'Stripe Connect Escrow Payout'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {currentLang === 'fr' ? 'Fonds bloqués jusqu\'au code à 6 chiffres' : 'Funds held until 6-digit confirmation code'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEscrowBreakdown(!showEscrowBreakdown)}
                className="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{showEscrowBreakdown ? 'Masquer' : 'Détail 15%'}</span>
              </button>
            </div>

            {showEscrowBreakdown && (
              <div className="bg-slate-950 p-3 rounded-xl text-xs space-y-1.5 border border-slate-800/80 text-slate-300">
                <div className="flex justify-between">
                  <span>Montant total offert par l'expéditeur :</span>
                  <strong className="text-white">{formatCAD(offerAmountCAD || shipment.priceCAD, currentLang)}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Commission plateforme Cocolis (15%) :</span>
                  <span className="text-amber-400">-{formatCAD(platformFee, currentLang)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-emerald-400 text-sm">
                  <span>Revenu net garanti du transporteur (85%) :</span>
                  <span>{formatCAD(netDriverPayout, currentLang)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Offres reçues en base Neon */}
          {proposals.length > 0 && (
            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                {currentLang === 'fr'
                  ? `Offres reçues (${proposals.length})`
                  : `Received Offers (${proposals.length})`}
              </h4>
              <div className="space-y-2">
                {proposals.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-white">{p.driver.name}</strong>
                        <span className="flex items-center space-x-0.5 text-amber-400 text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{p.driver.rating.toFixed(1)}</span>
                        </span>
                        {p.isAccepted && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            ACCEPTÉE
                          </span>
                        )}
                      </div>
                      {p.driverMessage && (
                        <p className="text-slate-400 text-[11px] mt-0.5">{p.driverMessage}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-extrabold text-emerald-400">
                        {formatCAD(p.offerAmountCAD, currentLang)}
                      </span>
                      {(isSender || currentUser?.role === 'ADMIN') && !p.isAccepted && (
                        <button
                          type="button"
                          disabled={acceptingId === p.id}
                          onClick={() => handleAcceptProposal(p.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] disabled:opacity-50"
                        >
                          {acceptingId === p.id ? '...' : currentLang === 'fr' ? 'Accepter' : 'Accept'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton de confirmation de livraison (Code unique) */}
          <div className="flex items-center justify-between bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center space-x-2.5">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {currentLang === 'fr' ? 'Déjà livré ?' : 'Already delivered?'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {escrow?.deliveryCode
                    ? `Code séquestre généré : ${escrow.deliveryCode}`
                    : currentLang === 'fr'
                      ? 'Saisissez le code 6 chiffres pour recevoir les fonds'
                      : 'Enter 6-digit code to release payout'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDeliveryCodeModal(shipment, escrow?.deliveryCode ?? null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow"
            >
              Entrer Code 6 Chiffres
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Interactive Offer Form */}
          {isSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-white">
                {currentLang === 'fr' ? 'Proposition transmise !' : 'Proposal Submitted!'}
              </h4>
              <p className="text-xs text-slate-300">
                {currentLang === 'fr'
                  ? "Votre offre est enregistrée dans Neon Postgres. Le code à 6 chiffres sera généré dès l'acceptation par l'expéditeur."
                  : 'Your offer is saved in Neon Postgres. The 6-digit code will generate once accepted by the sender.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendOffer} className="space-y-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>{currentLang === 'fr' ? 'Faire une offre de transport' : 'Make a transport offer'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {currentLang === 'fr' ? 'Montant proposé (CAD $)' : 'Proposed Amount (CAD $)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400 font-bold">$</div>
                    <input
                      type="number"
                      required
                      min={20}
                      value={offerAmountCAD}
                      onChange={(e) => setOfferAmountCAD(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-extrabold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {currentLang === 'fr' ? 'Votre date de passage' : 'Your travel date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {currentLang === 'fr' ? "Message pour l'expéditeur (optionnel)" : 'Message for sender (optional)'}
                </label>
                <input
                  type="text"
                  value={driverMessage}
                  onChange={(e) => setDriverMessage(e.target.value)}
                  placeholder={currentLang === 'fr' ? "ex: J'ai un grand coffre et je passe par là ce jour-là." : 'e.g. Spacious trunk, driving by on that day.'}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-transform transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                <DollarSign className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? currentLang === 'fr' ? 'Envoi en cours...' : 'Submitting...'
                    : currentLang === 'fr'
                      ? `Réserver ce trajet & sécuriser ${formatCAD(netDriverPayout, 'fr')} net`
                      : `Reserve trip & secure ${formatCAD(netDriverPayout, 'en')} net`}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
