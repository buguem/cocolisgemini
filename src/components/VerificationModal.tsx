import React, { useState } from 'react';
import { Language } from '../types/shipment';
import { UserProfile } from '../types/auth';
import { X, ShieldCheck, Phone, Upload, CheckCircle2, Smartphone, FileText } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  currentLang: Language;
  onClose: () => void;
  onVerified: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  currentUser,
  currentLang,
  onClose,
  onVerified,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('+1 (514) 890-1234');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [idFileUploaded, setIdFileUploaded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    setSmsSent(true);
  };

  const handleValidateSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode === '1234' || smsCode.length === 4) {
      setIdFileUploaded(true);
    }
  };

  const handleFinishVerification = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onVerified();
      setIsCompleted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {currentLang === 'fr' ? 'Vérification de Confiance Cocolis' : 'Cocolis Trust Verification'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentLang === 'fr' ? 'Obtenez votre badge Profil Vérifié 🛡️' : 'Get your Verified Profile badge 🛡️'}
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
          
          {isCompleted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-black text-white">
                {currentLang === 'fr' ? 'Félicitations ! Profil Vérifié 🛡️' : 'Congratulations! Profile Verified 🛡️'}
              </h4>
              <p className="text-xs text-slate-300">
                Votre pièce d'identité et votre téléphone canadien sont validés. Vous avez désormais la confiance maximale des membres.
              </p>
            </div>
          ) : (
            <>
              {/* Étape 1 : SMS */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>1. Vérification Téléphone SMS</span>
                </span>

                {!smsSent ? (
                  <form onSubmit={handleSendSms} className="space-y-2">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (514) 000-0000"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                    >
                      Envoyer code par SMS
                    </button>
                  </form>
                ) : !idFileUploaded ? (
                  <form onSubmit={handleValidateSms} className="space-y-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="Code reçu (ex: 1234)"
                      className="w-full text-center py-2 bg-slate-950 border border-emerald-500 rounded-xl text-sm font-bold text-emerald-400 tracking-widest"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors"
                    >
                      Confirmer le code SMS
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Numéro de téléphone vérifié (+1 514...)</span>
                  </div>
                )}
              </div>

              {/* Étape 2 : Pièce d'Identité */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-4 h-4" />
                  <span>2. Pièce d'Identité Canadienne</span>
                </span>

                <div className="border border-dashed border-slate-700 p-4 rounded-xl text-center cursor-pointer hover:border-emerald-500 transition-colors bg-slate-950/50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-300 font-semibold block">Permis de conduire ou Passeport</span>
                  <span className="text-[10px] text-slate-500">Formats acceptés : JPG, PNG ou PDF</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishVerification}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/20 transition-transform transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Obtenir mon badge Profil Vérifié</span>
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
