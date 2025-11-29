import React from 'react';
import { AlignmentState, SimulationResult, InitialMeasurements } from '../types';

interface MachineCanvasProps {
  alignment: AlignmentState;
  results: SimulationResult;
  initialMeasurements: InitialMeasurements;
}

export const MachineCanvas: React.FC<MachineCanvasProps> = ({ alignment, results, initialMeasurements }) => {
  // --- CONFIGURATION & CONSTANTS ---
  const WIDTH = 600; // Reduced width to minimize side space
  const HEIGHT = 300; // Reduced height as requested
  const BASE_Y = 250; // Floor level (Moved up)
  const SHAFT_CENTER_Y_NEUTRAL = 150; // Where the pump shaft is fixed (Moved up)
  const COUPLING_CENTER_X = WIDTH / 2;

  // VISUAL SCALES
  // 1mm of movement = 5 pixels on screen
  const VERTICAL_SCALE = 5;

  // Geometry Definitions (X coordinates relative to Coupling Center)
  // These match the "Compact" visual style requested
  const GAP = 5; // Half gap
  const COUPLING_X = -GAP; // Motor coupling face

  // Restored Compact Foot Positions
  const FRONT_FOOT_X = -140;
  // Previous was -300. Shifted 40px right = -260.
  const REAR_FOOT_X = -260;

  // Derived Visual Dimensions for the SVG logic
  const VISUAL_MOTOR_LENGTH = Math.abs(FRONT_FOOT_X - REAR_FOOT_X); // 120px now

  // --- KINEMATIC CALCULATION (VISUAL ONLY) ---
  // To ensure the "Pivot" behavior feels real (e.g. adding shim to rear pivots around front),
  // we calculate the SVG transform based strictly on the feet positions on screen.

  // 1. Determine Shim Heights in Pixels (Upwards from floor)
  const rearShimPx = alignment.rearShim * VERTICAL_SCALE;
  const frontShimPx = alignment.frontShim * VERTICAL_SCALE;

  // 2. Calculate Slope in Screen Space (Y axis is Down in SVG, but let's think Cartesian first)
  // Cartesian: Y is UP.
  // Rear Point: (REAR_FOOT_X, rearShimPx)
  // Front Point: (FRONT_FOOT_X, frontShimPx)
  // Slope (m) = (y2 - y1) / (x2 - x1)
  const visualSlope = (frontShimPx - rearShimPx) / (FRONT_FOOT_X - REAR_FOOT_X);

  // 3. Calculate Height at Coupling (x = COUPLING_X) relative to shim base line
  // y - y1 = m(x - x1)
  // y_coupling = frontShimPx + visualSlope * (COUPLING_X - FRONT_FOOT_X)
  // (This assumes the motor body is a straight line connecting feet to coupling)
  const shimEffectAtCouplingPx = frontShimPx + (visualSlope * (COUPLING_X - FRONT_FOOT_X));

  // 4. Total Vertical Translation
  // The motor's coupling center should be at:
  // Neutral_Y - (InitialOffset + ShimEffect)
  // Initial Offset > 0 means Motor Higher.
  const totalVerticalShiftPx = (initialMeasurements.initialOffset * VERTICAL_SCALE) + shimEffectAtCouplingPx;
  const displayY = SHAFT_CENTER_Y_NEUTRAL - totalVerticalShiftPx;

  // 5. Rotation Angle
  // SVG Rotation is Clockwise Positive.
  // Positive Cartesian Slope (Front Higher) means Counter-Clockwise rotation.
  // So SVG Angle = -Cartesian Angle
  const visualAngleRad = Math.atan(visualSlope);
  const visualAngleDeg = -visualAngleRad * (180 / Math.PI);

  // Add Initial Angular Misalignment visual
  // initialAngle is mm/100mm -> roughly % slope.
  // Positive Initial Angle (Gap Top > Gap Bottom) usually means "Tail High" or "Tail Low" depending on standard.
  // Standard: Positive Gap Top means Coupling Open at Top -> Motor is "Nose Down" relative to Pump?
  // Let's assume: Initial Angle > 0 -> Slope > 0 (Nose Up).
  // We just add it to the rotation.
  const initialAngleDegVisual = -Math.atan(initialMeasurements.initialAngle / 100) * (180 / Math.PI);

  const displayAngle = visualAngleDeg + initialAngleDegVisual;

  // --- GRADIENTS ---
  const Gradients = () => (
    <defs>
      <linearGradient id="motorBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="40%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="ribsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="steelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="loadBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="2" height="4" transform="translate(0,0)" fill="#ef4444" opacity="0.3" />
      </pattern>
      {/* Arrowhead marker for dimensions */}
      <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M9,0 L0,3 L9,6" fill="none" stroke="#64748b" strokeWidth="1" />
      </marker>
      <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L10,3 L0,6" fill="none" stroke="#64748b" strokeWidth="1" />
      </marker>
    </defs>
  );

  // --- MOTOR SVG COMPONENT ---
  // Adjusted coordinates to be symmetric around Y=0 (Top -85, Bottom 85)
  const MotorGraphic = () => (
    <g transform="translate(5, 0)">
      {/* Rear Fan Cowl - Extended from -85 to 85 */}
      <path d="M-310,-85 Q-330,-85 -330,0 Q-330,85 -310,85 L-280,85 L-280,-85 Z" fill="url(#motorBodyGrad)" stroke="#172554" strokeWidth="2" />

      {/* Main Stator Body - from -85 to 85 (Height 170) */}
      <rect x="-280" y="-85" width="190" height="170" rx="5" fill="url(#motorBodyGrad)" stroke="#172554" strokeWidth="2" />

      {/* Cooling Ribs */}
      <g fill="url(#ribsGrad)" opacity="0.8">
        {[...Array(8)].map((_, i) => (
          <rect key={i} x="-280" y={-75 + (i * 20)} width="190" height="8" rx="2" />
        ))}
      </g>

      {/* Front End Shield - Symmetric from -85 to 85 */}
      <path d="M-90,-85 L-60,-50 L-60,50 L-90,85 Z" fill="#93c5fd" stroke="#1d4ed8" />

      {/* Bearing Cap */}
      <rect x="-65" y="-20" width="25" height="40" rx="2" fill="#60a5fa" />
    </g>
  );

  // --- GENERIC LOAD GRAPHIC ---
  // Adjusted coordinates to be symmetric around Y=0 (Top -85, Bottom 85)
  const GenericLoadGraphic = () => (
    <g transform="translate(55, 0)">
      {/* Extended height to 170 to match motor body range */}
      <rect x="0" y="-85" width="180" height="170" rx="4" fill="url(#loadBodyGrad)" stroke="#1e293b" strokeWidth="2" />
      <rect x="20" y="-75" width="140" height="10" rx="1" fill="#94a3b8" stroke="#475569" />
      <rect x="20" y="-50" width="60" height="100" rx="2" fill="#334155" opacity="0.3" stroke="#1e293b" />
      <rect x="100" y="-50" width="60" height="100" rx="2" fill="#334155" opacity="0.3" stroke="#1e293b" />
      <path d="M0,-30 L-20,-30 L-20,30 L0,30 Z" fill="#64748b" stroke="#334155" />
      {/* Corner bolts symmetric */}
      <circle cx="10" cy="-75" r="3" fill="#cbd5e1" />
      <circle cx="170" cy="-75" r="3" fill="#cbd5e1" />
      <circle cx="10" cy="75" r="3" fill="#cbd5e1" />
      <circle cx="170" cy="75" r="3" fill="#cbd5e1" />
    </g>
  );

  const DimensionLine = ({ x1, x2, y, label, value, color = "#64748b" }: { x1: number, x2: number, y: number, label: string, value: number, color?: string }) => (
    <g>
      {/* Main horizontal line */}
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="1" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
      {/* Vertical ticks */}
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke={color} strokeWidth="1" />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke={color} strokeWidth="1" />
      {/* Label Background - Scaled up */}
      <rect x={(x1 + x2) / 2 - 45} y={y - 12} width="90" height="24" fill="rgba(255,255,255,0.8)" rx="3" />
      {/* Label Text - Increased font size to 16. REMOVED LABEL PREFIX (AB/BC) */}
      <text x={(x1 + x2) / 2} y={y + 6} textAnchor="middle" fontSize="16" fill={color} fontFamily="monospace" fontWeight="bold">
        {value}
      </text>
    </g>
  );

  // Derived constants for drawing feet
  const MACHINE_BOTTOM_Y = 85; // Y relative to shaft (Increased from 70 to reduce feet height)
  const FOOT_BASE_Y = BASE_Y - SHAFT_CENTER_Y_NEUTRAL; // Distance from neutral shaft to floor (100px)
  // Feet height is now 100 - 85 = 15px

  return (
    <div className="w-full sm:h-[300px] aspect-[2/1] sm:aspect-auto bg-slate-50 border border-slate-300 rounded-xl overflow-hidden relative shadow-inner group">
      <svg className="w-full h-full" viewBox="-30 0 600 300" preserveAspectRatio="xMinYMid meet">
        <Gradients />

        {/* Floor */}
        <line x1="-30" y1={BASE_Y} x2="570" y2={BASE_Y} stroke="#94a3b8" strokeWidth="4" />
        <path d="M-30 250 L570 250 L570 300 L-30 300 Z" fill="#e2e8f0" opacity="0.3" />

        {/* Target Axis Line */}
        <line x1="-30" y1={SHAFT_CENTER_Y_NEUTRAL} x2="570" y2={SHAFT_CENTER_Y_NEUTRAL} stroke="#ef4444" strokeWidth="1" strokeDasharray="6,4" opacity="0.3" />

        {/* --- STATIC LOAD (RIGHT) --- */}
        <g transform={`translate(${COUPLING_CENTER_X}, ${SHAFT_CENTER_Y_NEUTRAL})`}>
          {/* Coupling Half */}
          <rect x={GAP} y="-10" width="30" height="20" fill="url(#steelGrad)" stroke="#94a3b8" />
          <g>
            <rect x={GAP} y="-32" width="8" height="64" rx="2" fill="url(#steelGrad)" stroke="#64748b" />
            <rect x={GAP + 8} y="-16" width="12" height="32" rx="1" fill="url(#steelGrad)" stroke="#94a3b8" />
          </g>
          <GenericLoadGraphic />
          <g transform={`translate(0, ${MACHINE_BOTTOM_Y})`}>
            {/* Front Foot (Right Machine) */}
            <rect x="75" y="0" width="50" height={FOOT_BASE_Y - MACHINE_BOTTOM_Y} fill="#475569" />
            {/* Rear Foot (Right Machine) - Shifted 10px left from 185 to 175 */}
            <rect x="175" y="0" width="50" height={FOOT_BASE_Y - MACHINE_BOTTOM_Y} fill="#475569" />
          </g>
        </g>

        {/* --- MOVABLE MOTOR (LEFT) --- */}
        <g transform={`translate(${COUPLING_CENTER_X}, ${displayY}) rotate(${displayAngle})`}>

          {/* Shaft */}
          <rect x={-GAP - 30} y="-10" width="30" height="20" fill="url(#steelGrad)" stroke="#94a3b8" />
          {/* Coupling Half */}
          <g>
            <rect x={-GAP - 20} y="-16" width="12" height="32" rx="1" fill="url(#steelGrad)" stroke="#94a3b8" />
            <rect x={-GAP - 8} y="-32" width="8" height="64" rx="2" fill="url(#steelGrad)" stroke="#64748b" />
          </g>

          <MotorGraphic />

          {/* Rear Foot - Shortened to 15px height */}
          <g transform={`translate(${REAR_FOOT_X}, ${MACHINE_BOTTOM_Y})`}>
            <path d={`M0,0 L40,0 L50,15 L-10,15 Z`} fill="#1e3a8a" />
            {/* Shims (Positive) */}
            {alignment.rearShim > 0 && (
              <rect x="-5" y="15" width="50" height={alignment.rearShim * VERTICAL_SCALE} fill="#fbbf24" stroke="#d97706" rx="1" />
            )}
            {/* Shims (Negative/Cut) - Visualizing Removed Material */}
            {alignment.rearShim < 0 && (
              <rect x="-5" y={15 + (alignment.rearShim * VERTICAL_SCALE)} width="50" height={Math.abs(alignment.rearShim * VERTICAL_SCALE)} fill="url(#hatch)" stroke="#ef4444" strokeDasharray="2,2" rx="1" />
            )}
          </g>

          {/* Front Foot - Shortened to 15px height */}
          <g transform={`translate(${FRONT_FOOT_X}, ${MACHINE_BOTTOM_Y})`}>
            <path d={`M0,0 L40,0 L50,15 L-10,15 Z`} fill="#1e3a8a" />
            {/* Shims (Positive) */}
            {alignment.frontShim > 0 && (
              <rect x="-5" y="15" width="50" height={alignment.frontShim * VERTICAL_SCALE} fill="#fbbf24" stroke="#d97706" rx="1" />
            )}
            {/* Shims (Negative/Cut) */}
            {alignment.frontShim < 0 && (
              <rect x="-5" y={15 + (alignment.frontShim * VERTICAL_SCALE)} width="50" height={Math.abs(alignment.frontShim * VERTICAL_SCALE)} fill="url(#hatch)" stroke="#ef4444" strokeDasharray="2,2" rx="1" />
            )}
          </g>
        </g>

        {/* --- DIMENSION LINES --- */}
        {/* Drawn relative to the floor/fixed space, translated to align with Motor X axis */}
        <g transform={`translate(${COUPLING_CENTER_X}, 0)`}>
          {/* AB Dimension: Rear Foot to Front Foot */}
          <DimensionLine
            x1={REAR_FOOT_X + 20} // Roughly center of foot (Foot width is ~50, path is 0 to 50)
            x2={FRONT_FOOT_X + 20}
            y={BASE_Y + 40}
            label="AB"
            value={alignment.motorLength}
          />

          {/* BC Dimension: Front Foot to Coupling */}
          <DimensionLine
            x1={FRONT_FOOT_X + 20}
            x2={0} // Coupling center
            y={BASE_Y + 40}
            label="BC"
            value={alignment.couplingDist}
          />
        </g>

      </svg>
    </div>
  );
};