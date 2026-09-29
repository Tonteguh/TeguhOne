import React, { useState } from 'react';
import {
  AUTOMOTIVE_QUIZ_QUESTIONS,
  QuizQuestion,
} from '../services/automotiveQuizData';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  Wrench,
  Gauge,
  Lightbulb,
  Cpu,
  ChevronRight,
  Flame,
  Zap,
  Activity,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface AutomotiveDoctorQuizProps {
  onNavigateToAi?: () => void;
  onConsultAi?: () => void;
  onBackToSimulations?: () => void;
}

export const AutomotiveDoctorQuiz: React.FC<AutomotiveDoctorQuizProps> = ({
  onNavigateToAi,
  onConsultAi,
  onBackToSimulations,
}) => {
  const handleConsultAi = onConsultAi || onNavigateToAi;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = AUTOMOTIVE_QUIZ_QUESTIONS[currentIndex];
  const userSelection = selectedAnswers[currentQ.id];
  const isAnswered = userSelection !== undefined;
  const isCorrect = isAnswered && userSelection === currentQ.correctKey;

  // Total Score Calculation
  const totalQuestions = AUTOMOTIVE_QUIZ_QUESTIONS.length;
  const totalScore = Object.entries(selectedAnswers).reduce((acc, [qId, ans]) => {
    const q = AUTOMOTIVE_QUIZ_QUESTIONS.find((item) => item.id === Number(qId));
    return acc + (q && q.correctKey === ans ? 10 : 0);
  }, 0);

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return; // cannot change once answered
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: key,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  // Render Interactive Diagrams based on question type
  const renderDiagram = (type: QuizQuestion['diagramType']) => {
    switch (type) {
      case 'valve':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* Valve & Seat Diagram */}
              <rect x="96" y="10" width="8" height="60" fill="#94a3b8" rx="2" />
              <polygon points="80,70 120,70 110,82 90,82" fill="#38bdf8" />
              {/* Rocker Arm */}
              <path d="M 60 20 Q 98 12 140 18" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" fill="none" />
              <circle cx="100" cy="18" r="4" fill="#ef4444" />
              <text x="100" y="96" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
                Celah Katup (Feeler Gap In/Ex)
              </text>
            </svg>
          </div>
        );

      case 'spark_plug':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* Plug thread & center electrode */}
              <rect x="85" y="10" width="30" height="35" fill="#64748b" rx="2" />
              <rect x="94" y="45" width="12" height="20" fill="#e2e8f0" />
              <rect x="97" y="65" width="6" height="15" fill="#f8fafc" />
              {/* Ground electrode hook */}
              <path d="M 85 55 L 85 85 L 95 85" stroke="#94a3b8" strokeWidth="4" fill="none" />
              {/* Lean white chalk glow */}
              <circle cx="98" cy="72" r="10" fill="#f8fafc" opacity="0.6" />
              <text x="100" y="96" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
                Warna Putih Pucat = Campuran Kering (Lean AFR)
              </text>
            </svg>
          </div>
        );

      case 'compression_ring':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* Cylinder walls */}
              <line x1="50" y1="10" x2="50" y2="85" stroke="#475569" strokeWidth="6" />
              <line x1="150" y1="10" x2="150" y2="85" stroke="#475569" strokeWidth="6" />
              {/* Piston */}
              <rect x="65" y="25" width="70" height="50" fill="#64748b" rx="2" />
              {/* Compression Ring 1 & 2 */}
              <line x1="60" y1="35" x2="140" y2="35" stroke="#38bdf8" strokeWidth="3" />
              <line x1="60" y1="45" x2="140" y2="45" stroke="#38bdf8" strokeWidth="3" />
              {/* Oil Ring */}
              <line x1="60" y1="55" x2="140" y2="55" stroke="#f59e0b" strokeWidth="3" />
              <text x="100" y="96" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
                Wet Test: Lapisan Oli Merapatkan Celah Ring Aus
              </text>
            </svg>
          </div>
        );

      case 'cvt_pulley':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* Primary Pulley Face */}
              <polygon points="50,20 80,45 80,55 50,80" fill="#94a3b8" />
              <polygon points="120,45 150,20 150,80 120,55" fill="#94a3b8" />
              {/* V-Belt in middle */}
              <polygon points="85,38 115,38 108,62 92,62" fill="#f59e0b" />
              {/* Rollers */}
              <circle cx="65" cy="50" r="7" fill="#38bdf8" />
              <text x="100" y="96" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
                Roller Ringan = V-Belt Bertahan di Rasio Bawah
              </text>
            </svg>
          </div>
        );

      case 'tps_sensor':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* Voltage chart 0.5V to 4.5V with drop at 35% */}
              <line x1="40" y1="80" x2="170" y2="80" stroke="#64748b" strokeWidth="2" />
              <line x1="40" y1="20" x2="40" y2="80" stroke="#64748b" strokeWidth="2" />
              <path
                d="M 40 75 L 80 50 L 95 78 L 110 40 L 160 25"
                stroke="#ef4444"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="95" cy="78" r="4" fill="#ef4444" />
              <text x="105" y="96" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">
                Voltase Drop di Bukaan 35% = Motor Brebet
              </text>
            </svg>
          </div>
        );

      case 'clutch_jaso':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* Alternating Clutch Plates */}
              <rect x="60" y="20" width="8" height="55" fill="#f59e0b" rx="1" />
              <rect x="75" y="20" width="8" height="55" fill="#94a3b8" rx="1" />
              <rect x="90" y="20" width="8" height="55" fill="#f59e0b" rx="1" />
              <rect x="105" y="20" width="8" height="55" fill="#94a3b8" rx="1" />
              <rect x="120" y="20" width="8" height="55" fill="#f59e0b" rx="1" />
              <text x="100" y="96" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
                JASO MA: Friksi Gesek Optimal (Tanpa Selip)
              </text>
            </svg>
          </div>
        );

      case 'brake_hydraulic':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* Brake hose with bubbles */}
              <rect x="40" y="40" width="120" height="18" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="70" cy="49" r="4" fill="#ffffff" />
              <circle cx="100" cy="49" r="5" fill="#ffffff" />
              <circle cx="125" cy="49" r="3.5" fill="#ffffff" />
              <text x="100" y="96" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
                Gelembung Udara Kompresibel = Rem Amblas
              </text>
            </svg>
          </div>
        );

      case 'ignition_timing':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* Crank Angle TDC 0 */}
              <circle cx="100" cy="48" r="32" fill="none" stroke="#64748b" strokeWidth="3" />
              <line x1="100" y1="16" x2="100" y2="48" stroke="#38bdf8" strokeWidth="2" />
              {/* Spark advance angle at 32 deg BTDC */}
              <line x1="100" y1="48" x2="75" y2="24" stroke="#f59e0b" strokeWidth="3" />
              <circle cx="75" cy="24" r="3" fill="#f59e0b" />
              <text x="100" y="96" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
                Advance: Memantik Api Lebih Awal di RPM Tinggi
              </text>
            </svg>
          </div>
        );

      case 'thermostat':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* Thermostat valve opening */}
              <rect x="60" y="30" width="80" height="35" rx="4" fill="#334155" />
              <line x1="100" y1="30" x2="100" y2="65" stroke="#ef4444" strokeWidth="4" />
              <path d="M 80 47 Q 100 35 120 47" stroke="#38bdf8" strokeWidth="3" fill="none" />
              <text x="100" y="96" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
                Thermostat Menjaga Suhu Kerja Optimal (85°C)
              </text>
            </svg>
          </div>
        );

      case 'regulator_kiprok':
        return (
          <div className="bg-slate-900 rounded-2xl p-3 text-center border border-slate-700">
            <svg viewBox="0 0 200 100" className="w-full max-w-[220px] h-[90px] mx-auto">
              {/* AC Spool -> Kiprok Rectifier -> DC 14.5V Battery */}
              <rect x="35" y="30" width="35" height="35" rx="3" fill="#64748b" />
              <text x="52" y="52" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">Spul AC</text>
              <line x1="70" y1="47" x2="90" y2="47" stroke="#38bdf8" strokeWidth="3" />
              <rect x="90" y="25" width="40" height="45" rx="3" fill="#0284c7" />
              <text x="110" y="52" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Kiprok</text>
              <line x1="130" y1="47" x2="148" y2="47" stroke="#22c55e" strokeWidth="3" />
              <rect x="148" y="30" width="30" height="35" rx="3" fill="#16a34a" />
              <text x="163" y="52" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">Aki 12V</text>
              <text x="100" y="96" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold">
                Regulator Membatasi Tegangan Maksimal 14.8 Volt
              </text>
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  // Completion Screen (Rapor & Predikat Ahli Otomotif)
  if (isCompleted) {
    const percentage = Math.round((totalScore / 100) * 100);
    const predicate =
      percentage >= 90
        ? { title: 'Master Ahli Otomotif & Teknisi Senior', color: 'text-emerald-700', badge: 'bg-emerald-100 border-emerald-300' }
        : percentage >= 70
        ? { title: 'Teknisi Kompeten Standar Pabrikan', color: 'text-blue-700', badge: 'bg-blue-100 border-blue-300' }
        : percentage >= 50
        ? { title: 'Mekanik Muda Berbakat (Tingkat Madya)', color: 'text-amber-700', badge: 'bg-amber-100 border-amber-300' }
        : { title: 'Pelajar TBSM Tahap Eksplorasi Teori', color: 'text-slate-700', badge: 'bg-slate-100 border-slate-300' };

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hasil Uji Kompetensi Dokter Otomotif
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              Skor: {totalScore} / 100
            </h2>
            <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black mt-2 border ${predicate.badge} ${predicate.color}`}>
              {predicate.title}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Selamat telah menyelesaikan 10 studi kasus diagnosa tune-up mesin motor berstandar kurikulum TBSM &amp; praktisi bengkel resmi!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Kuis Soal</span>
            </button>

            {handleConsultAi && (
              <button
                onClick={handleConsultAi}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Konsultasi Mesin ke Kang Teguh AI</span>
              </button>
            )}
          </div>
        </div>

        {/* List of 10 Review Cards */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 px-1">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Rangkuman Pembahasan 10 Kasus:</span>
          </h3>

          {AUTOMOTIVE_QUIZ_QUESTIONS.map((q, idx) => {
            const userAns = selectedAnswers[q.id];
            const isQCorrect = userAns === q.correctKey;

            return (
              <div
                key={q.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isQCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-800">Soal #{idx + 1}: {q.category}</span>
                  {isQCorrect ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Benar (+10)
                    </span>
                  ) : (
                    <span className="text-red-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Salah (0)
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-900">{q.question}</p>
                <p className="text-[11px] text-slate-600 mt-1 italic">
                  Kunci Jawaban [{q.correctKey}]: {q.options.find(o => o.key === q.correctKey)?.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="space-y-4">
      {/* Quiz Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-bold text-xs border border-cyan-400/30 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Dokter Otomotif
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-400/30">
              Uji Kompetensi TBSM
            </span>
          </div>

          <div className="text-xs font-mono font-bold text-cyan-300 bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-700">
            Skor: {totalScore}
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-white">
            10 Soal Diagnosa Tune-Up &amp; Servis
          </h2>
          <span className="text-xs font-bold text-blue-200">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2 border border-slate-700">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Category & Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${currentQ.badgeColor}`}>
            {currentQ.category}
          </span>
          <span className="text-xs font-mono font-bold text-slate-500">
            Soal #{currentQ.id}
          </span>
        </div>

        {/* Question Text */}
        <h3 className="text-base sm:text-lg font-black text-slate-950 leading-snug">
          {currentQ.question}
        </h3>

        {/* Case Study Context Box */}
        {currentQ.codeOrCase && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{currentQ.codeOrCase}</span>
          </div>
        )}

        {/* 4 Multiple Choice Options */}
        <div className="space-y-2 pt-1">
          {currentQ.options.map((opt) => {
            const isThisChosen = userSelection === opt.key;
            const isThisCorrect = opt.key === currentQ.correctKey;

            let buttonClass = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900';

            if (isAnswered) {
              if (isThisCorrect) {
                buttonClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/50';
              } else if (isThisChosen && !isThisCorrect) {
                buttonClass = 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-500/50';
              } else {
                buttonClass = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                disabled={isAnswered}
                className={`w-full p-3.5 rounded-2xl border text-left font-bold text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${buttonClass}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-xs ${
                    isAnswered && isThisCorrect
                      ? 'bg-emerald-600 text-white'
                      : isAnswered && isThisChosen
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {opt.key}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <span>{opt.text}</span>
                </div>

                {isAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {isAnswered && isThisChosen && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* AI DOCTOR EXPLANATION & INTERACTIVE DIAGRAM (APPEARS ONCE ANSWERED) */}
        {isAnswered && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3.5 animate-in fade-in duration-300">
            {/* Header Result Badge */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-black ${
                isCorrect
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>
                  {isCorrect ? 'Jawaban Anda TEPAT! (+10 Poin)' : `Jawaban Anda Belum Tepat. Kunci Jawaban: [${currentQ.correctKey}]`}
                </span>
              </div>
            </div>

            {/* Interactive SVG Diagram */}
            {renderDiagram(currentQ.diagramType)}

            {/* Deep Educational Explanation from AI Doctor */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-xs text-slate-800">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm pb-1 border-b border-slate-200">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Penerangan AI Dokter Otomotif Kang Teguh:</span>
              </div>

              <div>
                <span className="font-extrabold text-blue-950 block mb-0.5">
                  1. Inti Diagnosa:
                </span>
                <p className="leading-relaxed text-slate-700">
                  {currentQ.aiDoctorExplanation.coreReason}
                </p>
              </div>

              <div>
                <span className="font-extrabold text-blue-950 block mb-0.5">
                  2. Dasar Ilmiah &amp; Fisika Mesin:
                </span>
                <p className="leading-relaxed text-slate-700">
                  {currentQ.aiDoctorExplanation.scientificBasis}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-emerald-800 block text-[11px] mb-0.5">
                    📏 Standar Servis Pabrikan:
                  </span>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    {currentQ.aiDoctorExplanation.workshopStandard}
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-amber-800 block text-[11px] mb-0.5">
                    🔧 Tips Montir Cerdas:
                  </span>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    {currentQ.aiDoctorExplanation.practicalProTip}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Question Button */}
            <div className="pt-2">
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
              >
                <span>
                  {currentIndex < totalQuestions - 1 ? 'Lanjut ke Soal Berikutnya' : 'Lihat Hasil Akhir Rapor'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
