import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EstimateEditor from "./estimate-editor";

export default async function EstimatePage({params}:{params:Promise<{id:string}>}){const {id}=await params;const e=await prisma.estimate.findUnique({where:{id},include:{project:true,items:{orderBy:{displayOrder:"asc"}}}});if(!e)notFound();return <EstimateEditor estimate={{id:e.id,name:e.estimateName,number:e.estimateNumber,status:e.status,projectId:e.projectId,projectName:e.project.projectName,discount:Number(e.discount),taxRate:Number(e.taxRate)}}/>}
