import { AlignmentState, InitialMeasurements, SimulationResult } from "../types";

/**
 * Calculates the alignment result based on:
 * 1. Initial measured misalignment (offset and angle)
 * 2. Correction applied by adding shims to feet.
 * 
 * Logic:
 * Final Offset = Initial Offset + Change in Offset due to Shims
 * Final Angle = Initial Angle + Change in Angle due to Shims
 */

export const calculateAlignment = (
  state: AlignmentState, 
  measurements: InitialMeasurements
): SimulationResult => {
  const { rearShim, frontShim, motorLength, couplingDist } = state;
  const { initialOffset, initialAngle } = measurements;

  // 1. Calculate the GEOMETRY CHANGE caused by the shims alone.
  // Assuming shims = 0 is the neutral point (no change from initial state).
  
  // Slope change (Rise / Run)
  // Positive slope means pointing UP towards the coupling (Front higher than Rear)
  const shimSlope = (frontShim - rearShim) / motorLength;

  // Vertical Offset change at Coupling Center
  // Coupling is 'couplingDist' away from front foot.
  // The front foot lifts the whole line by 'frontShim'.
  // The slope adds additional height over the distance to the coupling.
  const shimOffsetEffect = frontShim + (shimSlope * couplingDist);

  // 2. Apply changes to the Initial Measurements
  // Note: initialAngle is in mm/100mm which is essentially a slope * 100.
  // We need to work in consistent units.
  
  // Convert initial angle (mm/100mm) to actual slope (mm/mm)
  const initialSlopeRaw = initialAngle / 100;

  // Total Slope
  const totalSlope = initialSlopeRaw + shimSlope;

  // Total Vertical Offset
  // If initial offset was -0.5 (Low), and shimOffsetEffect is +0.5, result is 0.
  const verticalOffset = initialOffset + shimOffsetEffect;

  // Total Angular Misalignment (convert back to mm/100mm standard)
  const angularMisalignment = totalSlope; // We keep it as unitless slope here for logic, but display multiplies by 100

  // 3. Calculate Gaps (Top/Bottom) for visualization
  // Standard 100mm diameter coupling
  const couplingDiameter = 100;
  const gapDiff = totalSlope * couplingDiameter;
  
  const baseGap = 3.0; // Slightly larger visual gap
  const gapTop = baseGap - (gapDiff / 2);
  const gapBottom = baseGap + (gapDiff / 2);

  return {
    verticalOffset,
    angularMisalignment, // This is actually the slope (tan theta)
    gapTop,
    gapBottom
  };
};