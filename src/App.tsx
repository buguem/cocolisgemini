import React, { useState, useMemo, useEffect } from 'react';
import { FilterOptions, Language, Shipment } from './types/shipment';
import { UserProfile } from './types/auth';
import { MOCK_SHIPMENTS } from './data/mockShipments';
import {
  acceptChatOfferApi,
  createReviewApi,
  createShipmentApi,
  deleteShipmentApi,
  fetchMeApi,
  fetchShipmentsApi,
  getAuthToken,
  loginApi,
  setAuthToken,
  verifyProfileApi,
} from './lib/api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchForm } from './components/SearchForm';
import { ShipmentCard } from './components/ShipmentCard';
import { MapComponent } from './components/MapComponent';
import { ShipmentModal } from './components/ShipmentModal';
import { CreateShipmentWizard } from './components/CreateShipmentWizard';
import { AuthModal } from './components/AuthModal';
import { UserDashboardModal } from './components/UserDashboardModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatModal } from './components/ChatModal';
import { VerificationModal } from './components/VerificationModal';
import { DeliveryConfirmationModal } from './components/DeliveryConfirmationModal';
import { ReviewModal } from './components/ReviewModal';
import { Map, ListFilter, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  
  // Utilisateur connecté (par défaut Sophie Tremblay pour démo immédiate)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'user-sophie',
    name: 'Sophie Tremblay',
    email: 'sophie.tremblay@cocolis.ca',
    role: 'USER',
    rating: 4.9,
    completedTrips: 14,
    joinedDate: '2025-03-15',
    escrowBalanceCAD: 245.00,
    totalEarnedCAD: 1280.00,
    status: 'ACTIVE',
  });

  const [viewMode, setViewMode] = useState<'marketplace' | 'admin'>('marketplace');

  // Modals state V2
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  
  // Modals transactionnels V2
  const [activeModalShipment, setActiveModalShipment] = useState<Shipment | null>(null);
  const [activeChatShipment, setActiveChatShipment] = useState<Shipment | null>(null);
  const [activeDeliveryShipment, setActiveDeliveryShipment] = useState<Shipment | null>(null);
  const [activeDeliveryCode, setActiveDeliveryCode] = useState<string | null>(null);
  const [activeReviewShipment, setActiveReviewShipment] = useState<Shipment | null>(null);

  // Annonces & sélection (chargées depuis Neon Postgres via /api/shipments)
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(MOCK_SHIPMENTS[0]);

  // Chargement initial depuis l'API Neon Postgres
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const liveShipments = await fetchShipmentsApi();
        if (active && liveShipments.length > 0) {
          setShipments(liveShipments);
          setSelectedShipment(liveShipments[0]);
        }
      } catch {
        // Fallback gracieux sur MOCK_SHIPMENTS si l'API n'est pas joignable
      }

      try {
        const existingToken = getAuthToken();
        const user = existingToken
          ? await fetchMeApi()
          : await loginApi('sophie.tremblay@cocolis.ca', 'cocolis123');
        if (active) {
          setCurrentUser(user);
        }
      } catch {
        // Conserve l'utilisateur démo local si l'API est hors ligne
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Système de notifications Toast réactif
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Vue mobile : 'list' (mobile), 'map' (mobile)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Filtres de recherche
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    originFilter: '',
    destinationFilter: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtrage réactif des expéditions
  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      // Filtrer par mot clé
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const titleFr = shipment.title.fr.toLowerCase();
        const titleEn = shipment.title.en.toLowerCase();
        const descFr = shipment.description.fr.toLowerCase();
        const descEn = shipment.description.en.toLowerCase();
        if (!titleFr.includes(query) && !titleEn.includes(query) && !descFr.includes(query) && !descEn.includes(query)) {
          return false;
        }
      }

      // Filtrer par Origine
      if (filters.originFilter) {
        const originQuery = filters.originFilter.toLowerCase();
        const city = shipment.origin.city.toLowerCase();
        const province = shipment.origin.province.toLowerCase();
        if (!city.includes(originQuery) && !province.includes(originQuery)) {
          return false;
        }
      }

      // Filtrer par Destination
      if (filters.destinationFilter) {
        const destQuery = filters.destinationFilter.toLowerCase();
        const city = shipment.destination.city.toLowerCase();
        const province = shipment.destination.province.toLowerCase();
        if (!city.includes(destQuery) && !province.includes(destQuery)) {
          return false;
        }
      }

      // Filtrer par catégorie
      if (filters.category && shipment.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [shipments, filters]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      originFilter: '',
      destinationFilter: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000,
    });
    showToast(currentLang === 'fr' ? 'Filtres de recherche réinitialisés' : 'Search filters reset');
  };

  const handleDeleteShipment = async (id: string) => {
    try {
      await deleteShipmentApi(id);
    } catch {
      // ignore if demo/offline
    }
    setShipments((prev) => prev.filter((s) => s.id !== id));
    showToast(currentLang === 'fr' ? 'Annonce supprimée du réseau' : 'Shipment deleted from network');
  };

  const handleConfirmDelivery = (shipmentId: string) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, status: 'DELIVERED' } : s))
    );
    showToast(
      currentLang === 'fr'
        ? 'Livraison confirmée ! Les fonds sous séquestre ont été versés au conducteur.'
        : 'Delivery confirmed! Escrow funds released to transporter.'
    );
  };

  // Si on est en vue Administration
  if (viewMode === 'admin' && currentUser?.role === 'ADMIN') {
    return (
      <AdminDashboard
        currentLang={currentLang}
        currentUser={currentUser}
        shipments={shipments}
        onBackToMarketplace={() => setViewMode('marketplace')}
        onDeleteShipment={handleDeleteShipment}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[500] glass-panel bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Navbar Bilingue V2 */}
      <Navbar
        currentLang={currentLang}
        currentUser={currentUser}
        onLanguageChange={(lang) => {
          setCurrentLang(lang);
          showToast(lang === 'fr' ? 'Langue changée en Français 🇨🇦' : 'Language switched to English 🇨🇦');
        }}
        onNewShipmentClick={() => setIsWizardOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUserDashboard={() => setIsUserDashboardOpen(true)}
        onOpenAdminDashboard={() => setViewMode('admin')}
        onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
        onLogout={() => {
          setAuthToken(null);
          setCurrentUser(null);
          showToast(currentLang === 'fr' ? 'Vous êtes déconnecté' : 'You signed out');
        }}
      />

      {/* Hero Section Banner */}
      <Hero
        currentLang={currentLang}
        totalShipmentsCount={filteredShipments.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Search & Autocomplete Filter Bar */}
        <SearchForm
          currentLang={currentLang}
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Mobile View Toggle Buttons */}
        <div className="lg:hidden flex items-center justify-center mb-4 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-colors ${
              mobileView === 'list'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>{currentLang === 'fr' ? 'Liste d\'annonces' : 'Listings'} ({filteredShipments.length})</span>
          </button>
          
          <button
            onClick={() => setMobileView('map')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-colors ${
              mobileView === 'map'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>{currentLang === 'fr' ? 'Carte Live OpenStreetMap' : 'Live Map'}</span>
          </button>
        </div>

        {/* Split Screen Grid Layout: Left List + Right Interactive Live Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Shipment List */}
          <div
            className={`lg:col-span-6 space-y-4 ${
              mobileView === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>
                  {currentLang === 'fr' 
                    ? `Annonces disponibles (${filteredShipments.length})` 
                    : `Available listings (${filteredShipments.length})`}
                </span>
              </h2>

              {selectedShipment && (
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {currentLang === 'fr' ? 'Trajet sélectionné sur la carte' : 'Selected on map'}
                </span>
              )}
            </div>

            {filteredShipments.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {currentLang === 'fr' ? 'Aucune annonce trouvée' : 'No listings found'}
                </h3>
                <p className="text-xs text-slate-400">
                  {currentLang === 'fr' 
                    ? 'Essayez de modifier vos critères de recherche ou d\'effacer les filtres.' 
                    : 'Try modifying your search criteria or clear filters.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  {currentLang === 'fr' ? 'Effacer les filtres' : 'Clear filters'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredShipments.map((shipment) => (
                  <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    currentLang={currentLang}
                    isSelected={selectedShipment?.id === shipment.id}
                    onSelect={(s) => {
                      setSelectedShipment(s);
                    }}
                    onViewDetails={(s) => {
                      setSelectedShipment(s);
                      setActiveModalShipment(s);
                    }}
                    onOpenChat={(s) => {
                      setActiveChatShipment(s);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Interactive Live OpenStreetMap Component */}
          <div
            className={`lg:col-span-6 lg:sticky lg:top-24 h-[550px] lg:h-[calc(100vh-140px)] ${
              mobileView === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <MapComponent
              shipments={filteredShipments}
              selectedShipment={selectedShipment}
              onSelectShipment={(s) => setSelectedShipment(s)}
              onViewDetails={(s) => setActiveModalShipment(s)}
              currentLang={currentLang}
            />
          </div>

        </div>

      </main>

      {/* Shipment Details Modal */}
      <ShipmentModal
        shipment={activeModalShipment}
        currentUser={currentUser}
        currentLang={currentLang}
        onClose={() => setActiveModalShipment(null)}
        onSuccessToast={showToast}
        onOpenChat={(s) => setActiveChatShipment(s)}
        onOpenDeliveryCodeModal={(s, code) => {
          setActiveDeliveryCode(code ?? null);
          setActiveDeliveryShipment(s);
        }}
        onOfferAccepted={(shipment, deliveryCode) => {
          setShipments((prev) =>
            prev.map((s) => (s.id === shipment.id ? { ...s, status: 'IN_TRANSIT' } : s))
          );
          setActiveDeliveryCode(deliveryCode);
          setActiveDeliveryShipment(shipment);
          showToast(
            currentLang === 'fr'
              ? `Offre acceptée ! Code de livraison généré : ${deliveryCode}`
              : `Offer accepted! Delivery code generated: ${deliveryCode}`
          );
        }}
      />

      {/* Wizard V2 Création d'Annonce 4 Étapes */}
      <CreateShipmentWizard
        isOpen={isWizardOpen}
        currentLang={currentLang}
        onClose={() => setIsWizardOpen(false)}
        onAddShipment={async (newShipment) => {
          let saved = newShipment;
          try {
            saved = await createShipmentApi(newShipment);
          } catch {
            // fallback local si hors ligne
          }
          setShipments((prev) => [saved, ...prev]);
          setSelectedShipment(saved);
          showToast(
            currentLang === 'fr' 
              ? 'Annonce créée avec succès et géolocalisée sur la carte !' 
              : 'Listing created successfully and geolocated on the live map!'
          );
        }}
      />

      {/* Chat Temps-Réel Sécurisé Modal */}
      <ChatModal
        isOpen={!!activeChatShipment}
        shipment={activeChatShipment}
        currentUser={currentUser}
        currentLang={currentLang}
        onClose={() => setActiveChatShipment(null)}
        onAcceptOffer={async (shipment, price) => {
          try {
            const res = await acceptChatOfferApi(shipment.id, price);
            setShipments((prev) =>
              prev.map((s) => (s.id === shipment.id ? { ...s, status: 'IN_TRANSIT' } : s))
            );
            setActiveDeliveryCode(res.deliveryCode);
            showToast(
              currentLang === 'fr'
                ? `Offre de ${price} $ acceptée ! Code séquestre : ${res.deliveryCode}`
                : `Offer of $${price} accepted! Escrow code: ${res.deliveryCode}`
            );
          } catch (err) {
            showToast(
              err instanceof Error
                ? err.message
                : currentLang === 'fr'
                  ? "Impossible d'accepter cette offre."
                  : 'Unable to accept offer.'
            );
          }
          setActiveDeliveryShipment(shipment);
        }}
      />

      {/* Modal Confirmation de Livraison (Code 6 Chiffres) */}
      <DeliveryConfirmationModal
        isOpen={!!activeDeliveryShipment}
        shipment={activeDeliveryShipment}
        generatedDeliveryCode={activeDeliveryCode}
        currentLang={currentLang}
        onClose={() => {
          setActiveDeliveryShipment(null);
          setActiveDeliveryCode(null);
        }}
        onConfirmDelivery={handleConfirmDelivery}
        onOpenReview={(s) => setActiveReviewShipment(s)}
      />

      {/* Modal Avis & Évaluation */}
      <ReviewModal
        isOpen={!!activeReviewShipment}
        shipment={activeReviewShipment}
        currentLang={currentLang}
        onClose={() => setActiveReviewShipment(null)}
        onSubmitReview={async (rating, comment) => {
          if (activeReviewShipment) {
            try {
              await createReviewApi(activeReviewShipment.id, rating, comment);
            } catch {
              // ignore if offline
            }
          }
          showToast(
            currentLang === 'fr'
              ? `Merci ! Votre avis ${rating}★ a été publié.`
              : `Thank you! Your ${rating}★ review has been published.`
          );
        }}
      />

      {/* Modal Vérification Profil (SMS + ID) */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        currentUser={currentUser}
        currentLang={currentLang}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerified={async () => {
          try {
            const updatedUser = await verifyProfileApi();
            setCurrentUser(updatedUser);
          } catch {
            // ignore if offline
          }
          showToast(
            currentLang === 'fr'
              ? 'Profil Vérifié 🛡️ activé avec succès !'
              : 'Verified Profile 🛡️ badge activated!'
          );
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentLang={currentLang}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(user) => {
          setCurrentUser(user);
          showToast(
            currentLang === 'fr' 
              ? `Bienvenue ${user.name} (${user.role === 'ADMIN' ? 'Administrateur' : 'Membre'})`
              : `Welcome ${user.name} (${user.role === 'ADMIN' ? 'Administrator' : 'Member'})`
          );
        }}
      />

      {/* User Dashboard Modal */}
      {currentUser && (
        <UserDashboardModal
          isOpen={isUserDashboardOpen}
          currentUser={currentUser}
          userShipments={shipments}
          currentLang={currentLang}
          onClose={() => setIsUserDashboardOpen(false)}
          onSelectShipment={(s) => {
            setSelectedShipment(s);
            setActiveModalShipment(s);
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800 bg-slate-900/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Cocolis.ca — Plateforme de Crowdshipping Canadienne (V2.0). Tous droits réservés.</p>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-emerald-400 transition-colors">Termes & Conditions</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Séquestre Stripe</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Aide & Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
