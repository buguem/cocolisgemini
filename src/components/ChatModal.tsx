import React, { useEffect, useState } from 'react';
import { Language, Shipment } from '../types/shipment';
import { UserProfile } from '../types/auth';
import { formatCAD } from '../lib/formatters';
import { fetchMessagesApi, sendMessageApi } from '../lib/api';
import { X, Send, Lock, MessageSquare, DollarSign } from 'lucide-react';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !shipment) return;
    let active = true;
    setIsLoading(true);
    setErrorMsg(null);

    fetchMessagesApi(shipment.id)
      .then((rows) => {
        if (!active) return;
        setMessages(
          rows.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.sender.name,
            text: m.text,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isOfferProposal: m.isOfferProposal,
            proposedPrice: m.proposedPrice ?? undefined,
          }))
        );
      })
      .catch((err) => {
        if (!active) return;
        setMessages([]);
        setErrorMsg(
          err instanceof Error
            ? err.message
            : currentLang === 'fr'
              ? 'Connectez-vous pour accéder à la messagerie.'
              : 'Sign in to access secure messaging.'
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, shipment?.id]);

  if (!isOpen || !shipment) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
    setErrorMsg(null);
    try {
      const saved = await sendMessageApi(shipment.id, inputText.trim());
      setMessages((prev) => [
        ...prev,
        {
          id: saved.id,
          senderId: saved.senderId,
          senderName: saved.sender.name,
          text: saved.text,
          timestamp: new Date(saved.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOfferProposal: saved.isOfferProposal,
          proposedPrice: saved.proposedPrice ?? undefined,
        },
      ]);
      setInputText('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l’envoi.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendOfferInChat = async () => {
    if (isSending) return;
    setIsSending(true);
    setErrorMsg(null);
    const offerText =
      currentLang === 'fr'
        ? `Je propose de transporter cet objet pour ${formatCAD(shipment.priceCAD, 'fr')}.`
        : `I offer to transport this item for ${formatCAD(shipment.priceCAD, 'en')}.`;
    try {
      const saved = await sendMessageApi(shipment.id, offerText, true, shipment.priceCAD);
      setMessages((prev) => [
        ...prev,
        {
          id: saved.id,
          senderId: saved.senderId,
          senderName: saved.sender.name,
          text: saved.text,
          timestamp: new Date(saved.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isOfferProposal: saved.isOfferProposal,
          proposedPrice: saved.proposedPrice ?? shipment.priceCAD,
        },
      ]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l’envoi de l’offre.');
    } finally {
      setIsSending(false);
    }
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
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {currentLang === 'fr'
                ? 'Messagerie sauvegardée sur Neon Postgres.'
                : 'Messages persisted in Neon Postgres.'}
            </span>
          </div>
          <button
            type="button"
            disabled={isSending}
            onClick={handleSendOfferInChat}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center space-x-1 shrink-0"
          >
            <DollarSign className="w-3 h-3" />
            <span>{currentLang === 'fr' ? 'Proposer offre' : 'Send offer'}</span>
          </button>
        </div>

        {/* Zone de Messages */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-xs text-slate-400 py-8">
              {currentLang === 'fr' ? 'Chargement des messages...' : 'Loading messages...'}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-8 space-y-1">
              <p className="font-semibold text-slate-300">
                {currentLang === 'fr' ? 'Aucun message pour cette annonce.' : 'No messages yet for this listing.'}
              </p>
              <p className="text-[11px]">
                {currentLang === 'fr'
                  ? 'Démarrez la conversation ou cliquez sur « Proposer offre » ci-dessus.'
                  : 'Start the conversation or click "Send offer" above.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-500 mb-1 px-1">
                    {msg.senderName} • {msg.timestamp}
                  </span>
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.isOfferProposal && msg.proposedPrice && (
                      <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between gap-2">
                        <span className="font-bold text-white">
                          Offre : {formatCAD(msg.proposedPrice, currentLang)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onAcceptOffer(shipment, msg.proposedPrice!);
                            onClose();
                          }}
                          className="px-3 py-1 rounded-lg bg-white text-slate-950 font-black text-[10px] hover:bg-emerald-100 transition-colors shadow"
                        >
                          {currentLang === 'fr' ? 'Accepter & Séquestrer' : 'Accept & Escrow'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
            disabled={isSending}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
