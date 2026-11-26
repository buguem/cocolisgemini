import React, { useState } from 'react';
import { UserProfile } from '../types/auth';
import { Language } from '../types/shipment';
import { Truck, Globe, Shield, PlusCircle, User, LogIn, LogOut, LayoutDashboard, Wallet, ChevronDown, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentLang: Language;
  currentUser: UserProfile | null;
  onLanguageChange: (lang: Language) => void;
  onNewShipmentClick: () => void;
  onOpenAuthModal: () => void;
  onOpenUserDashboard: () => void;
  onOpenAdminDashboard: () => void;
  onOpenVerificationModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  currentUser,
  onLanguageChange,
  onNewShipmentClick,
  onOpenAuthModal,
  onOpenUserDashboard,
  onOpenAdminDashboard,
  onOpenVerificationModal,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Cocolis<span className="text-emerald-400">.ca</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-red-600/90 text-white rounded tracking-wide uppercase">
                  🇨🇦 CA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {currentLang === 'fr' ? 'Livraison collaborative canadienne' : 'Canadian Crowdshipping Platform'}
              </p>
            </div>
          </div>

          {/* Quick Badges & Trust link */}
          <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-300">
            <button
              onClick={onOpenVerificationModal}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{currentLang === 'fr' ? 'Profils Vérifiés 🛡️' : 'Verified Profiles 🛡️'}</span>
            </button>
            <div className="flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-teal-400" />
              <span>{currentLang === 'fr' ? 'Séquestre & Code 6 chiffres' : 'Escrow & 6-digit Code'}</span>
            </div>
          </div>

          {/* Actions & User Menu */}
          <div className="flex items-center space-x-3">
            
            {/* Language Switcher Button */}
            <button
              onClick={() => onLanguageChange(currentLang === 'fr' ? 'en' : 'fr')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              title={currentLang === 'fr' ? 'Switch to English' : 'Passer en Français'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentLang === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            {/* Post Shipment Wizard Action Button */}
            <button
              onClick={onNewShipmentClick}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{currentLang === 'fr' ? 'Expédier un colis' : 'Post Shipment'}</span>
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
                >
                  <div className={`w-6 h-6 rounded-full font-black text-[11px] flex items-center justify-center ${
                    currentUser.role === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[90px] truncate hidden sm:inline">{currentUser.name}</span>
                  {currentUser.role === 'ADMIN' && (
                    <span className="px-1 py-0.2 text-[9px] bg-amber-500 text-slate-950 font-black rounded uppercase">
                      ADMIN
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 border border-slate-700 shadow-2xl z-50 text-xs space-y-1">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <span className="font-bold text-white block truncate">{currentUser.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{currentUser.email}</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenUserDashboard();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-800 text-slate-200 font-medium flex items-center space-x-2"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>{currentLang === 'fr' ? 'Mon Espace Membre' : 'My Member Area'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenVerificationModal();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left hover:bg-slate-800 text-slate-200 font-medium flex items-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{currentLang === 'fr' ? 'Vérifier mon profil' : 'Verify Profile'}</span>
                    </button>

                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenAdminDashboard();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold flex items-center space-x-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-400" />
                        <span>{currentLang === 'fr' ? 'Panneau Administration' : 'Admin Panel'}</span>
                      </button>
                    )}

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left hover:bg-red-500/10 text-red-400 font-semibold flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{currentLang === 'fr' ? 'Se déconnecter' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>{currentLang === 'fr' ? 'Connexion' : 'Sign In'}</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
