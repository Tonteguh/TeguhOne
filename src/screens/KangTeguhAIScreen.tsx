import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  User,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  Volume2,
  Square,
  Key,
  X,
  Lock,
  Trash2,
} from 'lucide-react';
import { askKangTeguhAI, ChatEntry } from '../services/geminiService';
import { aiManager } from '../services/aiProvider';
import { SubScreenHeader } from '../components/SubScreenHeader';
import { audioManager } from '../services/audioManager';

interface KangTeguhAIScreenProps {
  onBack: () => void;
}

export const KangTeguhAIScreen: React.FC<KangTeguhAIScreenProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; text: string; time: string }>
  >([
    {
      id: 'init-1',
      role: 'assistant',
      text: `Assalamu'alaikum wr. wb. Sahabat TeguhOne! 

Saya **Kang Teguh AI** — asisten AI cerdas serba bisa & sahabat santri (dengan kecerdasan mutakhir setara Qwen, ChatGPT & Dola).

Saya siap diajak berdiskusi dan membantu Anda dalam hal apa saja:
• 💻 **Coding & Pemrograman:** Web hotel, sistem booking, React, Node.js, Python, database, perancangan aplikasi.
• 🌿 **Dukungan Psikologis & Teman Curhat:** Menemani saat pikiran sedang stres/kacau, mendinginkan suasana hati, dan saling menguatkan.
• 💡 **Ide Bisnis & Solusi Kehidupan:** Perencanaan usaha, penulisan, riset, dan strategi produktif.
• 🔧 **Otomotif & Kendaraan:** Diagnosa mesin, CVT, kelistrikan, dan tips perawatan motor.

Silakan pilih topik di bawah atau tanyakan hal apa pun secara bebas. Bismillah, ada yang bisa saya bantu sahabat?`,
      time: '08:00',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTTSId, setActiveTTSId] = useState<string | null>(null);
  const [showByokModal, setShowByokModal] = useState(false);
  const [byokInputKey, setByokInputKey] = useState('');
  const [byokSavedToast, setByokSavedToast] = useState(false);
  const [hasByokKey, setHasByokKey] = useState(aiManager.isBYOKActive());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stop TTS if user leaves screen
  useEffect(() => {
    return () => {
      audioManager.stopTTS();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleToggleTTS = (msgId: string, text: string) => {
    if (activeTTSId === msgId && audioManager.isSpeaking()) {
      audioManager.stopTTS();
      setActiveTTSId(null);
      return;
    }

    setActiveTTSId(msgId);
    audioManager.speakTTS(text, () => {
      setActiveTTSId(null);
    });
  };

  const handleSaveByok = (e: React.FormEvent) => {
    e.preventDefault();
    if (!byokInputKey.trim()) return;
    aiManager.setBYOKKey(byokInputKey.trim());
    setHasByokKey(true);
    setByokInputKey('');
    setByokSavedToast(true);
    setTimeout(() => {
      setByokSavedToast(false);
      setShowByokModal(false);
    }, 1500);
  };

  const handleClearByok = () => {
    aiManager.clearBYOKKey();
    setHasByokKey(false);
    setByokSavedToast(true);
    setTimeout(() => {
      setByokSavedToast(false);
      setShowByokModal(false);
    }, 1500);
  };

  const quickChips = [
    { label: '💻 Coding Web Hotel', query: 'Saya ingin buat program web, apa kamu tahu langkah dan coding buat web hotel?' },
    { label: '🌿 Tenangkan Pikiran / Curhat', query: 'Saya lagi banyak pikiran dan stres berat, tolong temani dan dinginkan pikiran saya...' },
    { label: '💡 Ide Bisnis Digital', query: 'Berikan ide bisnis digital modal kecil yang menjanjikan dan solutif untuk pemula.' },
    { label: '⚙️ Masalah Mesin Motor', query: 'Mesin motor matic saya mendadak brebet saat digas dan loyo di tanjakan, apa penyebab dan solusinya?' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const rawText = messageText || input;
    const textToSend = rawText.trim().slice(0, 500);
    if (!textToSend || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: 'usr_' + Date.now(),
      role: 'user' as const,
      text: textToSend,
      time,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const historyForApi: ChatEntry[] = messages.slice(-4).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const reply = await askKangTeguhAI(textToSend, historyForApi, abortControllerRef.current.signal);

      const assistantMsg = {
        id: 'ai_' + Date.now(),
        role: 'assistant' as const,
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('User cancelled request');
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          text: 'Afwan sahabat, koneksi sedang sibuk sejenak. Kang Teguh AI siap mendengarkan kembali, silakan coba kirim ulang ya!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[88vh] bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-md -mx-2 sm:mx-0 relative">
      {/* Clean In-App SubScreen Header with BYOK Status */}
      <div className="px-3.5 pt-2 pb-1 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <SubScreenHeader
            title="Kang Teguh AI"
            subtitle="Asisten Cerdas Serba Bisa • Sahabat Santri"
            badge={hasByokKey ? 'BYOK Aktif' : 'AI Aktif'}
            badgeColor={hasByokKey ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-sky-50 text-sky-800 border-sky-200'}
            onBack={onBack}
          />
        </div>
        <button
          onClick={() => setShowByokModal(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            hasByokKey
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
          title="Pengaturan Kunci API Gemini Pribadi"
        >
          <Key className="w-3 h-3" />
          <span className="hidden sm:inline">{hasByokKey ? 'Kunci Pribadi' : 'Pengaturan API'}</span>
        </button>
      </div>

      {/* Quick Prompt Pills */}
      <div className="px-3 py-2 bg-sky-50/80 border-b border-sky-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider shrink-0">
          Topik Cepat:
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.query)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-sky-100 text-sky-800 text-[11px] font-semibold whitespace-nowrap transition-all border border-sky-200 shadow-2xs active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-1">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Kang Teguh AI</span>
                </div>
              )}

              <div className="whitespace-pre-wrap font-sans text-xs">
                {msg.text}
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80">
                {msg.role === 'assistant' ? (
                  <button
                    onClick={() => handleToggleTTS(msg.id, msg.text)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activeTTSId === msg.id
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                    }`}
                    title="Dengarkan Suara Kang Teguh (TTS)"
                  >
                    {activeTTSId === msg.id ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Hentikan Suara</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Dengar (TTS)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span />
                )}

                <span
                  className={`text-[9px] font-mono ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start justify-between gap-2 bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                <span>Kang Teguh sedang menganalisa masalah mesin...</span>
              </div>
            </div>
            <button
              onClick={handleCancelRequest}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer px-2 py-0.5 rounded-md hover:bg-red-50"
            >
              Batal
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer with 500 Char Limit Counter */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 bg-white border-t border-slate-200 flex flex-col gap-1.5 shrink-0"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            maxLength={500}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya coding, curhat/psikologi, ide bisnis, otomotif, dsb..."
            disabled={loading}
            className="flex-1 bg-slate-100 rounded-2xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-full bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4 translate-x-0.5" />
          </button>
        </div>
        {input.length > 350 && (
          <div className="flex justify-end px-2">
            <span className={`text-[10px] font-mono ${input.length >= 480 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
              {input.length}/500 karakter
            </span>
          </div>
        )}
      </form>

      {/* BYOK (Bring Your Own Key) Modal */}
      {showByokModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Keamanan Kunci Pribadi (BYOK)
                </h3>
              </div>
              <button
                onClick={() => setShowByokModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda dapat menggunakan Kunci API Google Gemini pribadi Anda (BYOK). Kunci ini <strong>hanya disimpan di memori browser lokal perangkat Anda</strong> dan tidak pernah dicatat atau dibagikan ke siapapun.
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-700">
                <span>Status Saat Ini:</span>
                <span className={`font-bold ${hasByokKey ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {hasByokKey ? 'Menggunakan Kunci Pribadi' : 'Menggunakan Server Default'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveByok} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Masukkan Gemini API Key:
                </label>
                <input
                  type="password"
                  value={byokInputKey}
                  onChange={(e) => setByokInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={!byokInputKey.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Simpan Kunci di Perangkat
                </button>
                {hasByokKey && (
                  <button
                    type="button"
                    onClick={handleClearByok}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs cursor-pointer"
                    title="Hapus Kunci Pribadi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {byokSavedToast && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-center font-bold">
                Pengaturan kunci berhasil diperbarui!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

