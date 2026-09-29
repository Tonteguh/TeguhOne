import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Play,
  Pause,
  BookOpen,
  Volume2,
  Bookmark,
  Share2,
  Copy,
  Check,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Sliders,
  SkipForward,
  SkipBack,
  Heart,
  VolumeX,
} from 'lucide-react';
import { SubScreenHeader } from '../components/SubScreenHeader';
import { audioManager } from '../services/audioManager';
import {
  ALL_114_SURAHS,
  JUZ_LIST_30,
  fetchSurahVerses,
  getSurahAudioUrl,
  SurahMeta,
  AyahItem,
} from '../services/quranData';

interface TilawahScreenProps {
  onBack: () => void;
}

export const TilawahScreen: React.FC<TilawahScreenProps> = ({ onBack }) => {
  // Navigation & filter states
  const [activeTab, setActiveTab] = useState<'surat' | 'juz' | 'doa'>('surat');
  const [selectedJuz, setSelectedJuz] = useState<number>(30); // Default to Juz 30 (Juz Amma)
  const [searchQuery, setSearchQuery] = useState('');

  // Reader detail state
  const [activeSurah, setActiveSurah] = useState<SurahMeta | null>(null);
  const [verses, setVerses] = useState<AyahItem[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('large');

  // Audio Playback state
  const [selectedReciter, setSelectedReciter] = useState<'alafasy' | 'sudais' | 'ghamdi' | 'muaiqly'>('alafasy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlayingSurahNum, setCurrentlyPlayingSurahNum] = useState<number | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [bookmarkedSurah, setBookmarkedSurah] = useState<number>(1);
  const [bookmarkedAyah, setBookmarkedAyah] = useState<number>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Register with Global Audio Manager to stop when video/radio plays
  useEffect(() => {
    audioManager.registerSource('tilawah', () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    });
    return () => {
      audioManager.unregisterSource('tilawah');
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // When activeSurah changes, load its verses
  useEffect(() => {
    if (!activeSurah) return;
    let isMounted = true;
    setIsLoadingVerses(true);

    fetchSurahVerses(activeSurah.number).then((data) => {
      if (isMounted) {
        setVerses(data);
        setIsLoadingVerses(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeSurah]);

  // Handle Play / Pause Audio
  const handleTogglePlaySurah = (surah: SurahMeta) => {
    const streamUrl = getSurahAudioUrl(surah.number, selectedReciter);

    if (currentlyPlayingSurahNum === surah.number && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioManager.requestPlayback('tilawah');

    audioRef.current.src = streamUrl;
    audioRef.current.loop = isLooping;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setCurrentlyPlayingSurahNum(surah.number);
    }).catch((err) => {
      console.warn('Audio playback error:', err);
    });

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current) {
        setAudioCurrentTime(audioRef.current.currentTime);
        setAudioDuration(audioRef.current.duration || 0);
      }
    };

    audioRef.current.onended = () => {
      if (!isLooping) {
        setIsPlaying(false);
      }
    };
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setAudioCurrentTime(val);
    }
  };

  const handleNextSurah = () => {
    if (!currentlyPlayingSurahNum) return;
    const nextNum = currentlyPlayingSurahNum < 114 ? currentlyPlayingSurahNum + 1 : 1;
    const nextSurah = ALL_114_SURAHS.find((s) => s.number === nextNum);
    if (nextSurah) {
      handleTogglePlaySurah(nextSurah);
      if (activeSurah) {
        setActiveSurah(nextSurah);
      }
    }
  };

  const handlePrevSurah = () => {
    if (!currentlyPlayingSurahNum) return;
    const prevNum = currentlyPlayingSurahNum > 1 ? currentlyPlayingSurahNum - 1 : 114;
    const prevSurah = ALL_114_SURAHS.find((s) => s.number === prevNum);
    if (prevSurah) {
      handleTogglePlaySurah(prevSurah);
      if (activeSurah) {
        setActiveSurah(prevSurah);
      }
    }
  };

  const handleCopyAyah = (ayah: AyahItem, surahName: string) => {
    const text = `${surahName} [Ayat ${ayah.numberInSurah}]:\n${ayah.arabic}\n\nLatin: ${ayah.latin}\n\nArtinya: "${ayah.translation}"`;
    navigator.clipboard?.writeText(text);
    setCopiedAyah(ayah.numberInSurah);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filtered Surahs based on search or selected Juz
  const filteredSurahs = ALL_114_SURAHS.filter((surah) => {
    const matchesSearch =
      surah.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString().includes(searchQuery);

    if (activeTab === 'juz') {
      const currentJuzMeta = JUZ_LIST_30.find((j) => j.juzNumber === selectedJuz);
      const inJuz = currentJuzMeta ? currentJuzMeta.surahsIncluded.includes(surah.number) : true;
      return matchesSearch && inJuz;
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <SubScreenHeader
        title="Murotal & Al-Qur'an 30 Juz"
        subtitle="30 Juz Lengkap: Audio, Teks Arab, Latin & Terjemahan"
        onBack={onBack}
      />

      {/* Reciter Selector & Qari Banner */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-4 text-white shadow-lg border border-emerald-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                Lengkap 30 Juz &amp; 114 Surah
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                Audio HD
              </span>
            </div>
            <h3 className="font-bold text-lg text-emerald-100">
              Lantunan Ayat Suci Al-Qur'an
            </h3>
            <p className="text-xs text-emerald-200/80">
              Teks Arab Utsmani, transliterasi Latin yang jelas, serta artinya dalam Bahasa Indonesia.
            </p>
          </div>

          {/* Qari Selection Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-emerald-200 font-medium">Qari:</span>
            <select
              value={selectedReciter}
              onChange={(e) => {
                const reciter = e.target.value as any;
                setSelectedReciter(reciter);
                if (currentlyPlayingSurahNum) {
                  const s = ALL_114_SURAHS.find(x => x.number === currentlyPlayingSurahNum);
                  if (s) handleTogglePlaySurah(s);
                }
              }}
              className="bg-emerald-950/80 text-emerald-100 text-xs font-semibold rounded-xl px-3 py-2 border border-emerald-600 focus:outline-none cursor-pointer"
            >
              <option value="alafasy">Mishary Rashid Alafasy</option>
              <option value="sudais">Abdurrahman As-Sudais</option>
              <option value="ghamdi">Saad Al-Ghamdi</option>
              <option value="muaiqly">Maher Al-Muaiqly</option>
            </select>
          </div>
        </div>

        {/* Global Active Audio Bar (If playing) */}
        {currentlyPlayingSurahNum && (
          <div className="mt-4 pt-3 border-t border-emerald-700/60 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-emerald-200">
              <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                <Volume2 className="w-4 h-4 animate-pulse text-amber-400" />
                Sedang Memutar: Surah {ALL_114_SURAHS.find(s => s.number === currentlyPlayingSurahNum)?.latin} ({currentlyPlayingSurahNum})
              </span>
              <span className="font-mono text-xs">
                {formatTime(audioCurrentTime)} / {formatTime(audioDuration)}
              </span>
            </div>

            {/* Seekbar */}
            <input
              type="range"
              min={0}
              max={audioDuration || 100}
              value={audioCurrentTime}
              onChange={handleSeek}
              className="w-full accent-amber-400 h-1.5 bg-emerald-950 rounded-lg cursor-pointer"
            />

            {/* Playback Controls */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSurah}
                  className="p-1.5 hover:bg-emerald-700/50 rounded-lg cursor-pointer transition-colors"
                  title="Surat Sebelumnya"
                >
                  <SkipBack className="w-4 h-4 text-emerald-200" />
                </button>
                <button
                  onClick={() => {
                    const cur = ALL_114_SURAHS.find(s => s.number === currentlyPlayingSurahNum);
                    if (cur) handleTogglePlaySurah(cur);
                  }}
                  className="p-2 rounded-full bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 shadow cursor-pointer transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                </button>
                <button
                  onClick={handleNextSurah}
                  className="p-1.5 hover:bg-emerald-700/50 rounded-lg cursor-pointer transition-colors"
                  title="Surat Selanjutnya"
                >
                  <SkipForward className="w-4 h-4 text-emerald-200" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    isLooping ? 'bg-amber-400 text-slate-950' : 'bg-emerald-800 text-emerald-200'
                  }`}
                  title="Ulangi Surah Otomatis"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                  {isLooping ? 'Looping' : 'Normal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Tabs: Surat 1-114 | 30 Juz | Doa Pilihan */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => {
            setActiveTab('surat');
            setActiveSurah(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all ${
            activeTab === 'surat'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-700 hover:text-emerald-700'
          }`}
        >
          114 Surah Lengkap
        </button>
        <button
          onClick={() => {
            setActiveTab('juz');
            setActiveSurah(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all ${
            activeTab === 'juz'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-700 hover:text-emerald-700'
          }`}
        >
          30 Juz Komplit
        </button>
        <button
          onClick={() => {
            setActiveTab('doa');
            setActiveSurah(null);
          }}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all ${
            activeTab === 'doa'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-700 hover:text-emerald-700'
          }`}
        >
          Doa &amp; Dzikir
        </button>
      </div>

      {/* JUZ SELECTOR (If Juz Tab Active) */}
      {activeTab === 'juz' && !activeSurah && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-800">
              Pilih Juz (Juz 1 s/d Juz 30):
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Aktif: Juz {selectedJuz}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {JUZ_LIST_30.map((j) => (
              <button
                key={j.juzNumber}
                onClick={() => setSelectedJuz(j.juzNumber)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  selectedJuz === j.juzNumber
                    ? 'bg-emerald-700 text-white shadow-md scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Juz {j.juzNumber}
              </button>
            ))}
          </div>

          {/* Details of Selected Juz */}
          {(() => {
            const currentJuz = JUZ_LIST_30.find((j) => j.juzNumber === selectedJuz);
            if (!currentJuz) return null;
            return (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-900">{currentJuz.name}</p>
                  <p className="text-[11px] text-emerald-800">
                    Mulai dari {currentJuz.startSurah} ayat {currentJuz.startAyah} sampai {currentJuz.endSurah} ayat {currentJuz.endAyah}
                  </p>
                </div>
                <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-xl">
                  {currentJuz.surahsIncluded.length} Surat
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* SEARCH INPUT */}
      {!activeSurah && activeTab !== 'doa' && (
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari surat (misal: Yasin, Al-Mulk, Ar-Rahman, 36)..."
            className="w-full bg-white rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-950 border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
          />
        </div>
      )}

      {/* SURAH DETAIL VIEW (Arab + Latin + Terjemahan per Ayat) */}
      {activeSurah ? (
        <div className="space-y-4">
          {/* Top Bar for Surah View */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveSurah(null)}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Daftar Surat</span>
            </button>

            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-semibold mr-1">Huruf:</span>
              <button
                onClick={() => setFontSizeLevel('normal')}
                className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                  fontSizeLevel === 'normal' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSizeLevel('large')}
                className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                  fontSizeLevel === 'large' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSizeLevel('xlarge')}
                className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                  fontSizeLevel === 'xlarge' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                A++
              </button>
            </div>
          </div>

          {/* Surah Banner Card */}
          <div className="bg-linear-to-r from-emerald-800 to-teal-900 rounded-3xl p-5 text-white text-center shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                Surah ke-{activeSurah.number} • {activeSurah.revelation} • {activeSurah.ayahsCount} Ayat
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {activeSurah.latin}
              </h2>
              <p className="text-emerald-200 text-sm font-medium">
                "{activeSurah.translation}"
              </p>
              <div className="pt-2 text-3xl font-serif text-amber-300">
                {activeSurah.name}
              </div>

              {/* Play / Pause Surah Button */}
              <div className="pt-3">
                <button
                  onClick={() => handleTogglePlaySurah(activeSurah)}
                  className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md inline-flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  {currentlyPlayingSurahNum === activeSurah.number && isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Jeda Murotal</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Putar Audio Murotal Penuh</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bismillah (Except At-Taubah) */}
          {activeSurah.number !== 9 && activeSurah.number !== 1 && (
            <div className="py-4 text-center">
              <p className="font-serif text-2xl text-emerald-950 leading-loose">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="text-xs text-slate-600 font-medium">
                Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
              </p>
            </div>
          )}

          {/* Verses Stream: Arabic + Latin + Indonesian Translation */}
          {isLoadingVerses ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                Memuat ayat-ayat {activeSurah.latin}...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {verses.map((ayah) => {
                const isArabicXL = fontSizeLevel === 'xlarge';
                const isArabicL = fontSizeLevel === 'large';

                return (
                  <div
                    key={ayah.numberInSurah}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all space-y-3"
                  >
                    {/* Header Ayah: Number badge & Action buttons */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center border border-emerald-200">
                        {ayah.numberInSurah}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Bookmark Button */}
                        <button
                          onClick={() => {
                            setBookmarkedSurah(activeSurah.number);
                            setBookmarkedAyah(ayah.numberInSurah);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            bookmarkedSurah === activeSurah.number && bookmarkedAyah === ayah.numberInSurah
                              ? 'text-amber-600 bg-amber-50'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="Tandai Terakhir Dibaca"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyAyah(ayah, activeSurah.latin)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg cursor-pointer transition-colors"
                          title="Salin Ayat & Artinya"
                        >
                          {copiedAyah === ayah.numberInSurah ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 1. Teks Arab (Uthmani Typography) */}
                    <div className="text-right py-1">
                      <p
                        className={`font-serif text-emerald-950 leading-loose text-right tracking-wide ${
                          isArabicXL
                            ? 'text-3xl sm:text-4xl'
                            : isArabicL
                            ? 'text-2xl sm:text-3xl'
                            : 'text-xl sm:text-2xl'
                        }`}
                        dir="rtl"
                      >
                        {ayah.arabic}
                      </p>
                    </div>

                    {/* 2. Teks Latin (Transliterasi yang jelas dan kontras) */}
                    <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                        Transliterasi Latin:
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-950 italic leading-relaxed">
                        {ayah.latin}
                      </p>
                    </div>

                    {/* 3. Terjemahan / Artinya (Bahasa Indonesia Kemenag) */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Artinya:
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                        "{ayah.translation}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'doa' ? (
        /* DOA & DZIKIR SECTION */
        <div className="space-y-3">
          {[
            {
              title: 'Doa Naik Kendaraan',
              arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ',
              latin: 'Subhaanal-ladzii sakh-khara lanaa haadzaa wa maa kunnaa lahu muqriniin, wa innaa ilaa rabbinaa lamunqalibuun.',
              meaning: 'Maha Suci Allah yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.',
            },
            {
              title: 'Doa Memohon Kemudahan Urusan & Rezeki',
              arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
              latin: 'Allaahumma laa sahla illaa maa ja\'altahu sahlaa, wa anta taj\'alul-hazna idzaa syi\'ta sahlaa.',
              meaning: 'Ya Allah, tidak ada kemudahan kecuali apa yang Engkau jadikan mudah, dan Engkau menjadikan kesulitan bila Engkau kehendaki menjadi mudah.',
            },
            {
              title: 'Doa Sapu Jagad (Kebaikan Dunia & Akhirat)',
              arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
              latin: 'Rabbanaa aatinaa fid-dun-yaa hasanatan wa fil-aakhirati hasanatan wa qinaa \'adzaaban-naar.',
              meaning: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan lindungilah kami dari siksa api neraka.',
            },
            {
              title: 'Sayyidul Istighfar (Raja Permohonan Ampun)',
              arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
              latin: 'Allaahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa anaa \'abduka wa anaa \'alaa \'ahdika wa wa\'dika mastatha\'tu.',
              meaning: 'Ya Allah, Engkaulah Tuhanku, tiada tuhan selain Engkau. Engkaulah yang menciptakanku dan aku adalah hamba-Mu, dan aku menetapi perjanjian dan janji-Mu semampuku.',
            },
          ].map((d, idx) => (
            <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <h4 className="font-bold text-sm text-emerald-900">{d.title}</h4>
              <p className="font-serif text-xl text-right text-emerald-950 leading-loose" dir="rtl">
                {d.arabic}
              </p>
              <p className="text-xs font-semibold text-emerald-900 italic bg-emerald-50 p-2 rounded-xl">
                {d.latin}
              </p>
              <p className="text-xs font-semibold text-slate-800">
                "{d.meaning}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* SURAH CATALOG (114 Surahs or filtered by Juz) */
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-semibold">
            <span>Ditemukan {filteredSurahs.length} Surat</span>
            <span>Ketuk untuk membaca teks lengkap</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {filteredSurahs.map((surah) => {
              const isCurPlaying = currentlyPlayingSurahNum === surah.number && isPlaying;
              return (
                <div
                  key={surah.number}
                  className={`p-3.5 bg-white rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs hover:border-emerald-400 ${
                    isCurPlaying ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-300' : 'border-slate-200'
                  }`}
                >
                  {/* Left: Number + Metadata */}
                  <div
                    onClick={() => setActiveSurah(surah)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-sm flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                      {surah.number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm sm:text-base text-slate-950 truncate">
                          {surah.latin}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                          {surah.revelation}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 truncate">
                        "{surah.translation}" • {surah.ayahsCount} Ayat
                      </p>
                    </div>
                  </div>

                  {/* Right: Arabic Name & Quick Play Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-serif text-lg text-emerald-900 font-bold hidden sm:inline">
                      {surah.name}
                    </span>

                    {/* Play Audio Button */}
                    <button
                      onClick={() => handleTogglePlaySurah(surah)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        isCurPlaying
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                      title={isCurPlaying ? 'Jeda Audio' : 'Dengarkan Murotal'}
                    >
                      {isCurPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      )}
                    </button>

                    {/* Open Text Button */}
                    <button
                      onClick={() => setActiveSurah(surah)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg cursor-pointer"
                      title="Buka Ayat Lengkap"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
