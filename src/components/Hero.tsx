import React from 'react';
import { Language } from '../types/shipment';
import { MapPin, ShieldCheck, Map, Leaf } from 'lucide-react';

interface HeroProps {
  currentLang: Language;
  totalShipmentsCount: number;
}

export const Hero: React.FC<HeroProps> = ({ currentLang, totalShipmentsCount }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
          <Leaf className="w-3.5 h-3.5" />
          <span>
            {currentLang === 'fr' 
              ? 'Livraison 100% collaborative & écoresponsable au Canada' 
              : '100% Collaborative & Eco-friendly Shipping across Canada'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          {currentLang === 'fr' ? (
            <>
              Envoyez ou transportez des objets partout au <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">Canada</span>
            </>
          ) : (
            <>
              Ship or Transport Items Anywhere in <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">Canada</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
          {currentLang === 'fr'
            ? 'Rentabilisez vos trajets en voiture en transportant des colis pour des particuliers, ou faites livrer vos objets volumineux au meilleur prix.'
            : 'Make your road trips profitable by carrying parcels for locals, or get your large items shipped at unbeatable rates.'}
        </p>

        {/* Key Features Pill Stats */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{totalShipmentsCount} {currentLang === 'fr' ? 'Trajets disponibles' : 'Active shipments'}</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>{currentLang === 'fr' ? 'Assurance Cocolis incluse' : 'Cocolis Insurance included'}</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <Map className="w-4 h-4 text-emerald-400" />
            <span>{currentLang === 'fr' ? 'Carte Live OpenStreetMap' : 'Live Interactive Map'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
