import React, { useState, useEffect, useRef } from 'react';
import { CANADIAN_CITIES, CanadianCityOption } from '../data/canadianCities';
import { CanadianProvince } from '../types/shipment';
import { MapPin, X, Sparkles, Navigation } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string, selectedCityObj?: CanadianCityOption) => void;
  placeholder: string;
  iconColor?: string;
  className?: string;
  label?: string;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  iconColor = 'text-emerald-400',
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CanadianCityOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrer les suggestions lors du changement de valeur
  useEffect(() => {
    if (!value.trim()) {
      // Montrer les villes populaires par défaut
      setSuggestions(CANADIAN_CITIES.filter((c) => c.popular));
      return;
    }

    const query = value.toLowerCase().trim();
    const filtered = CANADIAN_CITIES.filter(
      (c) =>
        c.city.toLowerCase().includes(query) ||
        c.province.toLowerCase().includes(query) ||
        c.regionName.toLowerCase().includes(query)
    ).slice(0, 7); // Max 7 suggestions

    setSuggestions(filtered);
    setHighlightedIndex(-1);
  }, [value]);

  // Fermer la liste déroulante lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cityObj: CanadianCityOption) => {
    onChange(`${cityObj.city}, ${cityObj.province}`, cityObj);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
          <MapPin className={`w-3.5 h-3.5 ${iconColor}`} />
          <span>{label}</span>
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Navigation className={`h-4 w-4 ${iconColor}`} />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(true);
            }}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 glass-panel rounded-xl overflow-hidden border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 bg-slate-900/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 flex items-center justify-between">
            <span>{value ? 'Suggestions de villes canadiennes' : 'Villes & Hubs populaires'}</span>
            <Sparkles className="w-3 h-3 text-emerald-400" />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50">
            {suggestions.map((item, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={`${item.city}-${item.province}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                    isHighlighted ? 'bg-emerald-500/20 text-white' : 'hover:bg-slate-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1 rounded bg-slate-800 text-emerald-400 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center space-x-1.5">
                        <span>{item.city}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-emerald-400 uppercase">
                          {item.province}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">{item.regionName}</span>
                    </div>
                  </div>

                  {item.popular && (
                    <span className="text-[10px] font-semibold text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Hub CA
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
