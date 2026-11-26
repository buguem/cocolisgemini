import React from 'react';
import { FilterOptions, Language, ShipmentCategory } from '../types/shipment';
import { AutocompleteInput } from './AutocompleteInput';
import { Search, Tag, RotateCcw, Sparkles } from 'lucide-react';

interface SearchFormProps {
  currentLang: Language;
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onReset: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  currentLang,
  filters,
  onFilterChange,
  onReset,
}) => {

  const categories: { value: ShipmentCategory | ''; label: { fr: string; en: string } }[] = [
    { value: '', label: { fr: 'Toutes catégories', en: 'All Categories' } },
    { value: 'furniture', label: { fr: 'Meubles & Déco', en: 'Furniture & Decor' } },
    { value: 'electronics', label: { fr: 'Électronique', en: 'Electronics' } },
    { value: 'parcel', label: { fr: 'Colis & Paquets', en: 'Parcels & Boxes' } },
    { value: 'sports', label: { fr: 'Équipement Sportif', en: 'Sports Equipment' } },
    { value: 'moving', label: { fr: 'Déménagement', en: 'Small Move' } },
    { value: 'auto', label: { fr: 'Pièces Auto / Vélos', en: 'Auto Parts / Bikes' } },
  ];

  // Filtres rapides de trajets populaires
  const popularRoutes = [
    { label: 'Montréal → Québec', origin: 'Montréal', dest: 'Québec' },
    { label: 'Toronto → Ottawa', origin: 'Toronto', dest: 'Ottawa' },
    { label: 'Vancouver → Calgary', origin: 'Vancouver', dest: 'Calgary' },
  ];

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 mb-6 shadow-xl border border-slate-800 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Search Keyword Input */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder={
              currentLang === 'fr' 
                ? 'Rechercher un objet (ex: canapé, télé, vélo)...' 
                : 'Search an item (e.g. sofa, TV, bike)...'
            }
            className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          />
        </div>

        {/* Departure City Autocomplete */}
        <div className="md:col-span-3">
          <AutocompleteInput
            value={filters.originFilter}
            onChange={(val) => onFilterChange({ ...filters, originFilter: val })}
            placeholder={currentLang === 'fr' ? 'Départ (ex: Montréal, QC)' : 'Departure (e.g. Montreal, QC)'}
            iconColor="text-emerald-400"
          />
        </div>

        {/* Arrival City Autocomplete */}
        <div className="md:col-span-3">
          <AutocompleteInput
            value={filters.destinationFilter}
            onChange={(val) => onFilterChange({ ...filters, destinationFilter: val })}
            placeholder={currentLang === 'fr' ? 'Arrivée (ex: Québec, QC)' : 'Arrival (e.g. Quebec, QC)'}
            iconColor="text-teal-400"
          />
        </div>

        {/* Category Select & Reset */}
        <div className="md:col-span-2 flex items-center space-x-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="w-full pl-9 pr-7 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-slate-900 text-slate-100">
                  {cat.label[currentLang]}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onReset}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
            title={currentLang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Quick Filter Route Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
        <span className="text-slate-400 font-semibold flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{currentLang === 'fr' ? 'Axes populaires :' : 'Popular axes:'}</span>
        </span>
        {popularRoutes.map((route) => (
          <button
            key={route.label}
            onClick={() =>
              onFilterChange({
                ...filters,
                originFilter: route.origin,
                destinationFilter: route.dest,
              })
            }
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700/60 hover:border-emerald-500/30 transition-colors text-[11px] font-medium"
          >
            {route.label}
          </button>
        ))}
      </div>
    </div>
  );
};
