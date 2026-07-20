export type Direction = "east" | "west" | "south" | "north";

export interface DirectionWall {
  length: number;
  height: number;
  deductionRate: number;
}

export interface Opening {
  direction: Direction;
  width: number;
  height: number;
  quantity: number;
}

export interface MeasurementInput {
  walls: Record<Direction, DirectionWall>;
  deductionMethod: "RATE" | "OPENINGS";
  openings?: Opening[];
  scaffoldClearance?: number;
  roofPlanArea?: number;
  leftRoofPitch?: number;
  rightRoofPitch?: number;
  leftRoofPlanArea?: number;
  rightRoofPlanArea?: number;
  fasciaLength?: number;
  eavesGutterLength?: number;
  verticalGutterLength?: number;
  soffitArea?: number;
  foundationArea?: number;
}

const directions: Direction[] = ["east", "west", "south", "north"];
const safe = (value: number) => Number.isFinite(value) ? value : 0;
const round = (value: number, digits = 3) => Number(value.toFixed(digits));

export function roofPitchFactor(pitch: number): number {
  return Math.sqrt(1 + Math.pow(safe(pitch) / 10, 2));
}

export function calculateMeasurements(input: MeasurementInput) {
  const grossByDirection = Object.fromEntries(directions.map((key) => {
    const wall = input.walls[key];
    return [key, safe(wall.length) * safe(wall.height)];
  })) as Record<Direction, number>;
  const openingByDirection = Object.fromEntries(directions.map((key) => [key, 0])) as Record<Direction, number>;
  for (const opening of input.openings ?? []) {
    openingByDirection[opening.direction] += safe(opening.width) * safe(opening.height) * safe(opening.quantity);
  }
  const netByDirection = Object.fromEntries(directions.map((key) => {
    const gross = grossByDirection[key];
    const deduction = input.deductionMethod === "RATE"
      ? gross * safe(input.walls[key].deductionRate) / 100
      : openingByDirection[key];
    return [key, Math.max(0, gross - deduction)];
  })) as Record<Direction, number>;
  const perimeter = directions.reduce((sum, key) => sum + safe(input.walls[key].length), 0);
  const grossWallArea = directions.reduce((sum, key) => sum + grossByDirection[key], 0);
  const netWallArea = directions.reduce((sum, key) => sum + netByDirection[key], 0);
  const maxHeight = Math.max(...directions.map((key) => safe(input.walls[key].height)));
  const scaffoldArea = perimeter * (maxHeight + safe(input.scaffoldClearance ?? 1));
  const roofArea = input.leftRoofPlanArea != null || input.rightRoofPlanArea != null
    ? safe(input.leftRoofPlanArea ?? 0) * roofPitchFactor(input.leftRoofPitch ?? 0)
      + safe(input.rightRoofPlanArea ?? 0) * roofPitchFactor(input.rightRoofPitch ?? 0)
    : safe(input.roofPlanArea ?? 0) * (roofPitchFactor(input.leftRoofPitch ?? 0) + roofPitchFactor(input.rightRoofPitch ?? input.leftRoofPitch ?? 0)) / 2;
  return {
    WALL_PERIMETER: round(perimeter), GROSS_WALL_AREA: round(grossWallArea), NET_WALL_AREA: round(netWallArea),
    SCAFFOLD_AREA: round(scaffoldArea), ROOF_AREA: round(roofArea), EXTERIOR_TOTAL_AREA: round(netWallArea + roofArea),
    FASCIA_LENGTH: safe(input.fasciaLength ?? 0), EAVES_GUTTER_LENGTH: safe(input.eavesGutterLength ?? 0),
    VERTICAL_GUTTER_LENGTH: safe(input.verticalGutterLength ?? 0), SOFFIT_AREA: safe(input.soffitArea ?? 0),
    FOUNDATION_AREA: safe(input.foundationArea ?? 0), grossByDirection, netByDirection, openingByDirection,
  };
}

export function adoptedValue(autoValue: number | null | undefined, manualValue: number | null | undefined) {
  return manualValue === null || manualValue === undefined ? (autoValue ?? 0) : manualValue;
}

export function calculateLine(autoQuantity: number | null, manualQuantity: number | null, standardPrice: number, manualPrice: number | null, costPrice: number) {
  const quantity = adoptedValue(autoQuantity, manualQuantity);
  const price = adoptedValue(standardPrice, manualPrice);
  const sales = round(quantity * price, 0);
  const cost = round(quantity * costPrice, 0);
  const profit = sales - cost;
  return { quantity, price, sales, cost, profit, profitRate: sales === 0 ? 0 : profit / sales };
}

export function calculateEstimate(lineAmounts: number[], discount: number, taxRate: number) {
  const subtotal = lineAmounts.reduce((sum, value) => sum + value, 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.floor(taxable * taxRate);
  return { subtotal, discount, taxable, tax, total: taxable + tax };
}

export function calculateMaterial(targetArea: number, coverage: number, coats: number, lossRate: number, containerSize: number) {
  const requiredAmount = targetArea * coverage * coats * (1 + lossRate);
  return { requiredAmount: round(requiredAmount), requiredCans: containerSize > 0 ? Math.ceil(requiredAmount / containerSize) : 0 };
}
