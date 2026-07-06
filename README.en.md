[日本語](README.md) | English

# genai-web-onpre

> **Disclaimer**: This repository is an **independent, unofficial** personal fork derived from the
> upstream [`digital-go-jp/genai-web`](https://github.com/digital-go-jp/genai-web) (itself based on AWS's
> [Generative AI Use Cases (GenU)](https://github.com/aws-samples/generative-ai-use-cases)), intended for
> **individual developers' development and experimentation** and provided AS IS without warranty. It is
> **not affiliated with or endorsed by** the Digital Agency, the upstream project, or AWS. Production use
> and handling of sensitive data are out of scope; use at your own risk. See [DISCLAIMER.md](DISCLAIMER.md).
> Upstream-derived names (e.g. "GENAI" / "源内") remain for compatibility and identification.

## Overview

This repository is a **web frontend** intended to run locally (on-premises), providing UI for generative AI chat, text generation, translation, transcription, image/diagram generation, team/AI-app management, and adding/running AI applications built as external microservices.

It is an independent, unofficial derivative of [`digital-go-jp/genai-web`](https://github.com/digital-go-jp/genai-web), the generative AI platform "GENAI (源内)" published as OSS by Japan's Digital Agency. It is not affiliated with or endorsed by the Digital Agency, the upstream project, or AWS. See [DISCLAIMER.md](DISCLAIMER.md) for the lineage and non-affiliation details.

## Documentation

> Note: The documentation is currently available only in Japanese.

### AI Applications

- [Types of AI Applications](./docs/AIアプリの種類.md)
- [AI Application Development Guide](./docs/AIアプリ開発ガイド.md)
- [AI Application API Specification](./docs/AIアプリAPI仕様.md)

### Development

- [Local Development Environment](./docs/ローカル開発環境.md)

### Reference

- [Team Management Permissions Table](./docs/チーム管理権限表.md)
- [Architecture](./docs/アーキテクチャ.md)

## Issue / Pull Request Policy

This repository accepts issue reports only for critical problems that affect the stable operation of services. We do not accept pull requests.

### Issues

#### What to report

- Bugs that cause data loss or corruption
- Failures that make the service unavailable
- Issues related to violations of laws or regulations (e.g., unintended exposure of personal information)
- Critical accessibility barriers (cases where specific users are completely unable to use the service, judged against criteria equivalent to JIS X 8341-3:2016 conformance level AA)

#### What not to report

Please refrain from reporting the following as issues.  
Issues that do not match the template may be closed.

- Requests or proposals for new features
- Minor display glitches or typos
- Performance improvement proposals
- Comments on coding style
- Questions or usage inquiries

### Response policy

- Issues will be addressed based on internal priority assessment
- We cannot guarantee that all issues will be addressed
- We do not provide individual responses to inquiries about issue status
- For issues deemed critical, we will provide status updates on the issue page when possible

## Vulnerability Reporting

Please report vulnerabilities via this repository's [security policy](.github/SECURITY.md) (GitHub Private Vulnerability Reporting).  
Do **not** report to the upstream project (`digital-go-jp/genai-web`), the Digital Agency, or AWS; this is an unofficial derivative unaffiliated with upstream.

## Nature of This Repository

This repository is an **independent, unofficial** derivative of the upstream [`digital-go-jp/genai-web`](https://github.com/digital-go-jp/genai-web); it is **not** created or published by the Digital Agency. It is published as OSS, but please refrain from the following:

- Actions that support or exclude specific ideologies, organizations, or companies
- Political, religious, or discriminatory statements
- Handling personal information or sensitive information in the repository
- Disclosing vulnerability details to third parties without following this repository's [security policy](.github/SECURITY.md)
- Modifying the source code for the purpose of attacking other systems

## License

- Software: Licensed under the [MIT License](LICENSE).
- Documentation: Licensed under the [Creative Commons Attribution 4.0 International License](LICENSE-CC-BY) (CC BY 4.0).
