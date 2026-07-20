# アプリ仕様とExcel仕様の対応

| アプリ | Excel | 実装 |
|---|---|---|
| 案件基本情報 | 物件概要、見積書 | `Project`、案件画面 |
| 統合物件概要 | 物件概要 + 物件概要(2) | `ProjectMeasurement.valuesJson`、分類タブ |
| 方角別外壁 | 物件概要の東西南北 | `calculateMeasurements` |
| 控除率/個別開口 | 物件概要の控除率 + 拡張機能 | `ProjectOpening`、控除方式切替 |
| 左右屋根勾配 | 物件概要 L34/O34周辺 | 左右投影面積×各勾配率（簡略化せず分離） |
| 工事項目 | 内訳明細書の名称 | `WorkItemMaster.itemCode`で識別 |
| 数量参照 | 物件概要K/L・M/N検索 | `QuantitySourceMaster.code`で明示参照 |
| 見積明細 | 内訳明細書2ページ | `EstimateItem`、24行×2ページ展開 |
| 手入力優先 | Excel入力/式 | nullのみ自動値へフォールバック。0は採用 |
| 単価履歴 | 帳票へ入力した値 | 見積明細へスナップショット保存 |
| 見積コピー・版 | Excelファイル複製相当 | `copiedFromId`、`EstimateVersion` |
| 契約確定 | 請負契約書等 | `ContractSnapshot` |
| Excel出力 | 既存xlsm | `scripts/export_estimate.py`、`keep_vba=True` |
| PDF出力 | Excel印刷設定 | Excel COM `ExportAsFixedFormat` |
| 操作履歴 | なし | `OperationLog`、`ExportLog` |

後続帳票は同じマッピング方式で追加でき、セル番地を業務ロジックへ散在させません。
