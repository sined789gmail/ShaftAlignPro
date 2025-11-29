import React, { useState, useEffect } from 'react';
import { Settings2, ArrowUpFromLine, ArrowDownToLine, RotateCw, Ruler, MoveHorizontal } from 'lucide-react';
import { InitialMeasurements } from '../types';

interface MeasurementFormProps {
  measurements: InitialMeasurements;
  onMeasurementChange: (newValues: InitialMeasurements) => void;
  dimensions: {
    motorLength: number;
    couplingDist: number;
  };
  onDimensionChange: (key: 'motorLength' | 'couplingDist', value: number) => void;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  measurements,
  onMeasurementChange,
  dimensions,
  onDimensionChange
}) => {

  // Local state for text input values
  const [motorLengthText, setMotorLengthText] = useState(String(dimensions.motorLength));
  const [couplingDistText, setCouplingDistText] = useState(String(dimensions.couplingDist));
  const [offsetText, setOffsetText] = useState(String(measurements.initialOffset));
  const [angleText, setAngleText] = useState(String(measurements.initialAngle));

  // Sync with props when they change externally
  useEffect(() => {
    setMotorLengthText(String(dimensions.motorLength));
  }, [dimensions.motorLength]);

  useEffect(() => {
    setCouplingDistText(String(dimensions.couplingDist));
  }, [dimensions.couplingDist]);

  useEffect(() => {
    setOffsetText(String(measurements.initialOffset));
  }, [measurements.initialOffset]);

  useEffect(() => {
    setAngleText(String(measurements.initialAngle));
  }, [measurements.initialAngle]);

  const handleMeasurementChange = (key: keyof InitialMeasurements, value: string, setText: (v: string) => void) => {
    setText(value);

    // Allow empty string or just minus sign
    if (value === '' || value === '-' || value === '.') {
      onMeasurementChange({
        ...measurements,
        [key]: 0
      });
      return;
    }

    const num = parseFloat(value);
    if (!isNaN(num)) {
      onMeasurementChange({
        ...measurements,
        [key]: num
      });
    }
  };

  const handleDimensionChange = (key: 'motorLength' | 'couplingDist', value: string, setText: (v: string) => void) => {
    setText(value);

    // Allow empty string
    if (value === '' || value === '.') {
      return;
    }

    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onDimensionChange(key, num);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mb-6 space-y-6">

      {/* Section 1: Geometry */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
          <Ruler size={18} className="text-blue-600" />
          Геометрия (Размеры)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Размер AB (мм)
              <span className="block text-xs text-slate-400 font-normal">Пер. Лапа - Зад. Лапа</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MoveHorizontal size={16} />
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={motorLengthText}
                onChange={(e) => handleDimensionChange('motorLength', e.target.value, setMotorLengthText)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Размер BC (мм)
              <span className="block text-xs text-slate-400 font-normal">Муфта - Пер. Лапа</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MoveHorizontal size={16} />
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={couplingDistText}
                onChange={(e) => handleDimensionChange('couplingDist', e.target.value, setCouplingDistText)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Readings */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
          <Settings2 size={18} className="text-blue-600" />
          Показания прибора
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Offset Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Параллельное (мм)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                {measurements.initialOffset >= 0 ? <ArrowUpFromLine size={16} /> : <ArrowDownToLine size={16} />}
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={offsetText}
                onChange={(e) => handleMeasurementChange('initialOffset', e.target.value, setOffsetText)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${measurements.initialOffset === 0 ? 'bg-white border-slate-300 focus:ring-blue-500' :
                  measurements.initialOffset > 0.05 || measurements.initialOffset < -0.05 ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-green-300 bg-green-50 focus:ring-green-500'
                  }`}
              />
              <div className="text-xs text-slate-400 mt-1">
                "-" = Двигатель НИЖЕ
              </div>
            </div>
          </div>

          {/* Angle Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">
              Угловой (мм/100мм)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <RotateCw size={16} />
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={angleText}
                onChange={(e) => handleMeasurementChange('initialAngle', e.target.value, setAngleText)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${measurements.initialAngle === 0 ? 'bg-white border-slate-300 focus:ring-blue-500' :
                  Math.abs(measurements.initialAngle) > 0.05 ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-green-300 bg-green-50 focus:ring-green-500'
                  }`}
              />
              <div className="text-xs text-slate-400 mt-1">
                "-" = Раскрытие СНИЗУ
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};