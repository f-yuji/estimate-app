import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MeasurementEditor from "./measurement-editor";

export default async function Measurements({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await prisma.project.findUnique({where:{id},include:{measurement:true,openings:true}});if(!p)notFound();let values={};try{values=JSON.parse(p.measurement?.valuesJson??"{}")}catch{}return <MeasurementEditor projectId={id} projectName={p.projectName} initialValues={values} initialOpenings={p.openings.map(o=>({id:o.id,name:o.name,direction:o.direction as "east"|"west"|"south"|"north",width:Number(o.width),height:Number(o.height),quantity:o.quantity,notes:o.notes??""}))}/>}
