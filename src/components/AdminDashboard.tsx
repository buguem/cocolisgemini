import React, { useState } from 'react';
import { UserProfile, PlatformMetrics } from '../types/auth';
import { Language, Shipment } from '../types/shipment';
import { formatCAD, formatDistance } from '../lib/formatters';
import { Shield, Users, Package, DollarSign, TrendingUp, Lock, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Search, Filter } from 'lucide-react';

interface AdminDashboardProps {
  currentLang: Language;
  currentUser: UserProfile;
  shipments: Shipment[];
  onBackToMarketplace: () => void;
  onDeleteShipment: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentLang,
  currentUser,
  shipments,
  onBackToMarketplace,
  onDeleteShipment,
}) => {
  const [usersList, setUsersList] = useState<UserProfile[]>([
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
  ]);

  const [activeTab, setActiveTab] = useState<'kpis' | 'shipments' | 'users' | 'escrow'>('kpis');
  const [userSearch, setUserSearch] = useState('');

  // Calcul des métriques globales de la plateforme canadienne
  const totalGrossVolume = shipments.reduce((sum, s) => sum + s.priceCAD, 0) + 12800;
  const totalCommissions = Math.round(totalGrossVolume * 0.08);
  const totalEscrowHeld = shipments.reduce((sum, s) => sum + s.priceCAD, 0);

  const toggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : u
      )
    );
  };

  const toggleUserRole = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' }
          : u
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Admin Header Bar */}
      <header className="glass-panel border-b border-slate-800 sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToMarketplace}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center space-x-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentLang === 'fr' ? 'Retour au site' : 'Back to site'}</span>
            </button>

            <div className="h-6 w-px bg-slate-800" />

            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold text-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <span>Panneau d'Administration Cocolis.ca</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                    PROD CA
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Gestion centralisée des annonces, utilisateurs et séquestres Stripe
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block">{currentUser.name}</span>
              <span className="text-[10px] text-amber-400 font-extrabold uppercase">SUPER ADMIN</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-lg shadow-amber-500/20">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-colors ${
              activeTab === 'kpis'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Vue d'ensemble & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-colors ${
              activeTab === 'shipments'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Modération Annonces ({shipments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-colors ${
              activeTab === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestion Utilisateurs ({usersList.length})</span>
          </button>
        </div>

        {/* Tab 1: KPIs & Financial Metrics */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Gross Volume */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Volume Brut (CAD $)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-2xl font-black text-white block">
                  {formatCAD(totalGrossVolume, currentLang)}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">+18.4% ce mois</span>
              </div>

              {/* Commissions 8% */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Revenus Cocolis (8%)</span>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-2xl font-black text-amber-400 block">
                  {formatCAD(totalCommissions, currentLang)}
                </span>
                <span className="text-[10px] text-slate-400">Commissions perçues</span>
              </div>

              {/* Escrow Held */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Séquestre Stripe Actif</span>
                  <Lock className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-2xl font-black text-teal-300 block">
                  {formatCAD(totalEscrowHeld, currentLang)}
                </span>
                <span className="text-[10px] text-teal-400 font-semibold">En cours de livraison</span>
              </div>

              {/* Total Users */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Membres Inscrits</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-2xl font-black text-white block">
                  {usersList.length + 142}
                </span>
                <span className="text-[10px] text-slate-400">100% vérifiés</span>
              </div>

            </div>

            {/* Platform Health Overview */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>État des services Cocolis.ca</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">OpenStreetMap API</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Opérationnel</span>
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Stripe Connect Escrow</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Opérationnel</span>
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Base PostgreSQL Prisma</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connecté</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Modération Annonces */}
        {activeTab === 'shipments' && (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Annonces actives sur le réseau canadien</h3>
              <span className="text-xs text-slate-400">{shipments.length} annonces</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {shipments.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {s.origin.city} → {s.destination.city}
                      </span>
                      <h4 className="text-sm font-bold text-white">{s.title[currentLang]}</h4>
                    </div>
                    <p className="text-xs text-slate-400 max-w-lg truncate">{s.description[currentLang]}</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                      <span>Poids: {s.weightKg} kg</span>
                      <span>•</span>
                      <span>Auteur: {s.senderName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-extrabold text-emerald-400">
                      {formatCAD(s.priceCAD, currentLang)}
                    </span>

                    <button
                      onClick={() => onDeleteShipment(s.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Gestion Utilisateurs */}
        {activeTab === 'users' && (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Gestion des utilisateurs Cocolis.ca</h3>
              <span className="text-xs text-slate-400">{usersList.length} comptes</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {usersList.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 font-extrabold flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{user.name}</span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-black rounded ${
                          user.role === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {user.role}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                          user.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleUserRole(user.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      {user.role === 'ADMIN' ? 'Rétrograder USER' : 'Promouvoir ADMIN'}
                    </button>

                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        user.status === 'ACTIVE'
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? 'Suspendre' : 'Activer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
