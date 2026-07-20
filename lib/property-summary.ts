export const directions = ["east", "west", "south", "north"] as const;
export type Direction = typeof directions[number];
export type CustomAccessory = { name: string; quantity: number; unit: string; notes?: string };
export type PropertyValues = Record<string, string | number | boolean | null | CustomAccessory[]>;
export type PropertyOpening = { id?: string; name: string; direction: Direction; width: number; height: number; quantity: number; notes?: string };

const n = (values: PropertyValues, key: string) => {
  const value = Number(values[key] ?? 0);
  return Number.isFinite(value) ? value : 0;
};
const b = (values: PropertyValues, key: string) => values[key] === true;
const r = (value: number) => Number(value.toFixed(2));
export const roofFactor = (pitch: number) => Math.sqrt(1 + Math.pow(pitch / 10, 2));

export function calculateProperty(values: PropertyValues, openings: PropertyOpening[] = []) {
  const grossWallByDirection = Object.fromEntries(directions.map(d => [d, n(values, `${d}WallLength`) * n(values, `${d}WallHeight`)])) as Record<Direction, number>;
  const openingByDirection = Object.fromEntries(directions.map(d => [d, 0])) as Record<Direction, number>;
  for (const opening of openings) openingByDirection[opening.direction] += opening.width * opening.height * opening.quantity;
  const deductionMethod = String(values.deductionMethod ?? "RATE");
  const netWallByDirection = Object.fromEntries(directions.map(d => {
    const gross = grossWallByDirection[d];
    const deduction = deductionMethod === "OPENINGS" ? openingByDirection[d] : gross * n(values, `${d}DeductionRate`) / 100;
    return [d, Math.max(0, gross - deduction)];
  })) as Record<Direction, number>;
  const wallPerimeter = directions.reduce((sum, d) => sum + n(values, `${d}WallLength`), 0);
  const grossWallArea = directions.reduce((sum, d) => sum + grossWallByDirection[d], 0);
  const netWallArea = directions.reduce((sum, d) => sum + netWallByDirection[d], 0);

  // Excel G13: 各面の長さに隣接する軒先長さと離れ0.2mを加え、高さ+1mを掛ける。
  const scaffold = (length: number, adjacent1: number, adjacent2: number, height: number) => length + adjacent1 + adjacent2 === 0 ? 0 : (length + adjacent1 + adjacent2 + 0.2) * (height + 1);
  const scaffoldByDirection = {
    east: scaffold(n(values, "eastWallLength"), n(values, "southEaveLength"), n(values, "northEaveLength"), n(values, "eastWallHeight")),
    west: scaffold(n(values, "westWallLength"), n(values, "southEaveLength"), n(values, "northEaveLength"), n(values, "westWallHeight")),
    south: scaffold(n(values, "southWallLength"), n(values, "eastEaveLength"), n(values, "westEaveLength"), n(values, "southWallHeight")),
    north: scaffold(n(values, "northWallLength"), n(values, "eastEaveLength"), n(values, "westEaveLength"), n(values, "northWallHeight")),
  };
  const scaffoldArea = Object.values(scaffoldByDirection).reduce((sum, value) => sum + value, 0);

  const leftRoofArea = n(values, "leftRoofProjectedArea") * roofFactor(n(values, "leftRoofPitch"));
  const rightRoofArea = n(values, "rightRoofProjectedArea") * roofFactor(n(values, "rightRoofPitch"));
  const grossRoofArea = leftRoofArea + rightRoofArea;
  const netRoofArea = grossRoofArea * (1 - n(values, "roofDeductionRate") / 100);

  const verticalJoint = n(values, "verticalJointCount") * n(values, "averageWallHeight");
  const horizontalJoint = n(values, "horizontalJointCount") * wallPerimeter;
  const sashSealing = n(values, "sashWidth") * n(values, "sashQuantity");
  const balconySealing = n(values, "balconySealingLength");

  const foundationArea = directions.reduce((sum, d) => sum + (b(values, `${d}FoundationEnabled`) ? n(values, `${d}WallLength`) * n(values, "foundationHeight") : 0), 0);
  const fasciaLength = directions.reduce((sum, d) => sum + (b(values, `${d}FasciaEnabled`) ? n(values, `${d}RoofEdgeLength`) : 0), 0);
  const eavesGutterLength = directions.reduce((sum, d) => sum + (b(values, `${d}GutterEnabled`) ? n(values, `${d}WallLength`) : 0), 0);
  const soffitArea = directions.reduce((sum, d) => sum + (b(values, `${d}SoffitEnabled`) ? n(values, `${d}WallLength`) * n(values, `${d}EaveLength`) : 0), 0);

  return {
    WALL_PERIMETER: r(wallPerimeter), GROSS_WALL_AREA: r(grossWallArea), NET_WALL_AREA: r(netWallArea),
    SCAFFOLD_AREA: r(scaffoldArea), ROOF_AREA: r(netRoofArea), GROSS_ROOF_AREA: r(grossRoofArea),
    EXTERIOR_TOTAL_AREA: r(netWallArea + netRoofArea), VERTICAL_JOINT: r(verticalJoint), HORIZONTAL_JOINT: r(horizontalJoint),
    SEALING_LENGTH: r(verticalJoint + horizontalJoint + sashSealing + balconySealing), FOUNDATION_AREA: r(foundationArea),
    FASCIA_LENGTH: r(fasciaLength + n(values, "fasciaManual")), EAVES_GUTTER_LENGTH: r(eavesGutterLength + n(values, "eavesGutterManual")),
    VERTICAL_GUTTER_LENGTH: r(n(values, "verticalGutterLength")), SOFFIT_AREA: r(soffitArea + n(values, "soffitManual")),
    LONG_SHEET_AREA: r(n(values, "corridorArea") + n(values, "stairsArea") + n(values, "longSheetOtherArea")),
    grossWallByDirection, netWallByDirection, openingByDirection, scaffoldByDirection,
  };
}
