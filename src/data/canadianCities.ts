import { CanadianProvince } from '../types/shipment';

export interface CanadianCityOption {
  city: string;
  province: CanadianProvince;
  regionName: string; // Ex: "Communauté métropolitaine de Montréal"
  lat: number;
  lng: number;
  popular?: boolean;
}

export const CANADIAN_CITIES: CanadianCityOption[] = [
  // Québec (QC)
  { city: 'Montréal', province: 'QC', regionName: 'Grand Montréal', lat: 45.5017, lng: -73.5673, popular: true },
  { city: 'Québec', province: 'QC', regionName: 'Capitale-Nationale', lat: 46.8139, lng: -71.2080, popular: true },
  { city: 'Laval', province: 'QC', regionName: 'Région de Laval', lat: 45.5758, lng: -73.7531 },
  { city: 'Gatineau', province: 'QC', regionName: 'Outaouais / RCN', lat: 45.4287, lng: -75.7133, popular: true },
  { city: 'Longueuil', province: 'QC', regionName: 'Rive-Sud de Montréal', lat: 45.5312, lng: -73.5181 },
  { city: 'Sherbrooke', province: 'QC', regionName: 'Estrie', lat: 45.4042, lng: -71.8929, popular: true },
  { city: 'Trois-Rivières', province: 'QC', regionName: 'Mauricie', lat: 46.3432, lng: -72.5430, popular: true },
  { city: 'Saguenay', province: 'QC', regionName: 'Saguenay-Lac-Saint-Jean', lat: 48.4284, lng: -71.0686 },
  { city: 'Saint-Jean-sur-Richelieu', province: 'QC', regionName: 'Montérégie', lat: 45.3057, lng: -73.2534 },
  { city: 'Drummondville', province: 'QC', regionName: 'Centre-du-Québec', lat: 45.8833, lng: -72.4833 },
  { city: 'Rimouski', province: 'QC', regionName: 'Bas-Saint-Laurent', lat: 48.4488, lng: -68.5239 },
  { city: 'Saint-Jérôme', province: 'QC', regionName: 'Laurentides', lat: 45.7806, lng: -74.0039 },

  // Ontario (ON)
  { city: 'Toronto', province: 'ON', regionName: 'Greater Toronto Area (GTA)', lat: 43.6532, lng: -79.3832, popular: true },
  { city: 'Ottawa', province: 'ON', regionName: 'National Capital Region', lat: 45.4215, lng: -75.6972, popular: true },
  { city: 'Mississauga', province: 'ON', regionName: 'Peel Region', lat: 43.5890, lng: -79.6441 },
  { city: 'Brampton', province: 'ON', regionName: 'Peel Region', lat: 43.7315, lng: -79.7624 },
  { city: 'Hamilton', province: 'ON', regionName: 'Golden Horseshoe', lat: 43.2557, lng: -79.8711, popular: true },
  { city: 'London', province: 'ON', regionName: 'Southwestern Ontario', lat: 42.9849, lng: -81.2453 },
  { city: 'Markham', province: 'ON', regionName: 'York Region', lat: 43.8561, lng: -79.3370 },
  { city: 'Kitchener', province: 'ON', regionName: 'Waterloo Region', lat: 43.4516, lng: -80.4925 },
  { city: 'Kingston', province: 'ON', regionName: 'Eastern Ontario', lat: 44.2312, lng: -76.4860 },
  { city: 'Windsor', province: 'ON', regionName: 'Essex County', lat: 42.3149, lng: -83.0364 },

  // Colombie-Britannique (BC)
  { city: 'Vancouver', province: 'BC', regionName: 'Metro Vancouver', lat: 49.2827, lng: -123.1207, popular: true },
  { city: 'Surrey', province: 'BC', regionName: 'Metro Vancouver', lat: 49.1913, lng: -122.8490 },
  { city: 'Burnaby', province: 'BC', regionName: 'Metro Vancouver', lat: 49.2488, lng: -122.9805 },
  { city: 'Victoria', province: 'BC', regionName: 'Vancouver Island', lat: 48.4284, lng: -123.3656, popular: true },
  { city: 'Kelowna', province: 'BC', regionName: 'Okanagan Valley', lat: 49.8880, lng: -119.4960 },

  // Alberta (AB)
  { city: 'Calgary', province: 'AB', regionName: 'Calgary Metropolitan Region', lat: 51.0447, lng: -114.0719, popular: true },
  { city: 'Edmonton', province: 'AB', regionName: 'Edmonton Metropolitan Region', lat: 53.5461, lng: -113.4938, popular: true },
  { city: 'Red Deer', province: 'AB', regionName: 'Central Alberta', lat: 52.2681, lng: -113.8111 },
  { city: 'Banff', province: 'AB', regionName: 'Rocky Mountains', lat: 51.1784, lng: -115.5708 },

  // Autres provinces
  { city: 'Winnipeg', province: 'MB', regionName: 'Winnipeg Capital Region', lat: 49.8951, lng: -97.1384, popular: true },
  { city: 'Saskatoon', province: 'SK', regionName: 'Central Saskatchewan', lat: 52.1332, lng: -106.6700 },
  { city: 'Regina', province: 'SK', regionName: 'Southern Saskatchewan', lat: 50.4452, lng: -104.6189 },
  { city: 'Halifax', province: 'NS', regionName: 'Halifax Regional Municipality', lat: 44.6488, lng: -63.5752, popular: true },
  { city: 'Moncton', province: 'NB', regionName: 'Westmorland County', lat: 46.0878, lng: -64.7782 },
  { city: 'Fredericton', province: 'NB', regionName: 'York County', lat: 45.9636, lng: -66.6431 },
  { city: 'St. John\'s', province: 'NL', regionName: 'Avalon Peninsula', lat: 47.5615, lng: -52.7126 },
  { city: 'Charlottetown', province: 'PE', regionName: 'Queens County', lat: 46.2382, lng: -63.1311 },
];
