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
