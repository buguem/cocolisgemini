import React, { useState } from 'react';
import { Language, Shipment } from '../types/shipment';
import { UserProfile } from '../types/auth';
import { formatCAD } from '../lib/formatters';
import { X, Send, Shield, Lock, MessageSquare, Truck, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOfferProposal?: boolean;
  proposedPrice?: number;
}

interface ChatModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  currentUser: UserProfile | null;
  currentLang: Language;
  onClose: () => void;
  onAcceptOffer: (shipment: Shipment, price: number) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  shipment,
  currentUser,
  currentLang,
  onClose,
  onAcceptOffer,
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderId: 'transporter-1',
      senderName: 'Marc-André Roy',
      text: 'Bonjour ! Je passe par ce trajet ce samedi matin avec mon SUV. Est-ce que l\'objet est déjà emballé ?',
      timestamp: '10:42',
    },
    {
      id: 'msg-2',
      senderId: 'sender-1',
      senderName: shipment?.senderName || 'Sophie Tremblay',
      text: 'Bonjour Marc-André ! Oui tout à fait, il est sous film de protection avec couvertures.',
      timestamp: '10:45',
    },
    {
      id: 'msg-3',
      senderId: 'transporter-1',
      senderName: 'Marc-André Roy',
      text: `Parfait, je vous propose de le transporter pour ${shipment ? formatCAD(shipment.priceCAD, 'fr') : '85,00 $ CAD'}.`,
      timestamp: '10:48',
      isOfferProposal: true,
      proposedPrice: shipment?.priceCAD || 85,
    },
  ]);

  if (!isOpen || !shipment) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'current-user',
      senderName: currentUser?.name || 'Vous',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col h-[600px] max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">{shipment.title[currentLang]}</h3>
              <p className="text-[11px] text-slate-400">
                {shipment.origin.city} → {shipment.destination.city} ({formatCAD(shipment.priceCAD, currentLang)})
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

        {/* Bannière de sécurité Cocolis */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            {currentLang === 'fr'
              ? 'Messagerie sécurisée : les numéros de téléphone sont masqués jusqu\'au paiement.'
              : 'Secure chat: Phone numbers are kept private until escrow payment.'}
          </span>
        </div>

        {/* Zone de Messages */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === (currentUser?.id || 'current-user') || msg.senderName === 'Vous';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.senderName} • {msg.timestamp}</span>
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Bouton d'acceptation d'offre dans le chat */}
                  {msg.isOfferProposal && msg.proposedPrice && (
                    <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between">
                      <span className="font-bold text-white">Offre : {formatCAD(msg.proposedPrice, currentLang)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          onAcceptOffer(shipment, msg.proposedPrice!);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg bg-white text-slate-950 font-black text-[10px] hover:bg-emerald-100 transition-colors shadow"
                      >
                        Accepter & Payer Séquestre
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={currentLang === 'fr' ? 'Écrivez votre message sécurisé...' : 'Type your secure message...'}
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
