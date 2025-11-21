import React, { useState, useMemo } from 'react';
import { MachineCanvas } from './components/MachineCanvas';
import { ShimControls } from './components/ShimControls';
import { MeasurementForm } from './components/MeasurementForm';
import { AIHelp } from './components/AIHelp';
import { calculateAlignment } from './utils/alignmentMath';
import { AlignmentState, InitialMeasurements } from './types';
import { Ruler, Info, CheckCircle2, AlertOctagon } from 'lucide-react';

const App: React.FC = () => {
  // 1. Initial Measurements (Readings from Laser/Dial)
  // Defaulting to 0,0 so user starts with aligned view as requested
  const [measurements, setMeasurements] = useState<InitialMeasurements>({
    initialOffset: 0.00, 
    initialAngle: 0.00,
  });

  // 2. Correction State (Shims added)
  // Starts at 0 because we are correcting FROM the initial measurements.
  const [alignment, setAlignment] = useState<AlignmentState>({
    rearShim: 0.00, 
    frontShim: 0.00,
    motorLength: 500, // 500mm between feet
    couplingDist: 200 // 200mm from front foot to coupling
  });

  // Computed Results (Current Position = Initial + Correction)
  const results = useMemo(() => calculateAlignment(alignment, measurements), [alignment, measurements]);

  // Handlers
  const updateRear = (val: number) => setAlignment(prev => ({ ...prev, rearShim: val }));
  const updateFront = (val: number) => setAlignment(prev => ({ ...prev, frontShim: val }));
  const reset = () => setAlignment(prev => ({ ...prev, rearShim: 0, frontShim: 0 }));

  // Tolerance checks (Standard 0.05mm)
  const isOffsetOk = Math.abs(results.verticalOffset) <= 0.05;
  const isAngleOk = Math.abs(results.angularMisalignment) <= 0.05; // Slope vs mm/100mm? results.angle is raw slope
  const displayAngle = results.angularMisalignment * 100;
  const isAngleOkDisplay = Math.abs(displayAngle) <= 0.05;

  const isPerfect = isOffsetOk && isAngleOkDisplay;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Ruler size={24} />
              </div>
              ShaftAlign Pro
            </h1>
            <p className="text-slate-500 mt-1">Симулятор центровки валов горизонтальных машин</p>
          </div>
          
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors duration-500 ${isPerfect ? 'bg-green-100 border-green-300 text-green-800' : 'bg-slate-200 border-slate-300 text-slate-600'}`}>
             {isPerfect ? <CheckCircle2 size={20} /> : <AlertOctagon size={20} />}
             <span className="font-bold">Статус: {isPerfect ? "В ДОПУСКЕ" : "ТРЕБУЕТСЯ ЦЕНТРОВКА"}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Visualization & Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Canvas now receives the CALCULATED results to visualize deviation */}
            <MachineCanvas alignment={alignment} results={results} />
            
            <ShimControls 
              rearShim={alignment.rearShim}
              frontShim={alignment.frontShim}
              onUpdateRear={updateRear}
              onUpdateFront={updateFront}
              onReset={reset}
            />
          </div>

          {/* Right Column: Inputs, Data & AI (4 cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            
            {/* Initial Measurements Input */}
            <MeasurementForm 
              measurements={measurements}
              onChange={setMeasurements}
            />
            
            {/* Readings Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
              {isPerfect && <div className="absolute inset-0 bg-green-50/50 pointer-events-none" />}
              
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 relative z-10">
                <Info size={18} className="text-blue-500"/>
                Текущее положение
              </h3>
              
              <div className="space-y-4 relative z-10">
                <div className={`p-3 rounded-lg border transition-colors duration-300 ${isOffsetOk ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Параллельное смещение</div>
                  <div className={`text-2xl font-mono font-bold ${isOffsetOk ? 'text-green-600' : 'text-slate-700'}`}>
                    {results.verticalOffset > 0 ? '+' : ''}{results.verticalOffset.toFixed(3)} <span className="text-sm font-normal text-slate-400">мм</span>
                  </div>
                  {!isOffsetOk && <div className="text-xs text-amber-600 mt-1 font-medium">
                    {results.verticalOffset < 0 ? "Двигатель НИЗКО" : "Двигатель ВЫСОКО"}
                  </div>}
                </div>

                <div className={`p-3 rounded-lg border transition-colors duration-300 ${isAngleOkDisplay ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Угловой излом</div>
                  <div className={`text-2xl font-mono font-bold ${isAngleOkDisplay ? 'text-green-600' : 'text-slate-700'}`}>
                    {displayAngle.toFixed(3)} <span className="text-sm font-normal text-slate-400">мм/100мм</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Advisor */}
            <div className="flex-1">
                <AIHelp alignment={alignment} results={results} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;