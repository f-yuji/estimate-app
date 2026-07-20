import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q=(await searchParams).q?.trim()??"";
  const projects=await prisma.project.findMany({where:q?{OR:[{projectName:{contains:q}},{customerName:{contains:q}},{siteAddress:{contains:q}},{constructionName:{contains:q}}]}:undefined,include:{estimates:{orderBy:{updatedAt:"desc"},take:1}},orderBy:{updatedAt:"desc"}});
  return <><div className="topline"><div><h1>案件一覧</h1><div className="hint">過去案件を検索・複製して、見積作成を短縮します</div></div><Link className="button" href="/projects/new">＋ 新規案件</Link></div>
    <form className="card" style={{marginBottom:16,display:"flex",gap:10}}><input className="cell-input" name="q" defaultValue={q} placeholder="顧客名・案件名・住所・工事名で検索"/><button className="button">検索</button></form>
    <div className="table-wrap">{projects.length?<table><thead><tr><th>案件名</th><th>顧客名</th><th>現場住所</th><th>種別</th><th>最新見積金額</th><th>ステータス</th><th>更新日</th></tr></thead><tbody>{projects.map(p=>{const e=p.estimates[0];return <tr key={p.id}><td><Link href={`/projects/${p.id}`}><strong>{p.projectName}</strong></Link></td><td>{p.customerName}</td><td>{p.siteAddress}</td><td>{p.projectType}</td><td className="money">{e?`${Number(e.totalAmount).toLocaleString()}円`:"—"}</td><td><span className="badge">{e?.status??"未作成"}</span></td><td>{p.updatedAt.toLocaleDateString("ja-JP")}</td></tr>})}</tbody></table>:<div className="empty">案件がありません。「新規案件」から最初の案件を作成してください。</div>}</div></>;
}
