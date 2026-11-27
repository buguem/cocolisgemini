import React, { useEffect, useState } from 'react';
import { Language, Shipment } from '../types/shipment';
import { formatCAD } from '../lib/formatters';
import { ApiEscrow, confirmDeliveryApi, fetchShipmentProposalsApi } from '../lib/api';
import { X, KeyRound, ShieldCheck, CheckCircle2, Lock, Star } from 'lucide-react';

interface DeliveryConfirmationModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  generatedDeliveryCode?: string | null;
  currentLang: Language;
  onClose: () => void;
  onConfirmDelivery: (shipmentId: string) => void;
  onOpenReview: (shipment: Shipment) => void;
}

export const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  isOpen,
  shipment,
  generatedDeliveryCode,
  currentLang,
  onClose,
  onConfirmDelivery,
  onOpenReview,
}) => {
  const [escrow, setEscrow] = useState<ApiEscrow | null>(null);
  const [inputCode, setInputCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [releasedPayout, setReleasedPayout] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !shipment) return;
    setInputCode('');
    setErrorMsg('');
    setIsSuccess(false);
    setReleasedPayout(null);

    let active = true;
    fetchShipmentProposalsApi(shipment.id)
      .then((data) => {
        if (!active) return;
        setEscrow(data.escrow);
      })
      .catch(() => {
        if (!active) return;
        setEscrow(null);
      });

    return () => {
      active = false;
    };
  }, [isOpen, shipment?.id]);

  if (!isOpen || !shipment) return null;

  const knownCode = generatedDeliveryCode || escrow?.deliveryCode || null;
  const expectedPayout = releasedPayout ?? escrow?.driverPayoutCAD ?? shipment.priceCAD * 0.85;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputCode.trim().replace(/\D/g, '');
    if (cleaned.length !== 6) {
      setErrorMsg(
        currentLang === 'fr'
          ? 'Veuillez saisir un code à 6 chiffres.'
          : 'Please enter a 6-digit code.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await confirmDeliveryApi(shipment.id, cleaned);
      setReleasedPayout(res.driverPayoutCAD);
      setIsSuccess(true);
      onConfirmDelivery(shipment.id);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : currentLang === 'fr'
            ? 'Code invalide ou aucun séquestre actif pour cette annonce.'
            : 'Invalid code or no active escrow for this shipment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {currentLang === 'fr' ? 'Validation de Livraison & Séquestre' : 'Delivery Confirmation & Escrow'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentLang === 'fr' ? 'Vérification temps réel sur Neon Postgres' : 'Live verification on Neon Postgres'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {currentLang === 'fr' ? 'Livraison Confirmée avec Succès !' : 'Delivery Confirmed!'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Les fonds sous séquestre de{' '}
                  <strong className="text-emerald-400">{formatCAD(expectedPayout, currentLang)}</strong>{' '}
                  ont été libérés au conducteur.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReview(shipment);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{currentLang === 'fr' ? "Laisser un avis sur l'expéditeur" : 'Leave Review for Sender'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block">
                    {shipment.origin.city} → {shipment.destination.city}
                  </span>
                  <strong className="text-white text-sm">{shipment.title[currentLang]}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Gains nets (85%)</span>
                  <strong className="text-emerald-400 text-base">{formatCAD(expectedPayout, currentLang)}</strong>
                </div>
              </div>

              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs text-slate-300 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {currentLang === 'fr'
                    ? "Demandez le code unique à 6 chiffres généré lors de l'acceptation de l'offre pour débloquer le paiement séquestre."
                    : 'Ask for the unique 6-digit code generated when the offer was accepted to release escrow payout.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
                  {currentLang === 'fr' ? 'Entrez le code à 6 chiffres *' : 'Enter 6-digit Code *'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="000000"
                  className="w-full text-center py-3.5 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl text-2xl font-black tracking-widest text-emerald-400 placeholder-slate-700 focus:outline-none focus:border-emerald-400"
                />
                {knownCode ? (
                  <span className="text-[11px] text-emerald-300 block text-center mt-1.5">
                    {currentLang === 'fr' ? 'Code séquestre actif (expéditeur) :' : 'Active escrow code (sender):'}{' '}
                    <strong className="tracking-widest">{knownCode}</strong>
                  </span>
                ) : !escrow ? (
                  <span className="text-[10px] text-amber-400 block text-center mt-1.5">
                    {currentLang === 'fr'
                      ? "Aucun séquestre actif : acceptez d'abord une offre dans les détails ou le chat."
                      : 'No active escrow yet: accept an offer in details or chat first.'}
                  </span>
                ) : null}
              </div>

              {errorMsg && (
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-bold">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-transform transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? currentLang === 'fr' ? 'Validation...' : 'Confirming...'
                    : currentLang === 'fr' ? 'Valider et débloquer les fonds' : 'Confirm & Release Payout'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
