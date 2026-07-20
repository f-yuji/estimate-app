"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function createProject(form: FormData) {
  const projectName = value(form, "projectName"); const customerName = value(form, "customerName"); const siteAddress = value(form, "siteAddress");
  if (!projectName || !customerName || !siteAddress) throw new Error("案件名、顧客名、現場住所は必須です。");
  const project = await prisma.project.create({ data: { projectName, customerName, siteAddress, constructionName:value(form,"constructionName")||null, customerAddress:value(form,"customerAddress")||null, phone:value(form,"phone")||null, personInCharge:value(form,"personInCharge")||null, projectType:value(form,"projectType")||"戸建", notes:value(form,"notes")||null, measurement:{create:{}} } });
  await prisma.operationLog.create({ data:{ targetType:"project", targetId:project.id, action:"案件作成", afterJson:JSON.stringify({projectName,customerName,siteAddress}) } });
  redirect(`/projects/${project.id}`);
}

export async function createEstimate(projectId: string, form: FormData) {
  const count = await prisma.estimate.count({ where:{projectId} });
  const estimate = await prisma.estimate.create({ data:{ projectId, estimateName:value(form,"estimateName")||"新規見積", estimateNumber:value(form,"estimateNumber")||`EST-${Date.now()}`, version:count+1 } });
  await prisma.operationLog.create({data:{targetType:"estimate",targetId:estimate.id,action:"見積作成"}}); redirect(`/estimates/${estimate.id}`);
}

export async function saveCompany(form: FormData) {
  await prisma.companySetting.upsert({where:{id:1},create:{id:1,companyName:value(form,"companyName"),phone:value(form,"phone"),address:value(form,"address")},update:{companyName:value(form,"companyName"),phone:value(form,"phone"),address:value(form,"address")}}); revalidatePath("/settings/company");
}
