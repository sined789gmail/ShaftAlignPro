import React from 'react';
import { AlignmentState, SimulationResult } from '../types';

interface MachineCanvasProps {
  alignment: AlignmentState;
  results: SimulationResult;
}

export const MachineCanvas: React.FC<MachineCanvasProps> = ({ alignment, results }) => {
  // Constants for drawing
  const WIDTH = 800;
  const HEIGHT = 450;
  const BASE_Y = 380; // Floor level Y
  const SHAFT_HEIGHT = 300; // Center of the shaft Y
  const COUPLING_CENTER_X = WIDTH / 2; // 400
  
  // Gap calculation
  // We want 10px gap between Motor Coupling Face and Mechanism Shaft
  // Mechanism Shaft starts at +5. Motor Coupling Face ends at -5.
  const HALF_GAP = 5; 
  
  // Visual Amplification for Misalignment
  const VISUAL_AMP = 150; // 1mm offset = 150px on screen

  // Motor Position Calculation
  const motorCouplingY = SHAFT_HEIGHT - (results.verticalOffset * VISUAL_AMP);
  
  // Angle calculation
  const angleRad = Math.atan(results.angularMisalignment); 
  const angleDeg = -(angleRad * (180 / Math.PI));

  // Dynamic Feet Calculation
  const FLOOR_REL_Y = BASE_Y - SHAFT_HEIGHT; // Distance from shaft center to floor (80px)
  
  // We define the bottom of the machine bodies relative to the shaft center
  // This ensures the feet attach exactly at the bottom of the machines
  const MACHINE_BOTTOM_Y = 70; 
  
  // The height of the feet brackets themselves to reach the floor (shim=0)
  const FOOT_BRACKET_HEIGHT = FLOOR_REL_Y - MACHINE_BOTTOM_Y; // 80 - 70 = 10px

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
    </defs>
  );

  // --- MOTOR SVG COMPONENT ---
  // Adjusted transform to connect with 30px shaft
  const MotorGraphic = () => (
    <g transform="translate(-35, 0)">
      {/* Rear Fan Cowl */}
      <path d="M-240,-70 Q-260,-70 -260,0 Q-260,70 -240,70 L-210,70 L-210,-70 Z" fill="url(#motorBodyGrad)" stroke="#172554" strokeWidth="2"/>
      
      {/* Main Stator Body - Bottom at Y=70 */}
      <rect x="-210" y="-70" width="180" height="140" rx="5" fill="url(#motorBodyGrad)" stroke="#172554" strokeWidth="2" />
      
      {/* Cooling Ribs */}
      <g fill="url(#ribsGrad)" opacity="0.8">
         {[...Array(7)].map((_, i) => (
            <rect key={i} x="-210" y={-60 + (i * 20)} width="180" height="8" rx="2" />
         ))}
      </g>

      {/* Front End Shield */}
      <path d="M-30,-65 L-10,-50 L-10,50 L-30,65 Z" fill="#93c5fd" stroke="#1d4ed8" />
      
      {/* Bearing Cap */}
      <rect x="-15" y="-20" width="15" height="40" rx="2" fill="#60a5fa" />
    </g>
  );

  // --- GENERIC LOAD (DRIVEN MACHINE) COMPONENT ---
  // Adjusted transform to connect with 30px shaft
  const GenericLoadGraphic = () => (
    <g transform="translate(55, 0)"> 
      {/* Main Housing Box */}
      <rect x="0" y="-70" width="180" height="140" rx="4" fill="url(#loadBodyGrad)" stroke="#1e293b" strokeWidth="2" />
      
      {/* Top cover/inspection plate */}
      <rect x="20" y="-75" width="140" height="10" rx="1" fill="#94a3b8" stroke="#475569" />
      
      {/* Side details / panels */}
      <rect x="20" y="-50" width="60" height="100" rx="2" fill="#334155" opacity="0.3" stroke="#1e293b" />
      <rect x="100" y="-50" width="60" height="100" rx="2" fill="#334155" opacity="0.3" stroke="#1e293b" />

      {/* Input Shaft Housing */}
      <path d="M0,-30 L-20,-30 L-20,30 L0,30 Z" fill="#64748b" stroke="#334155" />
      
      {/* Bolts */}
      <circle cx="10" cy="-60" r="3" fill="#cbd5e1" />
      <circle cx="170" cy="-60" r="3" fill="#cbd5e1" />
      <circle cx="10" cy="60" r="3" fill="#cbd5e1" />
      <circle cx="170" cy="60" r="3" fill="#cbd5e1" />
    </g>
  );

  return (
    <div className="w-full h-[400px] bg-slate-50 border border-slate-300 rounded-xl overflow-hidden relative shadow-inner group">
      <div className="absolute top-4 right-4 text-xs text-slate-400 font-mono text-right pointer-events-none select-none z-10">
        Визуализация x{VISUAL_AMP}<br/>
        Симуляция расцентровки
      </div>

      <svg className="w-full h-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <Gradients />

        {/* Floor (Fixed reference) */}
        <line x1="0" y1={BASE_Y} x2={WIDTH} y2={BASE_Y} stroke="#94a3b8" strokeWidth="4" />
        <path d={`M0,${BASE_Y} L${WIDTH},${BASE_Y} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`} fill="#e2e8f0" opacity="0.3" />
        
        {/* Reference Line (Target Axis) */}
        <line x1="0" y1={SHAFT_HEIGHT} x2={WIDTH} y2={SHAFT_HEIGHT} stroke="#ef4444" strokeWidth="1" strokeDasharray="6,4" opacity="0.3" />

        {/* --- STATIC MACHINE (DRIVEN LOAD) - RIGHT SIDE --- */}
        <g transform={`translate(${COUPLING_CENTER_X}, ${SHAFT_HEIGHT})`}>
            
            {/* Shaft - 30px long */}
            {/* Starts at +5 from center, length 30 */}
            <rect x={HALF_GAP} y="-10" width="30" height="20" fill="url(#steelGrad)" stroke="#94a3b8" />
            
            {/* Mechanism Coupling Half */}
            {/* Mirror of Motor Coupling: Flange starts at +5 (HALF_GAP), Hub follows */}
            <g>
               {/* Flange Face - Starts exactly at +HALF_GAP (+5px) */}
               <rect x={HALF_GAP} y="-32" width="8" height="64" rx="2" fill="url(#steelGrad)" stroke="#64748b" />
               {/* Hub */}
               <rect x={HALF_GAP + 8} y="-16" width="12" height="32" rx="1" fill="url(#steelGrad)" stroke="#94a3b8" />
               
               {/* Bolt holes */}
               <circle cx={HALF_GAP + 4} cy="-22" r="2" fill="#334155" opacity="0.4" />
               <circle cx={HALF_GAP + 4} cy="22" r="2" fill="#334155" opacity="0.4" />
            </g>

            {/* Load Graphic */}
            <GenericLoadGraphic />

            {/* Load Feet (Static) - Adjusted for new body position */}
            <g transform={`translate(0, ${MACHINE_BOTTOM_Y})`}>
                {/* Front Foot (Adjusted relative to body shift) */}
                <rect x="75" y="0" width="50" height={FOOT_BRACKET_HEIGHT} fill="#475569" />
                {/* Rear Foot */}
                <rect x="185" y="0" width="50" height={FOOT_BRACKET_HEIGHT} fill="#475569" />
            </g>
        </g>


        {/* --- MOVABLE MACHINE (MOTOR) - LEFT SIDE --- */}
        <g transform={`translate(${COUPLING_CENTER_X}, ${motorCouplingY}) rotate(${angleDeg})`}>
            
            {/* Motor Shaft - 30px long */}
            {/* Extends from -35 to -5 */}
            <rect x={-HALF_GAP - 30} y="-10" width="30" height="20" fill="url(#steelGrad)" stroke="#94a3b8" />

            {/* Motor Coupling Half */}
            {/* Placed at the end of the motor shaft */}
            <g>
               {/* Hub */}
               <rect x={-HALF_GAP - 20} y="-16" width="12" height="32" rx="1" fill="url(#steelGrad)" stroke="#94a3b8" />
               {/* Flange Face - Ends exactly at -HALF_GAP (-5px) */}
               <rect x={-HALF_GAP - 8} y="-32" width="8" height="64" rx="2" fill="url(#steelGrad)" stroke="#64748b" />
               
               {/* Bolt holes */}
               <circle cx={-HALF_GAP - 4} cy="-22" r="2" fill="#334155" opacity="0.4" />
               <circle cx={-HALF_GAP - 4} cy="22" r="2" fill="#334155" opacity="0.4" />
            </g>

            {/* Motor Graphic */}
            <MotorGraphic />

            {/* Dynamic Feet & Shims - Adjusted for new body position */}
            
            {/* Rear Foot (Left) */}
            <g transform={`translate(-215, ${MACHINE_BOTTOM_Y})`}>
                {/* Base Plate */}
                <path d={`M0,0 L40,0 L50,${FOOT_BRACKET_HEIGHT} L-10,${FOOT_BRACKET_HEIGHT} Z`} fill="#1e3a8a" /> 
                {/* Shims */}
                {alignment.rearShim > 0 && (
                    <rect x="-5" y={FOOT_BRACKET_HEIGHT} width="50" height={alignment.rearShim * 4} fill="#fbbf24" stroke="#d97706" rx="1" />
                )}
            </g>

            {/* Front Foot (Right) */}
            <g transform={`translate(-105, ${MACHINE_BOTTOM_Y})`}>
                {/* Base Plate */}
                <path d={`M0,0 L40,0 L50,${FOOT_BRACKET_HEIGHT} L-10,${FOOT_BRACKET_HEIGHT} Z`} fill="#1e3a8a" />
                {/* Shims */}
                {alignment.frontShim > 0 && (
                    <rect x="-5" y={FOOT_BRACKET_HEIGHT} width="50" height={alignment.frontShim * 4} fill="#fbbf24" stroke="#d97706" rx="1"/>
                )}
            </g>
        </g>

      </svg>
    </div>
  );
};