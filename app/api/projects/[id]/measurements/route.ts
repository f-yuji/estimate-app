import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateProperty, directions, type PropertyOpening, type PropertyValues } from "@/lib/property-summary";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) return NextResponse.json({ error: "案件が見つかりません。" }, { status: 404 });
  const body = await request.json() as { values?: PropertyValues; openings?: PropertyOpening[] };
  const values = body.values ?? {};
  const openings = body.openings ?? [];
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "number" && (!Number.isFinite(value) || value < 0)) return NextResponse.json({ error: `${key}には0以上の数値を入力してください。` }, { status: 400 });
  }
  for (const opening of openings) {
    if (!opening.name.trim() || !directions.includes(opening.direction) || [opening.width, opening.height, opening.quantity].some(v => !Number.isFinite(v) || v < 0)) return NextResponse.json({ error: "開口部の名称・方角・寸法・数量を確認してください。" }, { status: 400 });
  }
  const calculated = calculateProperty(values, openings);
  await prisma.$transaction(async tx => {
    await tx.projectMeasurement.upsert({ where: { projectId: id }, create: { projectId: id, valuesJson: JSON.stringify(values), calculatedJson: JSON.stringify(calculated), deductionMethod: String(values.deductionMethod ?? "RATE") }, update: { valuesJson: JSON.stringify(values), calculatedJson: JSON.stringify(calculated), deductionMethod: String(values.deductionMethod ?? "RATE") } });
    await tx.projectOpening.deleteMany({ where: { projectId: id } });
    if (openings.length) await tx.projectOpening.createMany({ data: openings.map(o => ({ projectId: id, name: o.name, direction: o.direction, width: o.width, height: o.height, quantity: Math.floor(o.quantity), area: o.width * o.height * o.quantity, notes: o.notes || null })) });
    await tx.operationLog.create({ data: { targetType: "project", targetId: id, action: "物件概要更新", afterJson: JSON.stringify({ values, calculated }) } });
  });
  return NextResponse.json({ ok: true, calculated });
}
