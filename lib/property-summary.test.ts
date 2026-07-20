import { describe, expect, it } from "vitest";
import { calculateProperty } from "./property-summary";

const base = {
  eastWallLength: 10, westWallLength: 10, southWallLength: 8, northWallLength: 8,
  eastWallHeight: 6, westWallHeight: 6, southWallHeight: 6, northWallHeight: 6,
  eastDeductionRate: 10, westDeductionRate: 10, southDeductionRate: 20, northDeductionRate: 20,
  deductionMethod: "RATE",
};

describe("物件概要", () => {
  it("方角別外壁と控除率を計算する", () => expect(calculateProperty(base).NET_WALL_AREA).toBe(184.8));
  it("個別開口部を控除する", () => expect(calculateProperty({ ...base, deductionMethod: "OPENINGS" }, [{ name: "窓", direction: "east", width: 2, height: 1, quantity: 2 }]).NET_WALL_AREA).toBe(212));
  it("左右の屋根勾配を個別反映する", () => expect(calculateProperty({ ...base, leftRoofProjectedArea: 40, rightRoofProjectedArea: 40, leftRoofPitch: 4, rightRoofPitch: 6 }).ROOF_AREA).toBe(89.73));
  it("Excel式と同じ足場の離れと高さ加算を使う", () => expect(calculateProperty(base).SCAFFOLD_AREA).toBe(257.6));
  it("寸法未入力では足場数量を0として表示対象外にする", () => expect(calculateProperty({}).SCAFFOLD_AREA).toBe(0));
});
