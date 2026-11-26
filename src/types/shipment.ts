/**
 * Types TypeScript pour la plateforme Cocolis.ca
 */

export type Language = 'fr' | 'en';

export type CanadianProvince = 
  | 'QC' // Québec
  | 'ON' // Ontario
  | 'BC' // Colombie-Britannique
  | 'AB' // Alberta
  | 'MB' // Manitoba
  | 'SK' // Saskatchewan
  | 'NS' // Nouvelle-Écosse
  | 'NB' // Nouveau-Brunswick
  | 'NL' // Terre-Neuve-et-Labrador
  | 'PE' // Île-du-Prince-Édouard
  | 'NT' // Territoires du Nord-Ouest
  | 'YT' // Yukon
  | 'NU'; // Nunavut

export interface CanadianLocation {
  name: string;
  city: string;
  province: CanadianProvince;
  lat: number;
  lng: number;
  postalCode?: string;
}

export type ShipmentCategory = 'furniture' | 'electronics' | 'parcel' | 'sports' | 'moving' | 'auto';

export interface Shipment {
  id: string;
  title: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  origin: CanadianLocation;
  destination: CanadianLocation;
  priceCAD: number;
  weightKg: number;
  dimensions: string; // Ex: "120 x 80 x 50 cm"
  departureDate: string; // ISO String format YYYY-MM-DD
  flexibleDate: boolean;
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'DELIVERED';
  senderName: string;
  senderRating: number;
  senderTripsCount: number;
  category: ShipmentCategory;
  vehicleNeeded: {
    fr: string;
    en: string;
  };
  distanceKm: number;
}

export interface FilterOptions {
  searchQuery: string;
  originFilter: string;
  destinationFilter: string;
  category: string;
  minPrice: number;
  maxPrice: number;
}
