import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Send,
  MessageSquare,
  ListMusic,
  Radio,
  CheckCircle2,
  Sliders,
  Sparkles,
  Signal,
} from 'lucide-react';
import { radioService, RADIO_CHANNELS } from '../services/audioRadio';
import { RadioChannel } from '../types';
import { p2pEngine } from '../services/p2pSync';
import { RadioEqualizer } from './RadioEqualizer';

interface RadioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RadioModal: React.FC<RadioModalProps> = ({ isOpen, onClose }) => {
  const [state, setState] = useState(radioService.getState());
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeTab, setActiveTab] = useState<'equalizer' | 'stasiun' | 'jadwal' | 'request' | 'chat'>('equalizer');

  // Request form state
  const [requestName, setRequestName] = useState(p2pEngine.getNodeName());
  const [requestContent, setRequestContent] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Live Listener Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 'rc-1', sender: 'Ahmad Santri', text: 'Alhamdulillah suaranya jernih banget ustadz!', time: '12:30' },
    { id: 'rc-2', sender: 'Budi Motor Matic', text: 'Menyimak Elshinta sambil servis CVT di bengkel.', time: '12:32' },
    { id: 'rc-3', sender: 'Kang Teguh (Host)', text: 'Ahlan wa sahlan sahabat TeguhOne di seluruh nusantara!', time: '12:33' },
  ]);

  useEffect(() => {
    return radioService.subscribe(() => {
      setState(radioService.getState());
    });
  }, []);

  const categories = ['Semua', 'Berita', 'Musik', 'Dakwah', 'Dangdut', 'Daerah'];

  const filteredChannels = selectedCategory === 'Semua'
    ? RADIO_CHANNELS
    : RADIO_CHANNELS.filter((c) => c.category === selectedCategory);

  const schedules = [
    { time: '06:00 - 08:00', title: 'Warta Nusantara & Elshinta Pagi', host: 'Redaksi Berita', cat: 'Berita' },
    { time: '08:00 - 10:00', title: 'Kajian Fiqih Muamalah & Bisnis Berkah', host: 'KH. Abdullah Gymnastiar', cat: 'Dakwah' },
    { time: '10:00 - 12:00', title: 'Top Hits Prambors & Pop Indonesia', host: 'Tim Prambors', cat: 'Musik' },
    { time: '13:00 - 15:00', title: 'Konsultasi Mesin & Motor Kang Teguh', host: 'Kang Teguh Rianto', cat: 'Otomotif' },
    { time: '15:30 - 17:30', title: 'Goyang Dangdut Asik & Koplo', host: 'Sobat RDI', cat: 'Dangdut' },
    { time: '18:00 - 19:30', title: 'Murotal Qur\'an Menjelang Maghrib', host: 'Mishary Rashid', cat: 'Al-Qur\'an' },
    { time: '19:30 - 21:00', title: 'Kajian Malam Radio Rodja', host: 'Ustadz Sunnah', cat: 'Dakwah' },
  ];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: 'rc_' + Date.now(),
      sender: requestName,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    p2pEngine.broadcast('radio_chat', newMsg);
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestContent.trim()) return;

    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setRequestContent('');
    }, 2500);
  };

  if (!isOpen) return null;

  const elapsedStr = radioService.formatTime(state.currentTime);
  const remainingSecs = Math.max(0, state.totalDuration - state.currentTime);
  const remainingStr = '-' + radioService.formatTime(remainingSecs);
  const progressPercent = (state.currentTime / state.totalDuration) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0b1e38] text-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-cyan-800/50 flex flex-col max-h-[94vh]">
        {/* Top Header Card */}
        <div className="p-4 bg-linear-to-b from-[#0f2d54] to-[#0b1e38] border-b border-cyan-900/60 relative shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs text-white shadow-xs">
                T1
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white truncate max-w-[170px]">
                    {state.currentChannel.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white tracking-wider animate-pulse flex items-center gap-0.5">
                    <Signal className="w-2.5 h-2.5" />
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <span className="px-1.5 py-0.2 rounded bg-cyan-900/70 text-[10px] font-mono font-bold text-cyan-300">
                    {state.currentChannel.frequency || 'FM'}
                  </span>
                  <span className="truncate">{state.currentChannel.category}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Player Visual and Metadata */}
          <div className="flex items-center gap-3.5 my-2">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                {state.currentChannel.tagline}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {state.currentChannel.host}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 truncate">
                {state.currentChannel.program}
              </p>
            </div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg border border-cyan-400/30 shrink-0">
              <img
                src={state.currentChannel.artwork}
                alt={state.currentChannel.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-2">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#22d3ee]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-cyan-300/80 font-mono mt-1">
              <span>{elapsedStr}</span>
              <span className="text-emerald-400 font-bold">128kbps Stereo</span>
              <span>{remainingStr}</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => radioService.setVolume(state.volume > 0 ? 0 : 0.85)}
              className="p-2 text-cyan-300 hover:text-white transition-colors cursor-pointer"
              title="Mute / Unmute"
            >
              {state.volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => radioService.prevChannel()}
                className="p-2 text-cyan-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
                title="Saluran Sebelumnya"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => radioService.togglePlay()}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer ${
                  state.isPlaying
                    ? 'bg-amber-400 text-slate-950 shadow-amber-400/40'
                    : 'bg-cyan-400 text-slate-950 shadow-cyan-400/40'
                }`}
                title={state.isPlaying ? 'Jeda Siaran' : 'Putar Siaran'}
              >
                {state.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
              </button>

              <button
                onClick={() => radioService.nextChannel()}
                className="p-2 text-cyan-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
                title="Saluran Berikutnya"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="text-[11px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
              {state.currentChannel.location}
            </div>
          </div>

          {/* Action Tabs: Equalizer, Stasiun, Jadwal, Request, Chat */}
          <div className="grid grid-cols-5 gap-1 mt-3 pt-2.5 border-t border-cyan-900/60">
            {[
              { id: 'equalizer', label: 'Equalizer', icon: Sliders },
              { id: 'stasiun', label: 'Stasiun', icon: ListMusic },
              { id: 'jadwal', label: 'Jadwal', icon: Clock },
              { id: 'request', label: 'Request', icon: Send },
              { id: 'chat', label: 'Chat', icon: MessageSquare },
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 mb-0.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Panel */}
        <div className="p-3.5 flex-1 overflow-y-auto bg-[#071527]">
          {/* 1. Equalizer Tab - Winamp style as user requested */}
          {activeTab === 'equalizer' && (
            <div className="space-y-3">
              <RadioEqualizer />

              {/* Quick Station Switcher under Equalizer */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5" /> Pilih Stasiun Cepat
                  </span>
                  <button
                    onClick={() => setActiveTab('stasiun')}
                    className="text-[11px] text-cyan-300 hover:underline cursor-pointer"
                  >
                    Lihat Semua ({RADIO_CHANNELS.length})
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {RADIO_CHANNELS.slice(0, 6).map((ch) => {
                    const isSelected = ch.id === state.currentChannel.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => radioService.setChannel(ch)}
                        className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-xs'
                            : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                          <img src={ch.artwork} alt={ch.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate leading-tight">{ch.name}</p>
                          <p className="text-[10px] text-cyan-400 font-mono">{ch.category}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. Stasiun Tab - Organized by Category (Tak Boros Tempat) */}
          {activeTab === 'stasiun' && (
            <div className="space-y-2.5">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 shadow-xs'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Station List */}
              <div className="space-y-1.5">
                {filteredChannels.map((channel) => {
                  const isCurrent = state.currentChannel.id === channel.id;
                  return (
                    <div
                      key={channel.id}
                      onClick={() => radioService.setChannel(channel)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-cyan-950/70 border-cyan-400/80 text-white shadow-sm ring-1 ring-cyan-500/50'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-700 relative">
                          <img
                            src={channel.artwork}
                            alt={channel.name}
                            className="w-full h-full object-cover"
                          />
                          {isCurrent && state.isPlaying && (
                            <div className="absolute inset-0 bg-cyan-950/60 flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-white truncate">
                              {channel.name}
                            </h5>
                            {channel.frequency && (
                              <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-cyan-300">
                                {channel.frequency}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {channel.program}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 text-[10px] font-semibold border border-cyan-900">
                          {channel.category}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isCurrent && state.isPlaying
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isCurrent && state.isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Jadwal Tab */}
          {activeTab === 'jadwal' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Jadwal Acara & Kajian Hari Ini
              </h4>
              {schedules.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400">{item.time}</span>
                    <h5 className="text-xs font-bold text-white">{item.title}</h5>
                    <p className="text-[11px] text-slate-400">{item.host}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 text-[10px] font-semibold border border-cyan-800/40">
                    {item.cat}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 4. Request Tab */}
          {activeTab === 'request' && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Request Kajian & Lagu Favorit
              </h4>
              {requestSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-center py-6">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs font-bold">Request Terkirim!</p>
                  <p className="text-[11px] text-emerald-300/80 mt-1">
                    Pesan antum telah diteruskan ke stasiun radio.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendRequest} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Nama Pemohon</label>
                    <input
                      type="text"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Judul Lagu / Topik Kajian</label>
                    <textarea
                      rows={3}
                      value={requestContent}
                      onChange={(e) => setRequestContent(e.target.value)}
                      placeholder="Contoh: Murotal Surah Al-Mulk, atau Berita Lalu Lintas Tol Cikampek..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Kirim Request ke Penyiar
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 5. Chat Pendengar Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[280px]">
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-cyan-400 mb-1">
                      <span className="font-bold">{msg.sender}</span>
                      <span className="text-slate-500 font-mono">{msg.time}</span>
                    </div>
                    <p className="text-slate-200">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Kirim sapaan ke pendengar..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
