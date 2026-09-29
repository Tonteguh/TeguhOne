import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Flame,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Layers,
  HelpCircle,
  Calculator,
  ChevronRight,
  TrendingUp,
  Info,
  Stethoscope,
  Award,
} from 'lucide-react';
import { SubScreenHeader } from '../components/SubScreenHeader';
import { AutomotiveDoctorQuiz } from './AutomotiveDoctorQuiz';

export type TuningTabType = 'kuis' | 'mesin4tak' | 'cvt' | 'injeksi' | 'kalkulator';

interface TuningProScreenProps {
  onBack: () => void;
  onNavigateToAi: () => void;
  initialTab?: TuningTabType;
}

export const TuningProScreen: React.FC<TuningProScreenProps> = ({
  onBack,
  onNavigateToAi,
  initialTab = 'kuis',
}) => {
  const [activeTab, setActiveTab] = useState<TuningTabType>(initialTab);

  // ==========================================
  // 1. ENGINE 4-STROKE SIMULATOR STATE
  // ==========================================
  const [engineRunning, setEngineRunning] = useState(true);
  const [engineRpm, setEngineRpm] = useState(3000);
  const [compressionRatio, setCompressionRatio] = useState(10.5);
  const [boreSize, setBoreSize] = useState(58.0); // mm
  const [strokeLength, setStrokeLength] = useState(57.9); // mm
  const [engineAngle, setEngineAngle] = useState(0); // 0 to 720 degrees

  const engineAnimRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Animation Loop for 4-Stroke Engine
  useEffect(() => {
    if (!engineRunning) return;

    const animateEngine = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // 1 RPM = 360 degrees per minute = 6 degrees per second per RPM
      const degreesPerSec = (engineRpm * 360) / 60;
      setEngineAngle((prev) => (prev + degreesPerSec * dt) % 720);

      engineAnimRef.current = requestAnimationFrame(animateEngine);
    };

    lastTimeRef.current = performance.now();
    engineAnimRef.current = requestAnimationFrame(animateEngine);

    return () => {
      if (engineAnimRef.current) {
        cancelAnimationFrame(engineAnimRef.current);
      }
    };
  }, [engineRunning, engineRpm]);

  // Determine current 4-stroke cycle phase
  // 0 - 180: Hisap (Intake)
  // 180 - 360: Kompresi (Compression)
  // 360 - 540: Tenaga/Usaha (Combustion/Power)
  // 540 - 720: Buang (Exhaust)
  const currentPhaseIndex = Math.floor(engineAngle / 180);
  const phaseNames = [
    { name: '1. Langkah Hisap (Intake)', desc: 'Katup masuk terbuka, piston bergerak turun menghisap campuran udara & bensin.', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { name: '2. Langkah Kompresi (Compression)', desc: 'Kedua katup tertutup, piston naik memampatkan gas hingga suhu & tekanan tinggi.', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { name: '3. Langkah Usaha (Combustion/Power)', desc: 'Busi memercikkan api, gas meledak bertenaga besar mendorong piston ke bawah.', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    { name: '4. Langkah Buang (Exhaust)', desc: 'Katup buang terbuka, piston naik mendorong sisa gas pembakaran keluar knalpot.', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' },
  ];
  const currentPhase = phaseNames[currentPhaseIndex] || phaseNames[0];

  // Calculated physics values
  const displacementCc = (Math.PI * Math.pow(boreSize / 2, 2) * strokeLength) / 1000;
  const meanPistonSpeed = (2 * (strokeLength / 1000) * engineRpm) / 60; // m/s
  const estimatedHp = ((displacementCc * engineRpm * (compressionRatio / 10)) / 15000) * 0.9;
  const estimatedTorque = (estimatedHp * 7120) / engineRpm;

  // Crank math: angle in radians
  const crankRad = (engineAngle * Math.PI) / 180;
  const crankRadius = 32; // px in svg
  const rodLength = 70; // px in svg
  // Piston pin vertical position from crank center
  const crankY = -Math.cos(crankRad) * crankRadius;
  const crankX = Math.sin(crankRad) * crankRadius;
  // rod angle: sin(phi) = crankX / rodLength
  const rodAngle = Math.asin(Math.max(-1, Math.min(1, crankX / rodLength)));
  const pistonY = crankY - Math.cos(rodAngle) * rodLength; // Negative value relative to crank center (0,0)

  // Valve lifting math:
  // Intake valve open during 0° - 180°
  const intakeOpen = engineAngle >= 0 && engineAngle < 180;
  const intakeLift = intakeOpen ? Math.sin((engineAngle / 180) * Math.PI) * 12 : 0;
  // Exhaust valve open during 540° - 720°
  const exhaustOpen = engineAngle >= 540 && engineAngle < 720;
  const exhaustLift = exhaustOpen ? Math.sin(((engineAngle - 540) / 180) * Math.PI) * 12 : 0;
  // Spark ignition flashes between 355° and 385°
  const isSparkFiring = engineAngle >= 355 && engineAngle <= 390;

  // ==========================================
  // 2. CVT CONTINUOUS TRANSMISSION STATE
  // ==========================================
  const [cvtThrottle, setCvtThrottle] = useState(40); // 0 to 100%
  const [rollerWeight, setRollerWeight] = useState(10); // 7g to 15g
  const [cvtSpringRpm, setCvtSpringRpm] = useState(1500); // 1000, 1500, 2000 RPM
  const [cvtRunning, setCvtRunning] = useState(true);
  const [cvtRotation, setCvtRotation] = useState(0);

  // Dynamic CVT ratios based on throttle & roller
  // Low throttle / low rpm: front pulley small (diameter ~30), rear pulley big (diameter ~70) -> ratio ~2.4
  // High throttle: roller slides out, front pulley spreads belt outward (diameter ~65), rear sinks (diameter ~35) -> ratio ~0.8
  const throttleFactor = cvtThrottle / 100;
  const rollerEffect = (15 - rollerWeight) * 0.02; // lighter roller delays upshift for quick rev
  const effectiveUpshift = Math.max(0, Math.min(1, throttleFactor * 1.1 - rollerEffect));

  const frontPulleyBeltRadius = 24 + effectiveUpshift * 26; // 24px to 50px
  const rearPulleyBeltRadius = 50 - effectiveUpshift * 26; // 50px to 24px
  const cvtRatio = (rearPulleyBeltRadius / frontPulleyBeltRadius).toFixed(2);
  const estimatedSpeedKmh = Math.round(throttleFactor * 115);

  useEffect(() => {
    if (!cvtRunning) return;
    let animId: number;
    let last = performance.now();

    const loopCvt = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const speed = 120 + cvtThrottle * 6; // rotation speed
      setCvtRotation((prev) => (prev + speed * dt) % 360);
      animId = requestAnimationFrame(loopCvt);
    };

    animId = requestAnimationFrame(loopCvt);
    return () => cancelAnimationFrame(animId);
  }, [cvtRunning, cvtThrottle]);

  // ==========================================
  // 3. INJECTION & AFR SIMULATOR STATE
  // ==========================================
  const [tpsOpening, setTpsOpening] = useState(35); // Throttle Position Sensor %
  const [afrTarget, setAfrTarget] = useState(14.7); // Stoichiometric
  const [injectPulseWidth, setInjectPulseWidth] = useState(2.8); // ms

  // Calculate duty cycle and power
  const calculatedPulse = (1.5 + (tpsOpening / 100) * 6.5).toFixed(1);
  const afrCondition =
    afrTarget < 13.0
      ? { label: 'Kaya / Power Rich (Tenaga Maksimal, Sedikit Lebih Boros)', color: 'text-amber-600 bg-amber-50 border-amber-200' }
      : afrTarget <= 14.8
      ? { label: 'Stoikiometri Ideal 14.7:1 (Seimbang, Irit, Ramah Emisi)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      : { label: 'Kering / Lean (Sangat Irit, Ruang Bakar Cenderung Panas)', color: 'text-red-600 bg-red-50 border-red-200' };

  // ==========================================
  // 4. ENGINEERING CALCULATOR STATE
  // ==========================================
  const [calcBore, setCalcBore] = useState(58.5);
  const [calcStroke, setCalcStroke] = useState(57.9);
  const [calcDomeCc, setCalcDomeCc] = useState(14.5); // volume kubah head
  const [calcGasketMm, setCalcGasketMm] = useState(0.5); // tebal gasket

  const calculatedCc = (Math.PI * Math.pow(calcBore / 2, 2) * calcStroke) / 1000;
  const gasketVolume = (Math.PI * Math.pow(calcBore / 2, 2) * calcGasketMm) / 1000;
  const totalClearanceVolume = calcDomeCc + gasketVolume;
  const calculatedStaticCr = ((calculatedCc + totalClearanceVolume) / totalClearanceVolume).toFixed(2);

  return (
    <div className="space-y-4 pb-20">
      {/* SubScreenHeader */}
      <SubScreenHeader
        title="Simulasi Mesin &amp; Riset Teknik"
        subtitle="Laboratorium Dinamis: Animasi Bergerak 4-Tak, CVT &amp; Injeksi"
        onBack={onBack}
      />

      {/* Hero Simulation Header */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-400/30 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Simulasi Dinamis Bergerak
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
              Fisika &amp; Mekanika
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Lab Riset &amp; Simulasi Mekanikal
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            Peragaan visual interaktif cara kerja komponen mesin kendaraan secara nyata. Amati pergerakan piston, katup klep, percikan busi, dan transmisi sabuk CVT secara langsung.
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('kuis')}
          className={`py-2 px-3 shrink-0 text-center rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'kuis'
              ? 'bg-blue-700 text-white shadow-md'
              : 'text-slate-700 hover:text-blue-700 bg-white/60'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Dokter Otomotif (10 Kuis)</span>
        </button>
        <button
          onClick={() => setActiveTab('mesin4tak')}
          className={`py-2 px-3 shrink-0 text-center rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all ${
            activeTab === 'mesin4tak'
              ? 'bg-blue-700 text-white shadow-md'
              : 'text-slate-700 hover:text-blue-700 bg-white/60'
          }`}
        >
          Mesin 4-Tak
        </button>
        <button
          onClick={() => setActiveTab('cvt')}
          className={`py-2 px-3 shrink-0 text-center rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all ${
            activeTab === 'cvt'
              ? 'bg-blue-700 text-white shadow-md'
              : 'text-slate-700 hover:text-blue-700 bg-white/60'
          }`}
        >
          Transmisi CVT
        </button>
        <button
          onClick={() => setActiveTab('injeksi')}
          className={`py-2 px-3 shrink-0 text-center rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all ${
            activeTab === 'injeksi'
              ? 'bg-blue-700 text-white shadow-md'
              : 'text-slate-700 hover:text-blue-700 bg-white/60'
          }`}
        >
          Injeksi &amp; AFR
        </button>
        <button
          onClick={() => setActiveTab('kalkulator')}
          className={`py-2 px-3 shrink-0 text-center rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all ${
            activeTab === 'kalkulator'
              ? 'bg-blue-700 text-white shadow-md'
              : 'text-slate-700 hover:text-blue-700 bg-white/60'
          }`}
        >
          Kalkulator cc
        </button>
      </div>

      {/* TAB 0: AUTOMOTIVE DOCTOR QUIZ (10 HIGH QUALITY QUESTIONS) */}
      {activeTab === 'kuis' && (
        <AutomotiveDoctorQuiz onConsultAi={onNavigateToAi} />
      )}

      {/* TAB 1: 4-STROKE ENGINE MOVING SIMULATOR */}
      {activeTab === 'mesin4tak' && (
        <div className="space-y-4">
          {/* Phase Badge & Description */}
          <div className={`p-3.5 rounded-2xl border ${currentPhase.bg} transition-colors space-y-1`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-wider ${currentPhase.color}`}>
                {currentPhase.name}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                Sudut Kruk As: {Math.round(engineAngle)}° / 720°
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {currentPhase.desc}
            </p>
          </div>

          {/* Interactive Animated SVG Viewport (Real-time moving parts) */}
          <div className="bg-slate-950 rounded-3xl p-4 shadow-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Spark plug flame indicator */}
            {isSparkFiring && (
              <div className="absolute top-10 inset-x-0 flex justify-center items-center pointer-events-none z-30 animate-ping">
                <span className="w-12 h-12 rounded-full bg-amber-400/80 blur-xs" />
              </div>
            )}

            <svg
              viewBox="0 0 240 280"
              className="w-full max-w-[280px] h-[300px] select-none"
            >
              {/* Background Glow */}
              <defs>
                <radialGradient id="combustionGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ff4500" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#ffd700" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="pistonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <linearGradient id="cylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>

              {/* Center Coordinate System: (120, 200) is Crankshaft Center */}
              <g transform="translate(120, 200)">
                {/* 1. Cylinder Block Walls (Fixed) */}
                <rect x="-42" y="-180" width="8" height="135" fill="url(#cylinderGrad)" rx="2" />
                <rect x="34" y="-180" width="8" height="135" fill="url(#cylinderGrad)" rx="2" />

                {/* Cylinder Head Roof & Spark Plug */}
                <path d="M -42 -180 Q 0 -195 42 -180 L 42 -170 L -42 -170 Z" fill="#475569" />
                {/* Spark Plug center */}
                <rect x="-4" y="-195" width="8" height="18" fill="#e2e8f0" rx="1" />
                <rect x="-2" y="-178" width="4" height="6" fill="#38bdf8" />

                {/* 2. Intake Port & Valve (Left side) */}
                {/* Intake Fuel/Air Flow during intake stroke */}
                {intakeOpen && (
                  <path
                    d="M -45 -175 Q -30 -165 -22 -160"
                    stroke="#38bdf8"
                    strokeWidth="5"
                    strokeDasharray="4 2"
                    fill="none"
                    opacity="0.8"
                  />
                )}
                {/* Intake Valve stem & head */}
                <g transform={`translate(-22, ${-172 + intakeLift})`}>
                  <rect x="-2" y="-20" width="4" height="20" fill="#94a3b8" />
                  <polygon points="-12,0 12,0 6,-5 -6,-5" fill={intakeOpen ? '#38bdf8' : '#cbd5e1'} />
                </g>

                {/* 3. Exhaust Port & Valve (Right side) */}
                {/* Exhaust Flames/Gases during exhaust stroke */}
                {exhaustOpen && (
                  <path
                    d="M 22 -160 Q 30 -165 45 -175"
                    stroke="#f97316"
                    strokeWidth="5"
                    strokeDasharray="4 2"
                    fill="none"
                    opacity="0.8"
                  />
                )}
                {/* Exhaust Valve stem & head */}
                <g transform={`translate(22, ${-172 + exhaustLift})`}>
                  <rect x="-2" y="-20" width="4" height="20" fill="#94a3b8" />
                  <polygon points="-12,0 12,0 6,-5 -6,-5" fill={exhaustOpen ? '#f97316' : '#cbd5e1'} />
                </g>

                {/* 4. Combustion Chamber Gas Fire Explosion */}
                {isSparkFiring && (
                  <circle cx="0" cy="-160" r="28" fill="url(#combustionGlow)" />
                )}

                {/* 5. Crankcase Circle & Flywheel Counterweight */}
                <circle cx="0" cy="0" r="44" fill="#0f172a" stroke="#334155" strokeWidth="3" />
                {/* Crankshaft rotating counterweight */}
                <g transform={`rotate(${engineAngle})`}>
                  <path d="M -30 0 A 30 30 0 0 0 30 0 Z" fill="#64748b" opacity="0.9" />
                  {/* Crank pin journal */}
                  <circle cx="0" cy="-32" r="7" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
                </g>

                {/* 6. Moving Piston & Wrist Pin */}
                {/* Piston position calculated mathematically based on crank & rod kinematics */}
                <g transform={`translate(0, ${pistonY})`}>
                  {/* Piston Crown & Skirt */}
                  <rect x="-33" y="-35" width="66" height="35" rx="3" fill="url(#pistonGrad)" stroke="#475569" strokeWidth="1.5" />
                  {/* Compression Rings grooves */}
                  <line x1="-33" y1="-30" x2="33" y2="-30" stroke="#1e293b" strokeWidth="1.5" />
                  <line x1="-33" y1="-25" x2="33" y2="-25" stroke="#1e293b" strokeWidth="1.5" />
                  <line x1="-33" y1="-20" x2="33" y2="-20" stroke="#1e293b" strokeWidth="1.5" />
                  {/* Wrist Pin */}
                  <circle cx="0" cy="-14" r="5" fill="#334155" stroke="#f8fafc" strokeWidth="1.5" />
                </g>

                {/* 7. Connecting Rod (Stang Seher) connecting Crank Pin (crankX, crankY) to Piston Pin (0, pistonY - 14) */}
                <line
                  x1={crankX}
                  y1={crankY}
                  x2={0}
                  y2={pistonY - 14}
                  stroke="#cbd5e1"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line
                  x1={crankX}
                  y1={crankY}
                  x2={0}
                  y2={pistonY - 14}
                  stroke="#0284c7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Crank Pin connection */}
                <circle cx={crankX} cy={crankY} r="6" fill="#38bdf8" />
                {/* Piston Pin connection */}
                <circle cx={0} cy={pistonY - 14} r="4" fill="#38bdf8" />
              </g>
            </svg>

            {/* Live Playback Controls */}
            <div className="w-full flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-300">
              <button
                onClick={() => setEngineRunning(!engineRunning)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {engineRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{engineRunning ? 'Jeda Simulasi' : 'Jalankan'}</span>
              </button>

              <button
                onClick={() => {
                  setEngineAngle((prev) => (prev + 45) % 720);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer border border-slate-700"
              >
                Langkah +45°
              </button>

              <div className="flex items-center gap-1 font-mono text-cyan-400 font-bold">
                <Gauge className="w-4 h-4" />
                <span>{engineRpm} RPM</span>
              </div>
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Kontrol Parameter Dinamis Mesin
            </h4>

            {/* RPM Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Putaran Mesin (RPM):</span>
                <span className="font-mono text-blue-700 font-bold">{engineRpm} RPM</span>
              </div>
              <input
                type="range"
                min={800}
                max={12000}
                step={200}
                value={engineRpm}
                onChange={(e) => setEngineRpm(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>800 (Stasioner/Idle)</span>
                <span>6000 (Menjelajah)</span>
                <span>12000 (Redline Racing)</span>
              </div>
            </div>

            {/* Compression Ratio Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Rasio Kompresi Ruang Bakar:</span>
                <span className="font-mono text-blue-700 font-bold">{compressionRatio}:1</span>
              </div>
              <input
                type="range"
                min={8.5}
                max={13.5}
                step={0.1}
                value={compressionRatio}
                onChange={(e) => setCompressionRatio(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>8.5:1 (Standar Rendah)</span>
                <span>10.5:1 (Pertamax)</span>
                <span>13.5:1 (Balap Kompresi Tinggi)</span>
              </div>
            </div>

            {/* Live Calculated Output Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Kapasitas Silinder</span>
                <span className="font-mono text-sm font-extrabold text-blue-900">{displacementCc.toFixed(1)} cc</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Piston Speed</span>
                <span className="font-mono text-sm font-extrabold text-slate-900">{meanPistonSpeed.toFixed(1)} m/s</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Estimasi Tenaga</span>
                <span className="font-mono text-sm font-extrabold text-emerald-700">{estimatedHp.toFixed(1)} HP</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Estimasi Torsi</span>
                <span className="font-mono text-sm font-extrabold text-amber-700">{estimatedTorque.toFixed(1)} Nm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CVT TRANSMISSION MOVING SIMULATOR */}
      {activeTab === 'cvt' && (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Layers className="w-4 h-4 text-indigo-600" />
              Prinsip Kerja Transmisi Otomatis CVT (Continuous Variable Transmission)
            </p>
            <p className="leading-relaxed">
              Saat gas dipuntir (RPM naik), roller di pulley depan terlempar keluar oleh gaya sentrifugal, mendesak v-belt naik ke diameter luar (pembesaran rasio). Secara bersamaan v-belt menekan pulley belakang masuk ke diameter dalam.
            </p>
          </div>

          {/* Animated CVT Pulley & Belt SVG Viewport */}
          <div className="bg-slate-950 rounded-3xl p-4 shadow-xl border border-slate-800 flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 320 180" className="w-full max-w-[340px] h-[190px] select-none">
              <defs>
                <linearGradient id="pulleyMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>

              {/* 1. Connecting Moving V-Belt between Front & Rear Pulleys */}
              {/* Front Pulley Center: (70, 90), Radius: frontPulleyBeltRadius */}
              {/* Rear Pulley Center: (250, 90), Radius: rearPulleyBeltRadius */}
              {(() => {
                const fx = 70;
                const fy = 90;
                const rx = 250;
                const ry = 90;
                const r1 = frontPulleyBeltRadius;
                const r2 = rearPulleyBeltRadius;

                return (
                  <g>
                    {/* Top Belt Section */}
                    <line
                      x1={fx}
                      y1={fy - r1}
                      x2={rx}
                      y2={ry - r2}
                      stroke="#f59e0b"
                      strokeWidth="7"
                      strokeDasharray="6 3"
                      strokeDashoffset={-cvtRotation}
                      strokeLinecap="round"
                    />
                    {/* Bottom Belt Section */}
                    <line
                      x1={fx}
                      y1={fy + r1}
                      x2={rx}
                      y2={ry + r2}
                      stroke="#f59e0b"
                      strokeWidth="7"
                      strokeDasharray="6 3"
                      strokeDashoffset={cvtRotation}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })()}

              {/* 2. Front Pulley (Primary / Variator) at (70, 90) */}
              <g transform="translate(70, 90)">
                {/* Fixed back plate */}
                <circle cx="0" cy="0" r="54" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                {/* Variator Sheave */}
                <circle cx="0" cy="0" r="48" fill="url(#pulleyMetal)" />
                {/* Belt Groove at Current Radius */}
                <circle
                  cx="0"
                  cy="0"
                  r={frontPulleyBeltRadius}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="5"
                  strokeDasharray="8 4"
                  strokeDashoffset={-cvtRotation}
                />
                {/* Central Shaft & Nut */}
                <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#f8fafc" strokeWidth="2" />
                {/* Moving Centrifugal Rollers Inside (3 dots) */}
                <g transform={`rotate(${cvtRotation})`}>
                  {[0, 120, 240].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;
                    const rollerDistance = 14 + (effectiveUpshift * 20); // slides outward
                    return (
                      <circle
                        key={i}
                        cx={Math.cos(rad) * rollerDistance}
                        cy={Math.sin(rad) * rollerDistance}
                        r="5"
                        fill="#38bdf8"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </g>
                <text x="0" y="70" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  Pulley Depan (Drive)
                </text>
              </g>

              {/* 3. Rear Pulley (Secondary / Driven) at (250, 90) */}
              <g transform="translate(250, 90)">
                {/* Spring Driven Outer Pulley */}
                <circle cx="0" cy="0" r="54" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <circle cx="0" cy="0" r="48" fill="url(#pulleyMetal)" />
                {/* Belt Groove at Current Rear Radius */}
                <circle
                  cx="0"
                  cy="0"
                  r={rearPulleyBeltRadius}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="5"
                  strokeDasharray="8 4"
                  strokeDashoffset={-cvtRotation}
                />
                {/* Center Clutch Bell & Spring */}
                <circle cx="0" cy="0" r="18" fill="#334155" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="0" cy="0" r="8" fill="#0f172a" />
                <text x="0" y="70" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  Pulley Belakang (Driven)
                </text>
              </g>
            </svg>

            {/* CVT Live Indicators */}
            <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono text-amber-400">
              <span>Rasio CVT: {cvtRatio}:1</span>
              <span>Kecepatan Roda: {estimatedSpeedKmh} km/jam</span>
            </div>
          </div>

          {/* CVT Controls */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              Kontrol Gas &amp; Karakteristik CVT
            </h4>

            {/* Throttle Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Bukaan Throttle Gas (0 - 100%):</span>
                <span className="font-mono text-indigo-700 font-bold">{cvtThrottle}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={cvtThrottle}
                onChange={(e) => setCvtThrottle(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Roller Weight Selector */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Pilihan Bobot Roller (Gram):
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[7, 9, 11, 13, 15].map((g) => (
                  <button
                    key={g}
                    onClick={() => setRollerWeight(g)}
                    className={`py-1.5 rounded-xl font-bold text-xs cursor-pointer border transition-all ${
                      rollerWeight === g
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g} gr
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {rollerWeight <= 9
                  ? '⚡ Roller Ringan: Akselerasi putaran bawah sangat galak, cocok untuk tanjakan/stop-and-go.'
                  : rollerWeight >= 13
                  ? '🚀 Roller Berat: Nafas mesin panjang di putaran atas, mengutamakan top speed dan efisiensi bahan bakar.'
                  : '⚖️ Roller Sedang: Keseimbangan optimal antara tarikan awal dan nafas atas.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INJECTION & AFR SIMULATOR */}
      {activeTab === 'injeksi' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Zap className="w-4 h-4 text-emerald-600" />
              Air-Fuel Ratio (AFR) &amp; Kalibrasi Injektor FI
            </p>
            <p className="leading-relaxed">
              AFR ideal pembakaran bensin biner adalah 14.7 bagian udara berbanding 1 bagian bahan bakar (Stoikiometri). Perubahan bukaan throttle mengatur durasi semprotan nosel injektor (Pulse Width dalam milidetik).
            </p>
          </div>

          {/* Condition Card */}
          <div className={`p-3 rounded-2xl border text-xs font-bold ${afrCondition.color}`}>
            Status Campuran: {afrCondition.label}
          </div>

          {/* Controls */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Target AFR (Air-Fuel Ratio):</span>
                <span className="font-mono text-emerald-700 font-bold">{afrTarget.toFixed(1)}:1</span>
              </div>
              <input
                type="range"
                min={11.5}
                max={16.5}
                step={0.1}
                value={afrTarget}
                onChange={(e) => setAfrTarget(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Bukaan Throttle Sensor (TPS %):</span>
                <span className="font-mono text-emerald-700 font-bold">{tpsOpening}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={tpsOpening}
                onChange={(e) => setTpsOpening(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Durasi Semprot Injektor</span>
                <span className="font-mono text-base font-extrabold text-emerald-800">{calculatedPulse} ms</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Status Sensor O2</span>
                <span className="font-mono text-base font-extrabold text-blue-800">Closed-Loop OK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CC & COMPRESSION CALCULATOR */}
      {activeTab === 'kalkulator' && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            Kalkulator Kapasitas Mesin (cc) &amp; Rasio Kompresi
          </h4>
          <p className="text-xs text-slate-600">
            Rumus presisi mekanika: CC = 0.7854 × Diameter Piston² × Langkah Stroke.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Diameter Piston (Bore mm):
              </label>
              <input
                type="number"
                step="0.1"
                value={calcBore}
                onChange={(e) => setCalcBore(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Langkah Stroke (mm):
              </label>
              <input
                type="number"
                step="0.1"
                value={calcStroke}
                onChange={(e) => setCalcStroke(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Volume Kubah Head (cc):
              </label>
              <input
                type="number"
                step="0.1"
                value={calcDomeCc}
                onChange={(e) => setCalcDomeCc(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tebal Paking Gasket (mm):
              </label>
              <input
                type="number"
                step="0.1"
                value={calcGasketMm}
                onChange={(e) => setCalcGasketMm(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="p-4 bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-2xl shadow-md space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-200">Hasil Kapasitas Silinder:</span>
              <span className="font-mono text-xl font-black text-amber-300">
                {calculatedCc.toFixed(1)} cc
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-800">
              <span className="text-xs text-blue-200">Rasio Kompresi Statis (CR):</span>
              <span className="font-mono text-lg font-bold text-cyan-300">
                {calculatedStaticCr}:1
              </span>
            </div>
            <div className="text-[11px] text-blue-300 pt-1">
              Rekomendasi Bahan Bakar: {Number(calculatedStaticCr) > 11.5 ? 'Pertamax Turbo / Racing Fuel' : Number(calculatedStaticCr) > 10.0 ? 'Pertamax' : 'Pertalite'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
