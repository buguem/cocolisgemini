import React, { useState } from 'react';
import { Language, Shipment, ShipmentCategory, CanadianProvince } from '../types/shipment';
import { AutocompleteInput } from './AutocompleteInput';
import { CanadianCityOption } from '../data/canadianCities';
import { X, PackagePlus, MapPin, DollarSign, Calendar, Weight, Truck, Tag, CheckCircle2, Sparkles } from 'lucide-react';

interface NewShipmentModalProps {
  isOpen: boolean;
  currentLang: Language;
  onClose: () => void;
  onAddShipment: (newShipment: Shipment) => void;
}

export const NewShipmentModal: React.FC<NewShipmentModalProps> = ({
  isOpen,
  currentLang,
  onClose,
  onAddShipment,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [originInput, setOriginInput] = useState('');
  const [originObj, setOriginObj] = useState<CanadianCityOption | undefined>(undefined);
  
  const [destinationInput, setDestinationInput] = useState('');
  const [destinationObj, setDestinationObj] = useState<CanadianCityOption | undefined>(undefined);

  const [category, setCategory] = useState<ShipmentCategory>('parcel');
  const [priceCAD, setPriceCAD] = useState<number>(75);
  const [weightKg, setWeightKg] = useState<number>(15);
  const [dimensions, setDimensions] = useState('100 x 50 x 40 cm');
  const [departureDate, setDepartureDate] = useState('2026-08-18');
  const [vehicleNeeded, setVehicleNeeded] = useState('SUV ou Camionnette');

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !originInput || !destinationInput) {
      alert(currentLang === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill all required fields.');
      return;
    }

    // Extraire nom de ville et province
    const originCityName = originObj?.city || originInput.split(',')[0].trim();
    const originProv: CanadianProvince = originObj?.province || 'QC';

    const destCityName = destinationObj?.city || destinationInput.split(',')[0].trim();
    const destProv: CanadianProvince = destinationObj?.province || 'QC';

    const originCoords = {
      lat: originObj?.lat || 45.5017 + (Math.random() - 0.5) * 0.4,
      lng: originObj?.lng || -73.5673 + (Math.random() - 0.5) * 0.4,
    };

    const destCoords = {
      lat: destinationObj?.lat || 46.8139 + (Math.random() - 0.5) * 0.4,
      lng: destinationObj?.lng || -71.2080 + (Math.random() - 0.5) * 0.4,
    };

    // Calcul de la distance
    const dLat = (destCoords.lat - originCoords.lat) * 111;
    const dLng = (destCoords.lng - originCoords.lng) * 85;
    const approxDistance = Math.max(50, Math.round(Math.sqrt(dLat * dLat + dLng * dLng)));

    const newShipment: Shipment = {
      id: `shipment-${Date.now()}`,
      title: {
        fr: title,
        en: title,
      },
      description: {
        fr: description || 'Colis à livrer via livraison collaborative canadienne Cocolis.ca.',
        en: description || 'Parcel to deliver via Canadian crowdshipping Cocolis.ca.',
      },
      origin: {
        name: 'Centre-ville',
        city: originCityName,
        province: originProv,
        lat: originCoords.lat,
        lng: originCoords.lng,
      },
      destination: {
        name: 'Secteur Central',
        city: destCityName,
        province: destProv,
        lat: destCoords.lat,
        lng: destCoords.lng,
      },
      priceCAD: Number(priceCAD) || 50,
      weightKg: Number(weightKg) || 10,
      dimensions: dimensions || '80 x 50 x 30 cm',
      departureDate: departureDate || '2026-08-18',
      flexibleDate: true,
      status: 'AVAILABLE',
      senderName: 'Vous (Membre Cocolis)',
      senderRating: 5.0,
      senderTripsCount: 1,
      category: category,
      vehicleNeeded: {
        fr: vehicleNeeded,
        en: vehicleNeeded,
      },
      distanceKm: approxDistance,
    };

    setSubmitted(true);
    setTimeout(() => {
      onAddShipment(newShipment);
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  const vehicleOptions = [
    { label: 'Berline / Coffre', value: 'Berline avec coffre standard' },
    { label: 'SUV / Fourgonnette', value: 'SUV, Fourgonnette ou Minivan' },
    { label: 'Camionnette / Pickup', value: 'Camionnette / Pickup truck' },
    { label: 'Remorque / Van', value: 'Grand Van ou Remorque' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
              <PackagePlus className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-1.5">
                <span>{currentLang === 'fr' ? 'Expédier un colis au Canada' : 'Post a Shipment in Canada'}</span>
                <span className="px-1.5 py-0.2 text-[10px] bg-red-600 font-bold rounded text-white">🇨🇦 CA</span>
              </h2>
              <p className="text-xs text-slate-400">
                {currentLang === 'fr' ? 'Publiez votre annonce avec autocomplétion des villes canadiennes' : 'Publish listing with Canadian city autocompletion'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-extrabold text-white">
              {currentLang === 'fr' ? 'Annonce publiée avec succès !' : 'Listing Published Successfully!'}
            </h3>
            <p className="text-sm text-slate-300">
              {currentLang === 'fr' 
                ? 'Votre expédition est désormais géolocalisée et tracée sur la carte live.' 
                : 'Your shipment is now geolocated and traced on the live map.'}
            </p>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
            
            {/* Item Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                {currentLang === 'fr' ? 'Titre de l\'objet à transporter *' : 'Item Title to Transport *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={currentLang === 'fr' ? 'ex: Canapé 3 places, Télévision OLED, Vélo de montagne' : 'e.g. 3-seater Sofa, OLED TV, Mountain Bike'}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentLang === 'fr' ? 'Catégorie de l\'objet *' : 'Item Category *'}</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ShipmentCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="furniture">{currentLang === 'fr' ? 'Meuble & Déco' : 'Furniture & Decor'}</option>
                <option value="electronics">{currentLang === 'fr' ? 'Électronique & High-Tech' : 'Electronics'}</option>
                <option value="parcel">{currentLang === 'fr' ? 'Colis & Cartons' : 'Parcel / Box'}</option>
                <option value="sports">{currentLang === 'fr' ? 'Équipement Sportif' : 'Sports Gear'}</option>
                <option value="moving">{currentLang === 'fr' ? 'Petit Déménagement' : 'Small Move'}</option>
                <option value="auto">{currentLang === 'fr' ? 'Pièce Auto / Vélo' : 'Auto Parts / Bike'}</option>
              </select>
            </div>

            {/* Departure City Autocomplete */}
            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentLang === 'fr' ? 'Ville de départ (Origine) *' : 'Departure City (Origin) *'}</span>
              </label>
              <AutocompleteInput
                value={originInput}
                onChange={(val, obj) => {
                  setOriginInput(val);
                  setOriginObj(obj);
                }}
                placeholder={currentLang === 'fr' ? 'Tapez une ville (ex: Montréal, QC)...' : 'Type a city (e.g. Montreal, QC)...'}
                iconColor="text-emerald-400"
              />
            </div>

            {/* Arrival City Autocomplete */}
            <div>
              <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentLang === 'fr' ? 'Ville d\'arrivée (Destination) *' : 'Arrival City (Destination) *'}</span>
              </label>
              <AutocompleteInput
                value={destinationInput}
                onChange={(val, obj) => {
                  setDestinationInput(val);
                  setDestinationObj(obj);
                }}
                placeholder={currentLang === 'fr' ? 'Tapez une ville (ex: Québec, QC)...' : 'Type a city (e.g. Quebec, QC)...'}
                iconColor="text-teal-400"
              />
            </div>

            {/* Price CAD & Weight & Date */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span>{currentLang === 'fr' ? 'Prime (CAD $)' : 'Payout (CAD $)'}</span>
                </label>
                <input
                  type="number"
                  required
                  min={15}
                  value={priceCAD}
                  onChange={(e) => setPriceCAD(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-extrabold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                  <Weight className="w-3 h-3 text-slate-400" />
                  <span>{currentLang === 'fr' ? 'Poids (kg)' : 'Weight (kg)'}</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-teal-400" />
                  <span>{currentLang === 'fr' ? 'Date limite' : 'Deadline'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Vehicle Options Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentLang === 'fr' ? 'Véhicule recommandé' : 'Vehicle recommended'}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {vehicleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVehicleNeeded(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      vehicleNeeded === opt.value
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {currentLang === 'fr' ? 'Description complémentaire' : 'Additional Description'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={currentLang === 'fr' ? 'Précisez si l\'objet est fragile, emballé, etc.' : 'Specify if fragile, packed, etc.'}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-transform transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{currentLang === 'fr' ? 'Publier mon annonce sur la carte' : 'Publish My Listing on Map'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
