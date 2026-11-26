import React, { useState } from 'react';
import { Language, Shipment } from '../types/shipment';
import { X, Star, MessageSquare, CheckCircle2, Heart } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  currentLang: Language;
  onClose: () => void;
  onSubmitReview: (rating: number, comment: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  shipment,
  currentLang,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen || !shipment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSubmitReview(rating, comment);
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {currentLang === 'fr' ? 'Laisser une Évaluation' : 'Leave a Review'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentLang === 'fr' ? 'Évaluez votre expérience de livraison' : 'Rate your shipping experience'}
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

        <div className="p-6 space-y-5">
          
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-black text-white">
                {currentLang === 'fr' ? 'Merci pour votre avis !' : 'Thank you for your review!'}
              </h4>
              <p className="text-xs text-slate-300">
                Votre retour d'expérience renforce la confiance de la communauté Cocolis au Canada.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="text-center space-y-2">
                <span className="text-xs text-slate-400 block">
                  Expédition : <strong>{shipment.title[currentLang]}</strong>
                </span>

                {/* Stars selector */}
                <div className="flex items-center justify-center space-x-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(rating)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-400 block">
                  {rating === 5 ? 'Excellent (5/5)' : `${rating}/5 Étoiles`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentLang === 'fr' ? 'Votre commentaire' : 'Your comment'}</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    currentLang === 'fr'
                      ? 'Livraison parfaite et ponctuelle, objet en excellent état !'
                      : 'Punctual delivery, item arrived in perfect condition!'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/20 transition-transform transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <Heart className="w-4 h-4" />
                <span>{currentLang === 'fr' ? 'Publier mon avis' : 'Submit Review'}</span>
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
