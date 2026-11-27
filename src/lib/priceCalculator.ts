/**
 * Moteur de calcul du prix suggéré et des commissions Cocolis Canada V2
 * Formule adaptée au marché canadien et aux longues distances.
 */

export interface PriceCalculationParams {
  distanceKm: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
}

export interface PriceCalculationResult {
  suggestedPriceCAD: number;
  minPriceCAD: number;
  maxPriceCAD: number;
  platformFeeCAD: number; // 15% Cocolis
  transporterPayoutCAD: number; // 85% Conducteur
  volumeM3: number;
}

export const PLATFORM_COMMISSION_RATE = 0.15; // 15% selon section 2.3 du cahier des charges V2

/**
 * Calcule la distance routière estimée (km) entre 2 coordonnées GPS (formule de Haversine × facteur routier 1.18)
 */
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Rayon terrestre moyen en km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const straightKm = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(10, Math.round(straightKm * 1.18));
}

export function calculateSuggestedPrice({
  distanceKm,
  lengthCm,
  widthCm,
  heightCm,
  weightKg,
}: PriceCalculationParams): PriceCalculationResult {
  // Volume en mètres cubes
  const volumeM3 = (lengthCm * widthCm * heightCm) / 1_000_000;

  // Tarification de base canadienne
  const basePrice = 25; // Prise en charge initiale

  // Composante distance (environ 0.14 $ CAD par km pour les trajets interurbains)
  const distanceCost = distanceKm * 0.14;

  // Composante volume (encombrement dans le véhicule)
  const volumeCost = volumeM3 * 40;

  // Composante manutention / poids
  const weightCost = weightKg * 0.65;

  // Calcul du prix brut arrondi
  const rawPrice = basePrice + distanceCost + volumeCost + weightCost;
  const suggestedPriceCAD = Math.max(30, Math.round(rawPrice / 5) * 5); // Arrondi au 5$ le plus proche

  const minPriceCAD = Math.max(25, Math.round(suggestedPriceCAD * 0.75));
  const maxPriceCAD = Math.round(suggestedPriceCAD * 1.35);

  // Commission 15%
  const platformFeeCAD = Math.round(suggestedPriceCAD * PLATFORM_COMMISSION_RATE);
  const transporterPayoutCAD = suggestedPriceCAD - platformFeeCAD;

  return {
    suggestedPriceCAD,
    minPriceCAD,
    maxPriceCAD,
    platformFeeCAD,
    transporterPayoutCAD,
    volumeM3: parseFloat(volumeM3.toFixed(2)),
  };
}

/**
 * Calcule les frais de séquestre pour un montant donné
 */
export function calculateEscrowBreakdown(totalAmountCAD: number) {
  const platformFee = Math.round(totalAmountCAD * PLATFORM_COMMISSION_RATE);
  const transporterPayout = totalAmountCAD - platformFee;

  return {
    totalAmountCAD,
    platformFee,
    transporterPayout,
    commissionRatePercent: 15,
  };
}
