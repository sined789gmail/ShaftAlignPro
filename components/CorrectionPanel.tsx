import React from 'react';
import { InitialMeasurements } from '../types';
import { Calculator, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface CorrectionPanelProps {
    measurements: InitialMeasurements;
    dimensions: {
        motorLength: number;
        couplingDist: number;
    };
}

export const CorrectionPanel: React.FC<CorrectionPanelProps> = ({ measurements, dimensions }) => {
    const { initialOffset, initialAngle } = measurements;
    const { motorLength, couplingDist } = dimensions;

    // Calculate required corrections
    // Target: Final Offset = 0, Final Angle = 0

    // 1. Calculate required slope change to zero out the angle
    // initialAngle is in mm/100mm
    const initialSlope = initialAngle / 100;
    const requiredSlopeChange = -initialSlope;

    // 2. Calculate required Front Shim
    // We want: initialOffset + shimOffsetEffect = 0
    // shimOffsetEffect = frontShim + (slopeChange * couplingDist)
    // So: frontShim = -initialOffset - (slopeChange * couplingDist)
    const requiredFrontShim = -initialOffset - (requiredSlopeChange * couplingDist);

    // 3. Calculate required Rear Shim
    // slopeChange = (frontShim - rearShim) / motorLength
    // frontShim - rearShim = slopeChange * motorLength
    // rearShim = frontShim - (slopeChange * motorLength)
    const requiredRearShim = requiredFrontShim - (requiredSlopeChange * motorLength);

    const formatValue = (val: number) => {
        const absVal = Math.abs(val);
        const sign = val >= 0 ? '+' : '-';
        return {
            value: absVal.toFixed(3),
            sign,
            isPositive: val >= 0
        };
    };

    const front = formatValue(requiredFrontShim);
    const rear = formatValue(requiredRearShim);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Calculator size={18} className="text-purple-500" />
                Расчет центровки
            </h3>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Rear Foot */}
                    <div className={`p-3 rounded-lg border ${rear.isPositive ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Задняя лапа</div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-mono font-bold ${rear.isPositive ? 'text-blue-700' : 'text-amber-700'}`}>
                                {rear.sign}{rear.value}
                            </span>
                            <span className="text-sm text-slate-400">мм</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium">
                            {rear.isPositive ? (
                                <>
                                    <ArrowUpFromLine size={12} className="text-blue-600" />
                                    <span className="text-blue-700">Добавить</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDownToLine size={12} className="text-amber-600" />
                                    <span className="text-amber-700">Убрать</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Front Foot */}
                    <div className={`p-3 rounded-lg border ${front.isPositive ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Передняя лапа</div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-mono font-bold ${front.isPositive ? 'text-blue-700' : 'text-amber-700'}`}>
                                {front.sign}{front.value}
                            </span>
                            <span className="text-sm text-slate-400">мм</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium">
                            {front.isPositive ? (
                                <>
                                    <ArrowUpFromLine size={12} className="text-blue-600" />
                                    <span className="text-blue-700">Добавить</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDownToLine size={12} className="text-amber-600" />
                                    <span className="text-amber-700">Убрать</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-xs text-slate-400 italic text-center">
                    * Положительные значения означают добавление пластин, отрицательные — удаление.
                </div>
            </div>
        </div>
    );
};
