日本語 | [English](README.en.md)

# genai-web-onpre

> **免責 / Disclaimer**：本リポジトリは上流（[`digital-go-jp/genai-web`](https://github.com/digital-go-jp/genai-web)）から派生した
> **非公式・独立**の個人プロジェクトで、**個人開発者の開発・実験用途**を想定した無保証の成果物です。
> デジタル庁・上流プロジェクト・AWS とは**無関係**であり、提携・推奨・公認を受けていません。
> 本番業務での利用・機微情報の取り扱いは対象外で、利用は自己責任です。詳細は
> [DISCLAIMER.md](DISCLAIMER.md) を参照してください。上流由来の名称（「源内」等）は互換・識別目的で残存しています。

## 概要

本リポジトリは、ローカル環境（オンプレ）で動かす **Web フロントエンド**です（チャット・文章生成・翻訳・文字起こし・画像/図表生成、チーム/AI アプリ管理、外部マイクロサービスとして構築した AI アプリの追加・実行などの UI を提供）。

デジタル庁が OSS として公開する生成 AI 基盤「源内（GenAI）」の [`digital-go-jp/genai-web`](https://github.com/digital-go-jp/genai-web) を出自とする、独立・非公式の派生実装です（出自の系譜・非提携の詳細は [DISCLAIMER.md](DISCLAIMER.md)）。

## ローカルで動かす（オンプレ・個人開発者向け）

本リポジトリ（Web フロントエンド）は**単体では起動しません**。ローカルで動かすには、デプロイ層 **`genai-deploy-onpre`** を使います（ビルド成果物が nginx から配信されます）。

- セットアップ（Docker / WSL2 / git / clone 等の前提から起動まで）は **`genai-deploy-onpre`** の `README.md` および `docs/prerequisites.md` を参照してください。
- アカウント登録・管理者設定・チーム登録などの運用手順も、オンプレ構成では `genai-deploy-onpre`（Keycloak 等）に従います。

## ドキュメント

### AI アプリ

- [**AI アプリ ローカル開発ガイド（自作 AI アプリの作り方）**](./docs/AIアプリローカル開発ガイド.md) ← ローカル版で自作する方はこちら
- [AI アプリの種類](./docs/AIアプリの種類.md)
- [AI アプリ開発ガイド](./docs/AIアプリ開発ガイド.md)
- [AI アプリ API 仕様](./docs/AIアプリAPI仕様.md)

### 開発

- [ローカル開発環境](./docs/ローカル開発環境.md)
- コミット時に gitleaks、push 時に Semgrep／OSV-Scanner が走ります（`pre-commit install` で有効化。詳細は [セキュリティポリシー](.github/SECURITY.md)）

### リファレンス

- [チーム管理権限表](./docs/チーム管理権限表.md)
- [アーキテクチャ](./docs/アーキテクチャ.md)

## Issue / Pull Request の対応方針

本リポジトリでは、サービスの安定運用に影響する致命的な問題に限り、Issue での報告を受け付けています。Pull Request は受け付けておりません。

### Issues

#### 報告対象となるもの

- データの損失・破損 を引き起こす不具合
- サービスが利用不能になる 障害
- 法令・規則への違反 に関わる問題（例：個人情報の意図しない露出）
- アクセシビリティ上の重大な障壁（JIS X 8341-3:2016 適合レベル AA 相当の基準に照らし、特定のユーザーがサービスを全く利用できない場合）

#### 報告対象外のもの

以下については、Issue での報告はご遠慮ください。  
テンプレートに合致しない Issue はクローズさせていただく場合があります。

- 機能追加の要望・提案
- 軽微な表示崩れ・誤字脱字
- パフォーマンスの改善提案
- コーディングスタイルに関する指摘
- 質問・使い方の相談

### 対応について

- Issue への対応は、内部の優先度判断に基づき行います
- すべての Issue に対応できるとは限りません
- 対応状況についてのお問い合わせへの個別回答は行っておりません
- 致命的と判断された問題については、可能な範囲で対応状況を Issue 上でお知らせします

## 脆弱性の報告

脆弱性は本リポジトリの [セキュリティポリシー](.github/SECURITY.md)（GitHub Private Vulnerability Reporting）よりご報告ください。  
**上流（`digital-go-jp/genai-web`）やデジタル庁・AWS へは報告しないでください**（本リポジトリは非公式の派生であり、上流とは無関係です）。

## このソースコード・ドキュメント等の性格

本リポジトリは、上流（[`digital-go-jp/genai-web`](https://github.com/digital-go-jp/genai-web)）から派生した**非公式・独立**のプロジェクトです（デジタル庁が作成・公開するものではありません）。OSS として公開していますが、以下のことはご遠慮ください。

- 特定の思想・団体・企業を支持または排除するような行為
- 政治的・宗教的・差別的な内容の発言
- 個人情報や機微情報をリポジトリ上で扱う行為
- セキュリティ脆弱性発見時に、本リポジトリの[セキュリティポリシー](.github/SECURITY.md)に従わず、脆弱性内容を第三者に開示する行為
- 本ソースコードを他システムへの攻撃を目的として改変する行為

## License

- Software: Licensed under the [MIT License](LICENSE).
- Documentation: Licensed under the [Creative Commons Attribution 4.0 International License](LICENSE-CC-BY) (CC BY 4.0).