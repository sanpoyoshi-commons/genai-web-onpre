# Security Policy / セキュリティポリシー

## サポート対象バージョン / Supported Versions

最新の `main`（および直近のタグ付きリリース）を対象にセキュリティ修正を提供します。
Security fixes are provided for the latest `main` branch and the most recent tagged release.

## 脆弱性の報告 / Reporting a Vulnerability

**公開 Issue では報告しないでください。** 脆弱性は非公開で受け付けます。

- 本リポジトリの **Security → Report a vulnerability**（GitHub Private Vulnerability
  Reporting）からご報告ください。メールでの個別窓口は設けていません。
- **上流（`digital-go-jp/genai-web`）やデジタル庁・AWS へは報告しないでください。** 本リポジトリは
  非公式の派生であり、上流とは無関係です（[DISCLAIMER.md](../DISCLAIMER.md) 参照）。

Please report privately via this repository's **Security → Report a vulnerability** (GitHub Private
Vulnerability Reporting). We do not provide an email contact. Do **not** report to the upstream
project (`digital-go-jp/genai-web`), the Digital Agency, or AWS; this is an unofficial derivative
unaffiliated with upstream.

報告には以下を含めてください / Please include:

- 影響を受けるコンポーネント・バージョン
- 再現手順または PoC
- 想定される影響範囲

## セキュリティ対策の状況 / Security Measures

本リポジトリ（フロントエンド層）には以下を適用しています。

- **コミット時の自動検査**：Gitleaks（`pre-commit`、秘密情報の平文混入）。
- **プッシュ時の自動検査**（`pre-push`。uvx / docker 導入時に実行され、未導入の環境では
  自動でスキップされます）：
  - **Semgrep**（SAST：TypeScript / JavaScript）
  - **OSV-Scanner**（依存の既知脆弱性。設定は `osv-scanner.toml`）
- **設計・LLM 観点のレビュー**：OWASP Top 10:2025 および OWASP Top 10 for LLM
  Applications 2025 の観点でレビューします（シグネチャ系スキャナが苦手な設計・ロジック面を
  補完）。フロントエンドでは特に **LLM 出力の描画（LLM05 / XSS）**・**認証 UI（A01/A07）** が
  主な対象です。
- **ハードニング**：Keycloak による OIDC（Authorization Code + PKCE S256）認証、API への
  同一オリジン fetch、LLM 出力レンダリングのサニタイズ。

> 本リポジトリは個人開発者の開発・実験用途を想定した非公式の派生です。本番業務での利用は
> 想定しておらず、動的スキャン（DAST）やペネトレーションテストは、導入する場合は各自の
> 責任で実施してください（[DISCLAIMER.md](../DISCLAIMER.md)）。
