import React, { useRef, useEffect } from 'react';
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

// --- REPEATING BUTTON COMPONENT ---
// Handles press-and-hold to continuously trigger onClick with acceleration
interface RepeatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
}

const RepeatingButton: React.FC<RepeatingButtonProps> = ({ onClick, children, disabled, className, ...props }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onClickRef = useRef(onClick);

  // Keep the ref synced with the latest onClick prop.
  // This is crucial because the 'loop' function in setTimeout creates a closure.
  // Without this, the loop would keep calling the OLD onClick function (with old state values),
  // effectively resetting the state to (Initial + Step) repeatedly instead of incrementing.
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  const stop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    
    stop();

    // 1. Trigger immediately using the latest handler
    onClickRef.current();

    // 2. Setup repeat loop
    // Initial delay before repeating starts (400ms)
    timerRef.current = setTimeout(() => {
       let currentDelay = 150; // Start speed (ms)
       
       const loop = () => {
         // ALWAYS call the current version of the function
         onClickRef.current();
         
         // Accelerate: reduce delay by 15% each step, clamp at 30ms
         currentDelay = Math.max(30, currentDelay * 0.85); 
         timerRef.current = setTimeout(loop, currentDelay);
       };
       
       loop();
    }, 400); 
  };

  return (
    <button
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={start}
      onTouchEnd={stop}
      onClick={(e) => e.preventDefault()} // We handle the click logic manually in start()
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};


export const ShimControls: React.FC<ShimControlsProps> = ({
  rearShim,
  frontShim,
  onUpdateRear,
  onUpdateFront,
  onReset
}) => {

  const adjust = (current: number, delta: number, setter: (v: number) => void) => {
    const next = Math.max(MIN_SHIM, Math.min(MAX_SHIM, current + delta));
    // Precision fix to avoid 0.300000004
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
              <RepeatingButton
                onClick={() => adjust(rearShim, -STEP, onUpdateRear)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors border border-slate-200 shadow-sm select-none touch-none"
                disabled={rearShim <= MIN_SHIM}
                title="Опустить (убрать пластину / подрезка)"
              >
                <Minus size={24} />
              </RepeatingButton>
              <RepeatingButton
                onClick={() => adjust(rearShim, STEP, onUpdateRear)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white transition-colors shadow-md shadow-blue-200 select-none touch-none"
                disabled={rearShim >= MAX_SHIM}
                title="Поднять (добавить пластину)"
              >
                <Plus size={24} />
              </RepeatingButton>
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
              <RepeatingButton
                onClick={() => adjust(frontShim, -STEP, onUpdateFront)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors border border-slate-200 shadow-sm select-none touch-none"
                disabled={frontShim <= MIN_SHIM}
                title="Опустить (убрать пластину / подрезка)"
              >
                <Minus size={24} />
              </RepeatingButton>
              <RepeatingButton
                onClick={() => adjust(frontShim, STEP, onUpdateFront)}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white transition-colors shadow-md shadow-blue-200 select-none touch-none"
                disabled={frontShim >= MAX_SHIM}
                title="Поднять (добавить пластину)"
              >
                <Plus size={24} />
              </RepeatingButton>
            </div>
        </div>
      </div>
    </div>
  );
};