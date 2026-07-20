import { describe, expect, it } from "vitest";
import { adoptedValue, calculateEstimate, calculateLine, calculateMaterial, calculateMeasurements } from "./calculations";

const walls = {
  east: { length: 10, height: 6, deductionRate: 10 }, west: { length: 10, height: 6, deductionRate: 10 },
  south: { length: 8, height: 6, deductionRate: 20 }, north: { length: 8, height: 6, deductionRate: 20 },
};

describe("見積計算", () => {
  it("0を有効な手入力値として採用する", () => expect(adoptedValue(12, 0)).toBe(0));
  it("空欄なら自動値へ戻る", () => expect(adoptedValue(12, null)).toBe(12));
  it("控除率方式を方角別に計算する", () => expect(calculateMeasurements({ walls, deductionMethod: "RATE" }).NET_WALL_AREA).toBe(184.8));
  it("個別開口部方式を計算する", () => expect(calculateMeasurements({ walls, deductionMethod: "OPENINGS", openings: [{ direction: "east", width: 2, height: 1, quantity: 2 }] }).NET_WALL_AREA).toBe(212));
  it("左右屋根面の勾配率を個別反映する", () => expect(calculateMeasurements({ walls, deductionMethod: "RATE", leftRoofPlanArea: 40, rightRoofPlanArea: 40, leftRoofPitch: 4, rightRoofPitch: 6 }).ROOF_AREA).toBeCloseTo(89.729, 3));
  it("粗利と売価0を安全に計算する", () => expect(calculateLine(10, null, 0, null, 100).profitRate).toBe(0));
  it("値引き後に税を計算する", () => expect(calculateEstimate([1000, 2000], 500, 0.1)).toEqual({ subtotal: 3000, discount: 500, taxable: 2500, tax: 250, total: 2750 }));
  it("材料缶数を切り上げる", () => expect(calculateMaterial(100, 0.15, 2, 0.1, 16).requiredCans).toBe(3));
});
