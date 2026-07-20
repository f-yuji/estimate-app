# 外装改修工事 見積作成アプリ

既存xlsmの計算意図と帳票を基礎に、案件・数量・見積・原価・版・帳票を管理するPC向けWebアプリです。画面はスマートフォン幅にも追従します。

## 起動

Windows PowerShellで次を実行します。

```powershell
npm install
Copy-Item .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

`.env`の`DATABASE_URL`と`DIRECT_URL`にはSupabaseの接続文字列を設定します。実値を含む`.env`はGit管理対象外です。

ブラウザで `http://localhost:3000` を開きます。

## 初期設定

1. 「会社情報設定」で会社名・住所・正しい044系電話番号を登録します。
2. 「税率設定」で既定税率（初期10%）を確認します。
3. 「工事項目」で項目コード、標準単価、原価、数量参照元を登録します。
4. 必要なら「単価パターン」を作成します。

電話番号はExcel帳票に直書きせず、会社情報から一元反映する設計です。

## 基本操作

- 案件作成: 案件一覧の「新規案件」から必須項目を入力。
- 物件概要: 案件画面から開き、方角別寸法、控除方法、左右屋根面を入力。
- 見積作成: 案件画面で見積名を指定。明細追加、見出し、小計、自由入力に対応。
- 自動/手入力: 手入力欄が空なら自動値、値があれば手入力を採用します。`0`も有効です。
- 見積コピー: コピー時点の明細・数量参照元・単価・原価・税率を複製し、独立編集します。
- 版管理: 確定版は直接更新せず、複製して第2版以降を作成します。

## Excel・PDF出力

テンプレートは `templates/estimate-template-fixed.xlsm` です。出力処理はテンプレートを複製し、`config/excel-cell-mapping.json` に従って転記します。

```powershell
python scripts\export_estimate.py data\sample-estimate.json exports\見積.xlsm
python scripts\export_estimate.py data\sample-estimate.json exports\見積.xlsm --pdf
```

PDFはWindows版Excelがインストール済みの場合にExcel COMで生成します。xlsmはVBAを保持し、Excel起動時に再計算します。

## バックアップ

データはSupabaseのDatabase Backupsからバックアップします。ローカルでは`templates`と`exports`を日付付きフォルダへコピーしてください。接続パスワードはソース管理せず、安全なパスワード管理ツールへ保存します。

## テスト

```powershell
npm test
python scripts\analyze_excel.py
```

計算テストは0の手入力、控除率、個別開口、左右屋根勾配、粗利0除算、値引き・税、材料缶数を含みます。

## 既知の制限

- 初期優先帳票は見積書・内訳明細書2ページです。契約書、請求書、完工書、保証書のDBスナップショット構造はありますが、帳票マッピングと画面は後続対応です。
- Excelの図形・フォームコントロールを完全に再保存する安全性のため、最終PDFはExcel COM前提です。
- 会社電話番号は図形内文字として残る可能性があるため、初回運用前に実帳票の目視確認が必要です。
- ドラッグ並べ替え、案件/見積コピー、確定処理の画面操作はDB構造のみで、UI接続は未完了です。
