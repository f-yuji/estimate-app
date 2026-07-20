import "./globals.css";
import Link from "next/link";

export const metadata = { title: "外装見積", description: "外装改修工事向け見積作成" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body><div className="shell"><aside className="side"><div className="brand">外装見積</div><nav className="nav">
    <Link href="/">案件一覧</Link><Link href="/settings/work-items">工事項目</Link><Link href="/settings/prices">単価パターン</Link><Link href="/settings/company">会社情報</Link><Link href="/settings/tax">税率設定</Link>
  </nav></aside><main className="main">{children}</main></div></body></html>;
}
