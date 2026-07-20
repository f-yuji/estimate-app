import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MeasurementEditor from "./measurement-editor";

export default async function Measurements({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await prisma.project.findUnique({where:{id}});if(!p)notFound();return <MeasurementEditor projectId={id} projectName={p.projectName}/>}
