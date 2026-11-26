import React, { useEffect, useRef, useState } from 'react';
import { Language, Shipment } from '../types/shipment';
import { formatCAD, formatDistance } from '../lib/formatters';
import L from 'leaflet';
import { Layers, Maximize2, Target } from 'lucide-react';

interface MapComponentProps {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  onSelectShipment: (shipment: Shipment) => void;
  onViewDetails: (shipment: Shipment) => void;
  currentLang: Language;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  shipments,
  selectedShipment,
  onSelectShipment,
  onViewDetails,
  currentLang,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'dark' | 'light'>('dark');

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centrer sur l'axe du Canada (Montréal / Ottawa / Toronto / Québec)
    const map = L.map(mapContainerRef.current, {
      center: [46.0, -74.5],
      zoom: 6,
      minZoom: 3,
      maxZoom: 16,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl =
      mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Mettre à jour le style de carte (Dark vs Voyager)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const newUrl =
      mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current.setUrl(newUrl);
  }, [mapStyle]);

  // Recadrer intelligemment sur le Canada ou sur le trajet sélectionné
  const handleFitRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedShipment) {
      const routeBounds = L.latLngBounds([
        [selectedShipment.origin.lat, selectedShipment.origin.lng],
        [selectedShipment.destination.lat, selectedShipment.destination.lng],
      ]);
      map.fitBounds(routeBounds, { padding: [70, 70], maxZoom: 9, animate: true });
    } else if (shipments.length > 0) {
      const bounds = L.latLngBounds([]);
      shipments.forEach((s) => {
        bounds.extend([s.origin.lat, s.origin.lng]);
        bounds.extend([s.destination.lat, s.destination.lng]);
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7, animate: true });
      }
    }
  };

  // Mettre à jour les marqueurs et polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const bounds = L.latLngBounds([]);

    shipments.forEach((shipment) => {
      const isSelected = selectedShipment?.id === shipment.id;

      const originLatLng: L.LatLngExpression = [shipment.origin.lat, shipment.origin.lng];
      const destLatLng: L.LatLngExpression = [shipment.destination.lat, shipment.destination.lng];

      bounds.extend(originLatLng);
      bounds.extend(destLatLng);

      const originIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${
            isSelected ? 'bg-emerald-400 ring-4 ring-emerald-400/40 scale-125 z-30' : 'bg-emerald-500 hover:scale-110'
          } text-slate-950 font-black shadow-lg shadow-emerald-500/30 transition-transform">
            <span class="text-xs">A</span>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const destIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${
            isSelected ? 'bg-teal-300 ring-4 ring-teal-300/40 scale-125 z-30' : 'bg-teal-500 hover:scale-110'
          } text-slate-950 font-black shadow-lg shadow-teal-500/30 transition-transform">
            <span class="text-xs">B</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const originMarker = L.marker(originLatLng, { icon: originIcon }).addTo(layerGroup);
      const destMarker = L.marker(destLatLng, { icon: destIcon }).addTo(layerGroup);

      const popupContent = document.createElement('div');
      popupContent.className = 'p-3.5 max-w-xs';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
            ${shipment.origin.city} → ${shipment.destination.city}
          </span>
          <span class="text-xs font-black text-emerald-400">
            ${formatCAD(shipment.priceCAD, currentLang)}
          </span>
        </div>
        <h4 class="text-sm font-bold text-white mb-1">
          ${shipment.title[currentLang]}
        </h4>
        <p class="text-xs text-slate-300 mb-2.5 line-clamp-2">
          ${shipment.description[currentLang]}
        </p>
        <div class="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/60 pt-2">
          <span>${formatDistance(shipment.distanceKm, currentLang)}</span>
          <button id="popup-btn-${shipment.id}" class="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold transition-colors">
            ${currentLang === 'fr' ? 'Détails & Offre' : 'Details & Offer'}
          </button>
        </div>
      `;

      popupContent.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target && target.id === `popup-btn-${shipment.id}`) {
          onViewDetails(shipment);
        }
      });

      originMarker.bindPopup(popupContent);
      destMarker.bindPopup(popupContent);

      originMarker.on('click', () => onSelectShipment(shipment));
      destMarker.on('click', () => onSelectShipment(shipment));

      const polyline = L.polyline([originLatLng, destLatLng], {
        color: isSelected ? '#22c55e' : '#64748b',
        weight: isSelected ? 4 : 2,
        opacity: isSelected ? 0.9 : 0.4,
        dashArray: isSelected ? undefined : '6, 8',
      }).addTo(layerGroup);

      if (isSelected) {
        polyline.bringToFront();
      }
    });

    // Cadrage optimisé avec contrainte maxZoom pour éviter le zoom arrière excessif
    if (selectedShipment) {
      const selectedBounds = L.latLngBounds([
        [selectedShipment.origin.lat, selectedShipment.origin.lng],
        [selectedShipment.destination.lat, selectedShipment.destination.lng],
      ]);
      map.fitBounds(selectedBounds, { padding: [70, 70], maxZoom: 9, animate: true });
    } else if (bounds.isValid() && shipments.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7, animate: true });
    }
  }, [shipments, selectedShipment, currentLang, onSelectShipment, onViewDetails]);

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-[620px] rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-2xl">
      
      {/* Container Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Indicator */}
      <div className="absolute top-4 left-4 z-[400] glass-card px-3 py-2 rounded-xl text-xs flex items-center space-x-2 border border-slate-700/80 shadow-lg pointer-events-auto">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="font-bold text-slate-100">
          {currentLang === 'fr' ? 'Carte Live OpenStreetMap' : 'Live OpenStreetMap'}
        </span>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-[400] flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={handleFitRoute}
          className="glass-card px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:text-white border border-emerald-500/30 shadow-lg flex items-center space-x-1.5 transition-colors"
          title={currentLang === 'fr' ? 'Centrer sur le trajet' : 'Center on route'}
        >
          <Target className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLang === 'fr' ? 'Centrer le trajet' : 'Fit Route'}</span>
        </button>

        <button
          onClick={() => setMapStyle(mapStyle === 'dark' ? 'light' : 'dark')}
          className="glass-card p-2 rounded-xl text-xs text-slate-300 hover:text-white border border-slate-700/80 shadow-lg transition-colors"
          title={currentLang === 'fr' ? 'Basculer thème de carte' : 'Toggle map theme'}
        >
          <Layers className="w-4 h-4 text-teal-400" />
        </button>
      </div>

      {/* Bottom Legend */}
      <div className="absolute bottom-4 left-4 z-[400] glass-card p-3 rounded-xl text-xs space-y-1.5 border border-slate-700/80 shadow-lg pointer-events-auto hidden sm:block">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-black text-slate-950">A</span>
          <span className="text-slate-300">{currentLang === 'fr' ? 'Départ (Origine)' : 'Departure (Origin)'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-teal-400 flex items-center justify-center text-[8px] font-black text-slate-950">B</span>
          <span className="text-slate-300">{currentLang === 'fr' ? 'Arrivée (Destination)' : 'Arrival (Destination)'}</span>
        </div>
      </div>

    </div>
  );
};
