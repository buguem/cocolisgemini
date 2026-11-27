import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types/auth';
import { Language, Shipment } from '../types/shipment';
import { formatCAD, formatDate, formatDistance } from '../lib/formatters';
import { DashboardResponse, fetchDashboardApi } from '../lib/api';
import { X, Package, Truck, Wallet, ShieldCheck, Star } from 'lucide-react';

interface UserDashboardModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  userShipments: Shipment[];
  currentLang: Language;
  onClose: () => void;
  onSelectShipment: (s: Shipment) => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  currentUser,
  userShipments,
  currentLang,
  onClose,
  onSelectShipment,
}) => {
  const [activeTab, setActiveTab] = useState<'shipments' | 'trips' | 'wallet'>('shipments');
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    fetchDashboardApi()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch(() => {
        if (active) setDashboard(null);
      });
    return () => {
      active = false;
    };
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  const displayedShipments = dashboard
    ? dashboard.sentShipments
    : userShipments.filter((s) => !s.senderId || s.senderId === currentUser.id);
  const displayedTrips = dashboard?.driverProposals ?? [];
  const escrowBalanceCAD = dashboard ? dashboard.wallet.escrowBalanceCAD : currentUser.escrowBalanceCAD;
  const totalEarnedCAD = dashboard ? dashboard.wallet.totalEarnedCAD : currentUser.totalEarnedCAD;

  const handleRequestPayout = () => {
    setPayoutRequested(true);
    setTimeout(() => {
      setPayoutRequested(false);
      alert(
        currentLang === 'fr'
          ? `Virement Stripe Connect de ${formatCAD(escrowBalanceCAD, 'fr')} demandé vers votre compte bancaire canadien.`
          : `Stripe Connect payout of ${formatCAD(escrowBalanceCAD, 'en')} requested to your Canadian bank account.`
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        
        {/* Header with User Info */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">{currentUser.name}</h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                  {currentUser.role === 'ADMIN' ? 'ADMIN' : 'MEMBRE SÉCURISÉ'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{currentUser.rating.toFixed(1)}</span>
                </span>
                <span>•</span>
                <span>{currentUser.completedTrips} {currentLang === 'fr' ? 'livraisons réussies' : 'successful trips'}</span>
                <span>•</span>
                <span>Membre depuis {currentUser.joinedDate}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/40 px-6 pt-2 space-x-4">
          <button
            onClick={() => setActiveTab('shipments')}
            className={`py-3 px-3 border-b-2 font-bold text-xs flex items-center space-x-2 transition-colors ${
              activeTab === 'shipments'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{currentLang === 'fr' ? 'Mes Expéditions Envoyées' : 'My Sent Shipments'} ({displayedShipments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`py-3 px-3 border-b-2 font-bold text-xs flex items-center space-x-2 transition-colors ${
              activeTab === 'trips'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{currentLang === 'fr' ? 'Mes Trajets Conducteur' : 'My Driver Trips'} ({displayedTrips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-3 border-b-2 font-bold text-xs flex items-center space-x-2 transition-colors ${
              activeTab === 'wallet'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{currentLang === 'fr' ? 'Portefeuille CAD' : 'CAD Wallet'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          
          {/* Tab 1: Mes Expéditions */}
          {activeTab === 'shipments' && (
            <div className="space-y-3">
              {displayedShipments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {currentLang === 'fr' ? "Vous n'avez encore envoyé aucune expédition." : "You haven't posted any shipments yet."}
                </div>
              ) : (
                displayedShipments.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectShipment(s);
                      onClose();
                    }}
                    className="glass-card p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          {s.origin.city} → {s.destination.city}
                        </span>
                        <span className="text-xs font-bold text-white">{s.title[currentLang]}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-3">
                        <span>{formatDistance(s.distanceKm, currentLang)}</span>
                        <span>•</span>
                        <span>{formatDate(s.departureDate, currentLang)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400 block">
                        {formatCAD(s.priceCAD, currentLang)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Mes Trajets Conducteur */}
          {activeTab === 'trips' && (
            <div className="space-y-3">
              {displayedTrips.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {currentLang === 'fr'
                    ? "Vous n'avez pas encore soumis d'offre de transport."
                    : "You haven't submitted any transport offers yet."}
                </div>
              ) : (
                displayedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => {
                      onSelectShipment(trip.shipment);
                      onClose();
                    }}
                    className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs text-emerald-400 font-bold block">
                        {trip.shipment.origin.city} → {trip.shipment.destination.city}
                      </span>
                      <span className="text-sm font-bold text-white">{trip.shipment.title[currentLang]}</span>
                      <span className="text-xs text-slate-400 block">
                        {currentLang === 'fr' ? 'Offre :' : 'Offer:'} {formatCAD(trip.offerAmountCAD, currentLang)}
                        {trip.driverPayoutCAD !== undefined
                          ? ` • Net 85%: ${formatCAD(trip.driverPayoutCAD, currentLang)}`
                          : ''}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded font-bold text-xs border ${
                        trip.isAccepted
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {trip.escrowStatus || (trip.isAccepted ? 'ACCEPTÉE' : 'EN ATTENTE')}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Portefeuille & Solde CAD */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {/* Solde Card */}
              <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 p-6 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                    {currentLang === 'fr' ? 'Solde sous séquestre Stripe Connect (CAD $)' : 'Stripe Connect Escrow Balance (CAD $)'}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                    {formatCAD(escrowBalanceCAD, currentLang)}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Total cumulé gagné : {formatCAD(totalEarnedCAD, currentLang)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleRequestPayout}
                    disabled={payoutRequested || escrowBalanceCAD <= 0}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-transform transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  >
                    <span>{currentLang === 'fr' ? '⚡ Virement Interac (60s)' : '⚡ Interac e-Transfer (60s)'}</span>
                  </button>
                  <button
                    onClick={handleRequestPayout}
                    disabled={payoutRequested || escrowBalanceCAD <= 0}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    <span>{currentLang === 'fr' ? 'Virement bancaire' : 'Bank Payout'}</span>
                  </button>
                </div>
              </div>

              {/* Information Séquestre */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{currentLang === 'fr' ? 'Sécurité bancaire canadienne' : 'Canadian banking security'}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {currentLang === 'fr'
                    ? 'Tous vos paiements sont conservés en dollars canadiens (CAD) sous séquestre et versés directement sur votre compte Interac ou bancaire après confirmation de livraison.'
                    : 'All payments are held in Canadian dollars (CAD) in escrow and deposited into your Interac or bank account after delivery confirmation.'}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
