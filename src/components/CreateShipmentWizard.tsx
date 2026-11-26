import React, { useState, useEffect } from 'react';
import { Language, Shipment, ShipmentCategory, CanadianProvince } from '../types/shipment';
import { AutocompleteInput } from './AutocompleteInput';
import { CanadianCityOption } from '../data/canadianCities';
import { calculateSuggestedPrice } from '../lib/priceCalculator';
import { formatCAD } from '../lib/formatters';
import {
  X,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Camera,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Building,
  Info,
  Layers,
} from 'lucide-react';

interface CreateShipmentWizardProps {
  isOpen: boolean;
  currentLang: Language;
  onClose: () => void;
  onAddShipment: (shipment: Shipment) => void;
}

// Photos de démonstration par catégorie
const DEFAULT_CATEGORY_PHOTOS: Record<ShipmentCategory, string[]> = {
  furniture: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80'],
  electronics: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80'],
  parcel: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80'],
  sports: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80'],
  moving: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&auto=format&fit=crop&q=80'],
  auto: ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80'],
};

export const CreateShipmentWizard: React.FC<CreateShipmentWizardProps> = ({
  isOpen,
  currentLang,
  onClose,
  onAddShipment,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Étape 1 : Objet & Dimensions
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ShipmentCategory>('furniture');
  const [lengthCm, setLengthCm] = useState<number>(120);
  const [widthCm, setWidthCm] = useState<number>(80);
  const [heightCm, setHeightCm] = useState<number>(75);
  const [weightKg, setWeightKg] = useState<number>(25);
  const [description, setDescription] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
  ]);

  // Étape 2 : Trajet Canadien
  const [originInput, setOriginInput] = useState('Montréal, QC');
  const [originObj, setOriginObj] = useState<CanadianCityOption | undefined>(undefined);
  const [originPostal, setOriginPostal] = useState('H2X 1Y4');
  const [originFloor, setOriginFloor] = useState('RDC');
  const [originElevator, setOriginElevator] = useState(true);

  const [destInput, setDestInput] = useState('Québec, QC');
  const [destObj, setDestObj] = useState<CanadianCityOption | undefined>(undefined);
  const [destPostal, setDestPostal] = useState('G1R 2J7');
  const [destFloor, setDestFloor] = useState('2ème étage');
  const [destElevator, setDestElevator] = useState(false);

  // État d'analyse IA Photo-to-Quote
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiDetectedSuccess, setAiDetectedSuccess] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'home' | 'depanneur_relay'>('home');

  // Étape 3 : Dates & Budget
  const [desiredDate, setDesiredDate] = useState('2026-09-20');
  const [isFlexible, setIsFlexible] = useState(true);
  const [budgetMax, setBudgetMax] = useState<number>(95);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAiScan = () => {
    setIsAiScanning(true);
    setAiDetectedSuccess(false);
    setTimeout(() => {
      setIsAiScanning(false);
      setAiDetectedSuccess(true);
      setTitle('Canapé 3 places vintage en velours');
      setCategory('furniture');
      setLengthCm(200);
      setWidthCm(90);
      setHeightCm(85);
      setWeightKg(45);
      setDescription('Canapé 3 places scanné par IA Cocolis Vision. Très bon état, nécessite un SUV ou une camionnette.');
    }, 1400);
  };

  // Calcul de la distance et du prix suggéré automatique
  const approxDistanceKm = 255; // Distance estimée entre les 2 villes
  const priceCalculation = calculateSuggestedPrice({
    distanceKm: approxDistanceKm,
    lengthCm,
    widthCm,
    heightCm,
    weightKg,
  });

  // Met à jour le budget recommandé lorsque les dimensions changent
  useEffect(() => {
    setBudgetMax(priceCalculation.suggestedPriceCAD);
  }, [lengthCm, widthCm, heightCm, weightKg]);

  // Met à jour la photo par défaut si la catégorie change
  useEffect(() => {
    if (DEFAULT_CATEGORY_PHOTOS[category]) {
      setPhotoUrls(DEFAULT_CATEGORY_PHOTOS[category]);
    }
  }, [category]);

  if (!isOpen) return null;

  const handleFinish = () => {
    const originCity = originObj?.city || originInput.split(',')[0].trim() || 'Montréal';
    const originProvince: CanadianProvince = originObj?.province || 'QC';

    const destCity = destObj?.city || destInput.split(',')[0].trim() || 'Québec';
    const destProvince: CanadianProvince = destObj?.province || 'QC';

    const newShipment: Shipment = {
      id: `shipment-${Date.now()}`,
      title: {
        fr: title || (currentLang === 'fr' ? 'Colis à expédier' : 'Shipment to deliver'),
        en: title || 'Shipment to deliver',
      },
      description: {
        fr: description || 'Livraison collaborative via Cocolis Canada.',
        en: description || 'Collaborative shipping via Cocolis Canada.',
      },
      origin: {
        name: `${originCity} (${originPostal}) - ${originFloor} ${originElevator ? '(Ascenseur)' : ''}`,
        city: originCity,
        province: originProvince,
        lat: originObj?.lat || 45.5017,
        lng: originObj?.lng || -73.5673,
        postalCode: originPostal,
      },
      destination: {
        name: `${destCity} (${destPostal}) - ${destFloor} ${destElevator ? '(Ascenseur)' : ''}`,
        city: destCity,
        province: destProvince,
        lat: destObj?.lat || 46.8139,
        lng: destObj?.lng || -71.2080,
        postalCode: destPostal,
      },
      priceCAD: budgetMax,
      weightKg: weightKg,
      dimensions: `${lengthCm} x ${widthCm} x ${heightCm} cm`,
      departureDate: desiredDate,
      flexibleDate: isFlexible,
      status: 'AVAILABLE',
      senderName: 'Vous (Profil Vérifié 🛡️)',
      senderRating: 5.0,
      senderTripsCount: 1,
      category: category,
      vehicleNeeded: {
        fr: 'SUV, Fourgonnette ou Coffre spacieux',
        en: 'SUV, Minivan or Spacious trunk',
      },
      distanceKm: approxDistanceKm,
    };

    setIsSubmitted(true);
    setTimeout(() => {
      onAddShipment(newShipment);
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header avec stepper */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                Wizard V2
              </span>
              <h2 className="text-lg font-extrabold text-white">
                {currentLang === 'fr' ? 'Créer une Annonce en 4 Étapes' : 'Post Shipment in 4 Steps'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Étape {step} sur 4 : {
                step === 1 ? (currentLang === 'fr' ? 'Objet & Photos' : 'Item & Photos') :
                step === 2 ? (currentLang === 'fr' ? 'Trajet Canadien' : 'Canadian Route') :
                step === 3 ? (currentLang === 'fr' ? 'Dates & Prix Suggéré' : 'Dates & Suggested Price') :
                (currentLang === 'fr' ? 'Récapitulatif' : 'Summary')
              }
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre de progression des 4 étapes */}
        <div className="grid grid-cols-4 border-b border-slate-800 text-[11px] font-bold text-center bg-slate-900/40">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`py-2 border-b-2 transition-colors ${
                step >= i ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-500'
              }`}
            >
              Étape {i}
            </div>
          ))}
        </div>

        {/* Corps du Wizard */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {isSubmitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-extrabold text-white">
                {currentLang === 'fr' ? 'Annonce publiée avec succès !' : 'Listing Published Successfully!'}
              </h3>
              <p className="text-xs text-slate-300">
                {currentLang === 'fr' 
                  ? 'Votre expédition est désormais visible sur la carte live du Canada.' 
                  : 'Your shipment is now visible on the Canadian live map.'}
              </p>
            </div>
          ) : (
            <>
              {/* ÉTAPE 1 : OBJET & PHOTOS */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  
                  {/* Innovation 1 : IA Photo-to-Quote Scanner */}
                  <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 p-4 rounded-2xl border border-emerald-500/40 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-white block">
                            Innovation Cocolis Vision (IA Photo-to-Quote)
                          </span>
                          <span className="text-[11px] text-emerald-300/80">
                            Estimez automatiquement les dimensions et le tarif depuis la photo
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAiScan}
                        disabled={isAiScanning}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-transform transform active:scale-95 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {isAiScanning ? 'Analyse IA en cours...' : '⚡ Scanner la photo'}
                      </button>
                    </div>

                    {isAiScanning && (
                      <div className="flex items-center space-x-2 text-xs text-emerald-400 animate-pulse bg-emerald-500/10 p-2.5 rounded-xl">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>L'IA analyse les volumes, les angles et la densité de l'objet...</span>
                      </div>
                    )}

                    {aiDetectedSuccess && (
                      <div className="bg-emerald-500/20 border border-emerald-500/40 p-2.5 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong>Objet détecté (98% confiance) :</strong> Canapé 3 places • 1.53 m³ • Coffre SUV/Camionnette requis • Pré-remplissage effectué !
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      {currentLang === 'fr' ? 'Titre de l\'objet *' : 'Item Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={currentLang === 'fr' ? 'ex: Canapé 3 places vintage en cuir' : 'e.g. 3-seater vintage leather sofa'}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {currentLang === 'fr' ? 'Catégorie *' : 'Category *'}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ShipmentCategory)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="furniture">Meubles & Déco</option>
                        <option value="electronics">Électronique & Électroménager</option>
                        <option value="parcel">Colis & Cartons</option>
                        <option value="sports">Équipement Sportif / Vélo</option>
                        <option value="moving">Petit Déménagement</option>
                        <option value="auto">Pièces Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {currentLang === 'fr' ? 'Poids estimé (kg) *' : 'Estimated Weight (kg) *'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={weightKg}
                        onChange={(e) => setWeightKg(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Dimensions L x l x h */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">
                      {currentLang === 'fr' ? 'Dimensions de l\'objet (cm)' : 'Item Dimensions (cm)'}
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Longueur (L)</span>
                        <input
                          type="number"
                          value={lengthCm}
                          onChange={(e) => setLengthCm(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Largeur (l)</span>
                        <input
                          type="number"
                          value={widthCm}
                          onChange={(e) => setWidthCm(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Hauteur (h)</span>
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white text-center"
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 block text-right pt-1">
                      Volume calculé : <strong className="text-white">{priceCalculation.volumeM3} m³</strong>
                    </span>
                  </div>

                  {/* Photos Upload Preview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentLang === 'fr' ? 'Photos de l\'objet' : 'Item Photos'}</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      {photoUrls.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                          <img src={url} alt="Aperçu" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-20 h-20 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-400 text-xs cursor-pointer hover:border-emerald-500 transition-colors">
                        <Camera className="w-5 h-5 mb-1 text-slate-500" />
                        <span className="text-[10px]">Ajouter</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : TRAJET CANADIEN */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  
                  {/* Innovation 3 : Mode de Livraison Domicile vs Dépanneur Relais */}
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Mode de livraison au Canada :
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryMode('home')}
                        className={`p-3 rounded-xl text-left border transition-colors ${
                          deliveryMode === 'home'
                            ? 'bg-emerald-500/20 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Building className="w-4 h-4 mb-1 text-emerald-400" />
                        <span className="text-xs font-bold block">À Domicile</span>
                        <span className="text-[10px] text-slate-400">Remise en main propre</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMode('depanneur_relay')}
                        className={`p-3 rounded-xl text-left border transition-colors ${
                          deliveryMode === 'depanneur_relay'
                            ? 'bg-emerald-500/20 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-sm mb-1 block">🍁 Relais Partenaire</span>
                        <span className="text-xs font-bold block">Dépanneur Relais</span>
                        <span className="text-[10px] text-slate-400">Couche-Tard & Dépanneurs</span>
                      </button>
                    </div>
                  </div>

                  {/* Origin */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 uppercase tracking-wider">
                      <MapPin className="w-4 h-4" />
                      <span>{currentLang === 'fr' ? 'Point de Départ (Canada)' : 'Origin Point (Canada)'}</span>
                    </span>

                    <AutocompleteInput
                      value={originInput}
                      onChange={(val, obj) => {
                        setOriginInput(val);
                        setOriginObj(obj);
                      }}
                      placeholder="Ville de départ (ex: Montréal, QC)"
                      iconColor="text-emerald-400"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Code Postal</span>
                        <input
                          type="text"
                          value={originPostal}
                          onChange={(e) => setOriginPostal(e.target.value)}
                          placeholder="H2X 1Y4"
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white uppercase"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Étage</span>
                        <input
                          type="text"
                          value={originFloor}
                          onChange={(e) => setOriginFloor(e.target.value)}
                          placeholder="RDC"
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Ascenseur ?</span>
                        <select
                          value={originElevator ? 'yes' : 'no'}
                          onChange={(e) => setOriginElevator(e.target.value === 'yes')}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white cursor-pointer"
                        >
                          <option value="yes">Oui</option>
                          <option value="no">Non</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-teal-300 flex items-center space-x-1.5 uppercase tracking-wider">
                      <MapPin className="w-4 h-4" />
                      <span>{currentLang === 'fr' ? 'Point d\'Arrivée (Canada)' : 'Destination Point (Canada)'}</span>
                    </span>

                    <AutocompleteInput
                      value={destInput}
                      onChange={(val, obj) => {
                        setDestInput(val);
                        setDestObj(obj);
                      }}
                      placeholder="Ville d'arrivée (ex: Québec, QC)"
                      iconColor="text-teal-400"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Code Postal</span>
                        <input
                          type="text"
                          value={destPostal}
                          onChange={(e) => setDestPostal(e.target.value)}
                          placeholder="G1R 2J7"
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-white uppercase"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Étage</span>
                        <input
                          type="text"
                          value={destFloor}
                          onChange={(e) => setDestFloor(e.target.value)}
                          placeholder="2ème étage"
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Ascenseur ?</span>
                        <select
                          value={destElevator ? 'yes' : 'no'}
                          onChange={(e) => setDestElevator(e.target.value === 'yes')}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white cursor-pointer"
                        >
                          <option value="yes">Oui</option>
                          <option value="no">Non</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : DATES & PRIX SUGGÉRÉ */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Date souhaitée */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {currentLang === 'fr' ? 'Date souhaitée de départ *' : 'Desired Departure Date *'}
                      </label>
                      <input
                        type="date"
                        required
                        value={desiredDate}
                        onChange={(e) => setDesiredDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {currentLang === 'fr' ? 'Flexibilité de date' : 'Date Flexibility'}
                      </label>
                      <select
                        value={isFlexible ? 'flex' : 'strict'}
                        onChange={(e) => setIsFlexible(e.target.value === 'flex')}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="flex">{currentLang === 'fr' ? 'À +/- 2 jours près' : 'Flexible (+/- 2 days)'}</option>
                        <option value="strict">{currentLang === 'fr' ? 'Date exacte stricte' : 'Exact date only'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Encadré Moteur de Prix Suggéré */}
                  <div className="bg-gradient-to-tr from-emerald-950/60 to-slate-900 p-5 rounded-2xl border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>{currentLang === 'fr' ? 'Prix Suggéré Automatique' : 'Suggested Price Engine'}</span>
                      </span>
                      <span className="text-2xl font-black text-emerald-400">
                        {formatCAD(priceCalculation.suggestedPriceCAD, currentLang)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Basé sur la distance ({approxDistanceKm} km), le volume ({priceCalculation.volumeM3} m³) et le poids ({weightKg} kg).
                    </p>

                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
                      <span>Gains estimés du conducteur (85%) : <strong className="text-white">{formatCAD(priceCalculation.transporterPayoutCAD, currentLang)}</strong></span>
                      <span>Commission Cocolis (15%) : <strong className="text-white">{formatCAD(priceCalculation.platformFeeCAD, currentLang)}</strong></span>
                    </div>
                  </div>

                  {/* Budget Max Fixé par l'expéditeur */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      {currentLang === 'fr' ? 'Votre Budget Maximum (CAD $)' : 'Your Maximum Budget (CAD $)'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400 font-bold">$</div>
                      <input
                        type="number"
                        min={20}
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-extrabold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : RÉCAPITULATIF */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-base font-extrabold text-white">{title || 'Canapé vintage'}</h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Trajet</span>
                        <strong className="text-white">{originInput} → {destInput}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Budget Proposé</span>
                        <strong className="text-emerald-400 text-sm">{formatCAD(budgetMax, currentLang)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Dimensions & Poids</span>
                        <span>{lengthCm}x{widthCm}x{heightCm} cm ({weightKg} kg)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Date Prévue</span>
                        <span>{desiredDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {currentLang === 'fr'
                        ? 'Votre annonce sera visible par des centaines de conducteurs faisant déjà ce trajet au Canada.'
                        : 'Your listing will be visible to travelers already driving this Canadian route.'}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer avec Boutons Précédent / Suivant */}
        {!isSubmitted && (
          <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'fr' ? 'Précédent' : 'Back'}</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <span>{currentLang === 'fr' ? 'Suivant' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs flex items-center space-x-1.5 transition-transform transform active:scale-95 shadow-xl shadow-emerald-500/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>{currentLang === 'fr' ? 'Publier mon annonce' : 'Publish Listing'}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
