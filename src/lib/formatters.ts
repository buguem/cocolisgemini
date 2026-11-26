import { Language, ShipmentCategory } from '../types/shipment';

/**
 * Formate un montant en Dollars Canadiens (CAD) selon la langue courante (FR / EN).
 * Exemple FR: 85,00 $ CA
 * Exemple EN: $85.00 CAD
 */
export function formatCAD(amount: number, lang: Language): string {
  if (lang === 'fr') {
    return `${amount.toFixed(2).replace('.', ',')} $ CAD`;
  }
  return `$${amount.toFixed(2)} CAD`;
}

/**
 * Formate la distance en kilomètres avec affichage bilingue.
 */
export function formatDistance(distanceKm: number, lang: Language): string {
  if (lang === 'fr') {
    return `${Math.round(distanceKm)} km`;
  }
  return `${Math.round(distanceKm)} km`;
}

/**
 * Formate une date ISO en format canadien lisible.
 */
export function formatDate(dateString: string, lang: Language): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Traduction des catégories d'annonces de crowdshipping.
 */
export function getCategoryLabel(category: ShipmentCategory, lang: Language): string {
  const labels: Record<ShipmentCategory, { fr: string; en: string }> = {
    furniture: { fr: 'Meuble', en: 'Furniture' },
    electronics: { fr: 'Électronique', en: 'Electronics' },
    parcel: { fr: 'Colis / Paquet', en: 'Parcel / Package' },
    sports: { fr: 'Équipement Sportif', en: 'Sports Gear' },
    moving: { fr: 'Déménagement', en: 'Small Move' },
    auto: { fr: 'Pièce Auto / Vélo', en: 'Auto Parts / Bike' },
  };

  return labels[category]?.[lang] || category;
}
