import React from 'react';
import { Settings2, ArrowUpFromLine, ArrowDownToLine, RotateCw } from 'lucide-react';
import { InitialMeasurements } from '../types';

interface MeasurementFormProps {
  measurements: InitialMeasurements;
  onChange: (newValues: InitialMeasurements) => void;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({ measurements, onChange }) => {
  
  const handleChange = (key: keyof InitialMeasurements, value: string) => {
    // Allow typing "-" and "."
    const num = parseFloat(value);
    if (isNaN(num) && value !== '-' && value !== '') return;
    
    // If valid number or intermediate typing, update parent
    // We pass the raw value for the input if needed, but here we stick to number state
    // For smoother typing, normally we'd manage local string state, but let's keep it simple 
    // and assume the user types valid numbers or we parse effectively.
    
    onChange({
      ...measurements,
      [key]: isNaN(num) ? 0 : num
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6">
      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
        <Settings2 size={18} className="text-blue-600"/>
        Ввод исходных данных (показания прибора)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Offset Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600">
            Параллельное смещение (мм)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {measurements.initialOffset >= 0 ? <ArrowUpFromLine size={16}/> : <ArrowDownToLine size={16}/>}
            </div>
            <input
              type="number"
              step="0.01"
              value={measurements.initialOffset}
              onChange={(e) => handleChange('initialOffset', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                measurements.initialOffset === 0 ? 'border-slate-300 focus:ring-blue-500' :
                measurements.initialOffset > 0.05 || measurements.initialOffset < -0.05 ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-green-300 bg-green-50 focus:ring-green-500'
              }`}
            />
            <div className="text-xs text-slate-400 mt-1">
              "-" (минус) = Двигатель НИЖЕ насоса
            </div>
          </div>
        </div>

        {/* Angle Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-600">
            Угловой излом (мм/100мм)
          </label>
           <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <RotateCw size={16}/>
            </div>
            <input
              type="number"
              step="0.01"
              value={measurements.initialAngle}
              onChange={(e) => handleChange('initialAngle', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                 measurements.initialAngle === 0 ? 'border-slate-300 focus:ring-blue-500' :
                 Math.abs(measurements.initialAngle) > 0.05 ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-green-300 bg-green-50 focus:ring-green-500'
              }`}
            />
            <div className="text-xs text-slate-400 mt-1">
              Раскрытие по муфте (стандарт EMAX)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};