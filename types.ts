export interface AlignmentState {
  rearShim: number; // Толщина добавленных пластин под задней лапой (мм)
  frontShim: number; // Толщина добавленных пластин под передней лапой (мм)
  motorLength: number; // Расстояние между лапами (мм)
  couplingDist: number; // Расстояние от передней лапы до муфты (мм)
}

export interface InitialMeasurements {
  initialOffset: number; // Начальное смещение (мм). < 0 = Низко, > 0 = Высоко
  initialAngle: number; // Начальный излом (мм/100мм).
}

export interface SimulationResult {
  verticalOffset: number; // Итоговое смещение центров
  angularMisalignment: number; // Итоговая угловая расцентровка (мм/100мм)
  gapTop: number; // Раскрытие сверху
  gapBottom: number; // Раскрытие снизу
}

export enum ToolType {
  CALCULATOR = 'CALCULATOR',
  SIMULATOR = 'SIMULATOR'
}