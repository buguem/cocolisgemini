import React from 'react';
import { Language, Shipment } from '../types/shipment';
import { formatCAD, formatDate, formatDistance, getCategoryLabel } from '../lib/formatters';
import { MapPin, Calendar, Weight, ArrowRight, Star, Truck, ChevronRight, Shield, MessageSquare } from 'lucide-react';

interface ShipmentCardProps {
  shipment: Shipment;
  currentLang: Language;
  isSelected: boolean;
  onSelect: (shipment: Shipment) => void;
  onViewDetails: (shipment: Shipment) => void;
  onOpenChat?: (shipment: Shipment) => void;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({
  shipment,
  currentLang,
  isSelected,
  onSelect,
  onViewDetails,
  onOpenChat,
}) => {
  return (
    <div
      onClick={() => onSelect(shipment)}
      className={`glass-card glass-card-hover rounded-2xl p-5 cursor-pointer relative overflow-hidden transition-all ${
        isSelected
          ? 'ring-2 ring-emerald-500 bg-slate-800/90 shadow-lg shadow-emerald-500/10'
          : 'hover:border-slate-700'
      }`}
    >
      {/* Top Bar: Category, Verified Badge & Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            {getCategoryLabel(shipment.category, currentLang)}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Vérifié</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 text-[10px] font-bold border border-teal-500/20 hidden sm:inline">
            🌱 {Math.round(shipment.distanceKm * 0.18)} kg CO₂ évités
          </span>
        </div>

        <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-700/60">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{shipment.senderRating.toFixed(1)}</span>
          <span className="text-slate-400 font-normal">({shipment.senderTripsCount})</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-white mb-3 line-clamp-1 group-hover:text-emerald-400 transition-colors">
        {shipment.title[currentLang]}
      </h3>

      {/* Origin -> Destination Route Banner */}
      <div className="bg-slate-900/90 rounded-xl p-3 mb-4 border border-slate-800 flex items-center justify-between">
        {/* Origin */}
        <div className="flex items-start space-x-2">
          <div className="mt-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-sm font-bold text-slate-100">{shipment.origin.city}</span>
              <span className="text-[10px] font-extrabold px-1 rounded bg-slate-800 text-slate-300">
                {shipment.origin.province}
              </span>
            </div>
            <span className="text-xs text-slate-400 block truncate max-w-[100px] sm:max-w-[120px]">
              {shipment.origin.name}
            </span>
          </div>
        </div>

        {/* Route Line */}
        <div className="flex flex-col items-center px-2">
          <span className="text-[10px] font-bold text-emerald-400">
            {formatDistance(shipment.distanceKm, currentLang)}
          </span>
          <div className="flex items-center text-slate-500">
            <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <ArrowRight className="w-3.5 h-3.5 -ml-1 text-teal-400" />
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-start space-x-2 text-right">
          <div>
            <div className="flex items-center justify-end space-x-1">
              <span className="text-[10px] font-extrabold px-1 rounded bg-slate-800 text-slate-300">
                {shipment.destination.province}
              </span>
              <span className="text-sm font-bold text-slate-100">{shipment.destination.city}</span>
            </div>
            <span className="text-xs text-slate-400 block truncate max-w-[100px] sm:max-w-[120px]">
              {shipment.destination.name}
            </span>
          </div>
          <div className="mt-0.5 w-2.5 h-2.5 rounded-full bg-teal-400 ring-4 ring-teal-400/20 shrink-0" />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-4 bg-slate-900/40 rounded-xl p-2.5">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(shipment.departureDate, currentLang)}</span>
        </div>
        <div className="flex items-center space-x-1.5 justify-end">
          <Weight className="w-3.5 h-3.5 text-slate-400" />
          <span>{shipment.weightKg} kg</span>
        </div>
        <div className="col-span-2 flex items-center space-x-1.5 text-slate-400 text-[11px]">
          <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{shipment.vehicleNeeded[currentLang]}</span>
        </div>
      </div>

      {/* Bottom Footer: Price, Chat & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            {currentLang === 'fr' ? 'Budget expéditeur' : 'Sender budget'}
          </span>
          <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
            {formatCAD(shipment.priceCAD, currentLang)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenChat && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenChat(shipment);
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Discuter"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(shipment);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30 transition-colors"
          >
            <span>{currentLang === 'fr' ? 'Détails & Offre' : 'Details'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
