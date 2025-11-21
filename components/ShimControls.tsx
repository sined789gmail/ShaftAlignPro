import React from 'react';
import { Plus, Minus, RotateCcw, Scissors } from 'lucide-react';

interface ShimControlsProps {
  rearShim: number;
  frontShim: number;
  onUpdateRear: (val: number) => void;
  onUpdateFront: (val: number) => void;
  onReset: () => void;
}

const STEP = 0.05; // 0.05mm standard shim step
const MAX_SHIM = 10.0;
const MIN_SHIM = -10.0; // Allow negative values to simulate "cutting the base" or lowering below floor

export const ShimControls: React.FC<ShimControlsProps> = ({
  rearShim,
  frontShim,
  onUpdateRear,
  onUpdateFront,
  onReset
}) => {

  const adjust = (current: number, delta: number, setter: (v: number) => void) => {
    const next = Math.max(MIN_SHIM, Math.min(MAX_SHIM, current + delta));
    setter(parseFloat(next.toFixed(2)));
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          Управление пластинами
        </h2>
        <button 
          onClick={onReset}
          className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-medium"
          title="Сбросить все пластины"
        >
          <RotateCcw size={16} />
          Сброс
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-8 md:gap-16 relative">
        {/* Visual Connector Line to indicate alignment with motor */}
        <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-slate-100 -z-10"></div>

        {/* Rear Feet Controls (Left) */}
        <div className="flex flex-col items-center space-y-3">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Задние лапы</span>
            <div className={`text-3xl font-mono font-bold min-w-[80px] text-center flex flex-col items-center ${rearShim < 0 ? 'text-amber-600' : 'text-blue-600'}`}>
              <span>{rearShim > 0 ? '+' : ''}{rearShim.toFixed(2)} <span className="text-sm text-slate-400 font-sans">мм</span></span>
              {rearShim < 0 && <span className="text-xs font-sans font-medium text-amber-600 flex items-center gap-1"><Scissors size={10}/> Подрезка</span>}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => adjust(rearShim, -STEP, onUpdateRear)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors border border-slate-200 shadow-sm"
                disabled={rearShim <= MIN_SHIM}
                title="Опустить (убрать пластину / подрезка)"
              >
                <Minus size={24} />
              </button>
              <button
                onClick={() => adjust(rearShim, STEP, onUpdateRear)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white transition-colors shadow-md shadow-blue-200"
                disabled={rearShim >= MAX_SHIM}
                title="Поднять (добавить пластину)"
              >
                <Plus size={24} />
              </button>
            </div>
        </div>

        {/* Front Feet Controls (Right) */}
        <div className="flex flex-col items-center space-y-3">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Передние лапы</span>
            <div className={`text-3xl font-mono font-bold min-w-[80px] text-center flex flex-col items-center ${frontShim < 0 ? 'text-amber-600' : 'text-blue-600'}`}>
              <span>{frontShim > 0 ? '+' : ''}{frontShim.toFixed(2)} <span className="text-sm text-slate-400 font-sans">мм</span></span>
              {frontShim < 0 && <span className="text-xs font-sans font-medium text-amber-600 flex items-center gap-1"><Scissors size={10}/> Подрезка</span>}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => adjust(frontShim, -STEP, onUpdateFront)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors border border-slate-200 shadow-sm"
                disabled={frontShim <= MIN_SHIM}
                title="Опустить (убрать пластину / подрезка)"
              >
                <Minus size={24} />
              </button>
              <button
                onClick={() => adjust(frontShim, STEP, onUpdateFront)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white transition-colors shadow-md shadow-blue-200"
                disabled={frontShim >= MAX_SHIM}
                title="Поднять (добавить пластину)"
              >
                <Plus size={24} />
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};