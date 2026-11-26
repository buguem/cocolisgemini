import React, { useState } from 'react';
import { UserProfile } from '../types/auth';
import { Language } from '../types/shipment';
import { X, LogIn, UserPlus, Shield, UserCheck, Sparkles, Lock, Mail, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  currentLang: Language;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

// Comptes de démonstration prêts à l'emploi
const DEMO_USERS: UserProfile[] = [
  {
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
  },
  {
    id: 'user-marc',
    name: 'Marc-André Roy',
    email: 'marc.roy@cocolis.ca',
    role: 'USER',
    rating: 5.0,
    completedTrips: 28,
    joinedDate: '2024-11-02',
    escrowBalanceCAD: 580.00,
    totalEarnedCAD: 3450.00,
    status: 'ACTIVE',
  },
  {
    id: 'admin-canada',
    name: 'Administrateur Cocolis.ca',
    email: 'admin@cocolis.ca',
    role: 'ADMIN',
    rating: 5.0,
    completedTrips: 120,
    joinedDate: '2024-01-01',
    escrowBalanceCAD: 12450.00,
    totalEarnedCAD: 89400.00,
    status: 'ACTIVE',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentLang,
  onClose,
  onLogin,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: fullName || email.split('@')[0],
      email: email,
      role: 'USER',
      rating: 5.0,
      completedTrips: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      escrowBalanceCAD: 0,
      totalEarnedCAD: 0,
      status: 'ACTIVE',
    };

    onLogin(newUser);
    onClose();
  };

  const handleDemoSelect = (user: UserProfile) => {
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold">
              {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {isRegister
                  ? currentLang === 'fr' ? 'Créer un compte Cocolis.ca' : 'Create Cocolis.ca Account'
                  : currentLang === 'fr' ? 'Espace Connexion' : 'Member Sign In'}
              </h2>
              <p className="text-xs text-slate-400">
                {currentLang === 'fr' ? 'Accédez à vos expéditions et votre portefeuille' : 'Access your shipments and wallet'}
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

        <div className="p-6 space-y-6">
          
          {/* Quick Demo Login Preset Buttons */}
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{currentLang === 'fr' ? 'Connexion démo rapide en 1 clic' : 'Quick 1-click Demo Login'}</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleDemoSelect(user)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between border transition-all ${
                    user.role === 'ADMIN'
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center ${
                      user.role === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center space-x-1.5">
                        <span>{user.name}</span>
                        {user.role === 'ADMIN' && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-amber-500 text-slate-950 font-black rounded uppercase">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{user.email}</span>
                    </div>
                  </div>

                  <UserCheck className="w-4 h-4 opacity-70" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase text-slate-500 font-bold absolute">
              {currentLang === 'fr' ? 'Ou avec courriel' : 'Or with email'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentLang === 'fr' ? 'Nom complet' : 'Full Name'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ex: Jean Tremblay"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentLang === 'fr' ? 'Adresse Courriel' : 'Email Address'}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.courriel@exemple.ca"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentLang === 'fr' ? 'Mot de passe' : 'Password'}</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-transform transform active:scale-95 flex items-center justify-center space-x-2"
            >
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>
                {isRegister
                  ? currentLang === 'fr' ? 'S\'inscrire sur Cocolis.ca' : 'Register on Cocolis.ca'
                  : currentLang === 'fr' ? 'Se connecter' : 'Sign In'}
              </span>
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              {isRegister
                ? currentLang === 'fr' ? 'Déjà membre ? Connectez-vous' : 'Already a member? Sign In'
                : currentLang === 'fr' ? 'Pas encore de compte ? S\'inscrire' : 'No account yet? Register'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
