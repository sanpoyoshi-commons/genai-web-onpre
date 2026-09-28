# UPSTREAM.md

このファイルは、本リポジトリの上流派生関係・上流追従手順・取込履歴を
記録する単一の真実です。NOTICE と併せて、本プロジェクトの派生関係を
明示する公式ドキュメントです。

## 1. 現在の上流スナップショット（Current upstream snapshot）

| 項目              | 値                                                  |
| ----------------- | --------------------------------------------------- |
| Upstream URL      | https://github.com/digital-go-jp/genai-web          |
| Upstream tag      | v1.0.3                                              |
| Upstream commit   | 58e529257fe751f2bb8731ef14586ee9d2d742ad            |
| 取込日（日本時間）| 2026-05-22                                          |
| 派生方式          | fork ワークフロー（remote 追跡、subtree ではない）  |

## 2. リモート構成
origin    本リポジトリ（ローカル運用用、当初は Private 運用、
将来的に Public 化を想定）
upstream  https://github.com/digital-go-jp/genai-web.git（上流、読み取り専用想定）

## 3. 上流追従手順（Update procedure）

新規上流リリース（v1.x.y）取込時の標準手順：

```bash
cd ~/work/genai-web-onpre

# 上流の最新タグを取得
git fetch upstream --tags

# 取込対象タグへ merge（例：v1.1.0）
git checkout main
git merge v1.1.0

# コンフリクト発生時は手動解決
# 派生実装と上流変更の衝突は内容を確認しつつマージする

# 新タグの SHA を記録
git rev-parse v1.1.0

# §5 の Update history を更新（必須運用ルール）

# Gitea へ反映
git push origin main
git push origin --tags
```

## 4. 上流追従時の必須チェック

| #     | チェック内容                                                  |
| ----- | ------------------------------------------------------------- |
| 4-1   | package.json／lockfile の依存変更を確認                       |
| 4-2   | 本 UPSTREAM.md の §1 と §5 を更新                             |
| 4-3   | 上流タグの GPG 署名 fingerprint 確認（導入検討中）           |
| 4-4   | §6 の意図的な乖離を上流版で上書きしていないか確認             |

## 5. 取込履歴（Update history）

| 取込日     | タグ    | Commit SHA                                | 備考                       |
| ---------- | ------- | ----------------------------------------- | -------------------------- |
| 2026-05-22 | v1.0.3  | 58e529257fe751f2bb8731ef14586ee9d2d742ad  | 初回取込（fork ワークフロー初期セットアップ） |

## 6. 意図的な乖離（上流版で上書きしないファイル）

本リポジトリは CPU 上のローカル小型 LLM（8B 級）で動かすことを前提とする。上流は
大規模モデル（Amazon Bedrock 経由）を前提としており、同じコードでも成立する条件が
違う。以下のファイルはその差を埋めるために調整してある。**上流追従時にそのまま
上流版で上書きすると、ダイアグラム生成が図種単位で動かなくなる。**

| パス | 調整の内容 |
| ---- | ---------- |
| `packages/web/src/prompts/diagrams/*.ts` | 各図種のプロンプト。制約リストに先頭キーワードを明示し、掲載している例を実際に描画できる記法へ直してある。小型モデルは番号付き制約に書かれた事柄しか安定して守らず、例を強く模倣する。 |
| `packages/web/src/features/generate-diagram/utils/extractDiagram.ts` | モデル出力から mermaid コードを取り出す処理。指示に反して混入する `<Description>` を除去する。 |
| `packages/web/src/features/generate-diagram/utils/correctDiagramCode.ts` | 描画前の記法補正。プロンプトだけでは守り切れない崩れを機械的に直す。 |

大規模モデルはプロンプトの散文からも意図を汲み、壊れた例を見ても正しい記法を出せる
ため、これらの調整が無くても動く。つまり**上流の実行条件では問題として現れない**。
上流にとっての不具合ではなく、本リポジトリの実行条件に合わせた調整である。

上流側の変更と衝突した場合は、内容を確認したうえで本リポジトリの調整を残す。調整の
意図は各ファイルのコメントに、調整が失われていないことは
`packages/web/src/prompts/diagrams/prompts.test.ts` と
`packages/web/src/features/generate-diagram/utils/*.test.ts` が守っている。
`npm run web:test` が通れば、乖離が保たれているか確認できる。

### 6-3. 添付の対応範囲とモデルの画像フラグ（ローカル経路）

上流は添付の中身を Amazon Bedrock（Converse の `document`／`image` ブロック）に読ませる。ローカルの
Ollama にはその受け口が無く、api が自分で文字を取り出す（`genai-ai-api-onpre` の `src/lib/attachments`）。
取り出せる形式と、画像を渡してよいモデルが上流と違うため、以下を調整してある。

| パス | 調整の内容 |
| ---- | ---------- |
| `packages/web/src/features/chat/constants.ts`（`FILE_LIMIT.accept`） | `doc` から `.doc`・`.xls`・`.gif` を、`image` から `.webp` を**外した**（理由は下の3点）。上流の一覧は doc が `.csv .doc .docx .html .md .pdf .txt .xls .xlsx .gif`、image が `.jpg .jpeg .png .webp` |
| `packages/web/src/features/chat/constants.ts`（画像の上限） | `maxImageFileCount` 20 → **3**、`maxImageFileSizeMB` 3.75 → **2**。api の `ATTACHMENT_MAX_IMAGES`（既定 3）に合わせ、送信の本文（base64）が `API_JSON_BODY_LIMIT`（48mb）に収まるようにするため。上流の 20 件 × 3.75MB は base64 で約 100MB になり、この構成では 413 になる |
| `packages/common/src/application/model.ts`（ローカルモデルの `flags`） | Gemma 4 系の4つ（`e4b`・`e2b`・`26b`・`31b`）だけ `image: true`（`TEXT_DOC_IMAGE`）。ほかのローカルモデル（Mistral 7B・Llama 3.2 3B・ELYZA・Swallow・Mixtral・Llama 3.3 70B）は `TEXT_DOC` のまま。**入力の画像対応を公表しているモデルだけ**を true にする方針 |

外した3種の理由：

| 拡張子 | 理由 |
| ---- | ---------- |
| `.doc`・`.xls` | 旧 OLE バイナリ。現役の純 JS 実装が無く、api が中身を読めない |
| `.gif` | Ollama v0.31.2 の OpenAI 互換は、データ URI の型を `jpeg`・`jpg`・`png`・`webp` だけ受け付け、gif は `invalid image input` で落とす（`openai/openai.go` の `decodeImageURL`） |
| `.webp` | Ollama v0.31.2 が同梱する `golang.org/x/image` v0.22.0 に webp の既知の脆弱性が2件ある（GO-2026-5061・CVE-2026-46603＝panic とメモリ枯渇の DoS。上げ先なし）。api は**中身の先頭バイトで PNG と JPEG だけを通す**ので、`.webp` を選べても渡らない |

- 上流はこれらのモデルを metadata に持たない（Bedrock 前提）ので、**上流の変更と衝突しにくい**。衝突した
  場合は本リポジトリ側を残す。
- 運用者が別の vision 対応モデルを pull したときは `model.ts` に追記する。未登録でも
  `useFileUploadable` は防御的にフォールバックし、画面は落ちない。
- 乖離が失われていないことは `packages/web/tests/features/chat/fileLimit.test.ts` と
  `packages/web/tests/application/modelMetadata.test.ts` が守っている。

## 7. 運用注記

### 7-1. タグだけ進む現象の扱い

上流リポジトリで「タグだけ付与され、公開 Release（GitHub Releases ページに
リリースノート付きで公開されたもの）として正式リリースされない」現象が
発生した場合、本プロジェクトは **追従しません**。

公開 Release が出るまで現在のタグに据え置き、定期棚卸し時に状況を
把握するに留めます。

### 7-2. クールダウン期間

新規 Release 公開後、本プロジェクトの依存クールダウン規約に従い、
最低 7 日経過後に取込を検討します。CVSS 9.0 以上かつ未認証リモート
攻撃可能な脆弱性が発見された場合は、本規約のクールダウン特例条項
（4 条件すべて成立）の判断に従い、上記期間内であっても採用判断
される場合があります。

詳細運用は本プロジェクト内部の依存クールダウン環境変数設定運用に
従います。

## 8. 関連ファイル

- LICENSE                                 ソフトウェアライセンス（MIT）
- LICENSE-CC-BY                           ドキュメントライセンス（CC BY 4.0）
- NOTICE                                  上流派生関係・商標注記・免責事項
- LICENSES-THIRD-PARTY/                   第三者依存ライセンス本文集

## 9. 一次出典

- 上流リポジトリ：https://github.com/digital-go-jp/genai-web
- 上流 v1.0.3 タグ：https://github.com/digital-go-jp/genai-web/releases/tag/v1.0.3
- GitHub Releases ページ：https://github.com/digital-go-jp/genai-web/releases
