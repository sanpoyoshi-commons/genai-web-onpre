import { describe, expect, it } from 'vitest';
import { extractDiagramCode, extractDiagramSentence } from './extractDiagram';

const FENCED = `<Description>
ユーザー登録の流れです。
</Description>
\`\`\`mermaid
flowchart LR
    A --> B
\`\`\``;

// ローカル CPU モデルがフェンスも <Description> も付けずに返した生コード（実機 ELYZA-8B で観測）。
const BARE = `flowchart LR
    id1@{ shape: manual-file, label: "ユーザー登録" }
    id2@{ shape: docs, label: "新規アカウント作成" }
    id1 --> id2`;

// 実機 ELYZA-8B が返した生出力（フェンス無し・末尾にモデルが付けた `Note:` 散文が続く）。
// 内部に空行を挟み、末尾に mermaid でない説明ブロックが付く実際のパターン。
const ELYZA_WITH_TRAILING_NOTE = `flowchart LR
    id1@{ shape: manual-file, label: "ユーザー情報入力" }
    id2@{ shape: manual-input, label: "メールアドレス入力" }
    id3@{ shape: docs, label: "利用規約の確認" }
    id4@{ shape: manual-file, label: "パスワード設定" }
    id5@{ shape: docs, label: "登録完了" }

    id1 --> id2
    id2 --> id3
    id3 --> id4
    id4 --> id5

    classDef user fill:#f9f,stroke:#333,stroke-width:4px;
    classDef success fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff;

Note:
- id1はユーザー情報入力、id2はメールアドレス入力、id3は利用規約の確認、id4はパスワード設定、id5は登録完了を表します。
- クラス定義で、userクラスとsuccessクラスを定義しています。ユーザー情報入力や成功した場合に使用されます。`;

// 上記から末尾散文を落とした期待コード（内部空行・classDef は保持）。
const ELYZA_CODE = `flowchart LR
    id1@{ shape: manual-file, label: "ユーザー情報入力" }
    id2@{ shape: manual-input, label: "メールアドレス入力" }
    id3@{ shape: docs, label: "利用規約の確認" }
    id4@{ shape: manual-file, label: "パスワード設定" }
    id5@{ shape: docs, label: "登録完了" }

    id1 --> id2
    id2 --> id3
    id3 --> id4
    id4 --> id5

    classDef user fill:#f9f,stroke:#333,stroke-width:4px;
    classDef success fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff;`;

// 実機 ELYZA-8B が返した別パターン（開きフェンス無し・末尾に裸の ``` が1つぶら下がる）。
const DANGLING_FENCE = `flowchart LR
    A --> B

classDef default fill:#f9f,stroke:#333,stroke-width:4px;
\`\`\``;

describe('extractDiagramCode', () => {
  it('```mermaid フェンスがあれば中身を抽出する', () => {
    expect(extractDiagramCode(FENCED)).toBe('flowchart LR\n    A --> B');
  });

  it('末尾にぶら下がった裸の ``` を含まないコードを返す', () => {
    expect(extractDiagramCode(DANGLING_FENCE)).toBe(
      'flowchart LR\n    A --> B\n\nclassDef default fill:#f9f,stroke:#333,stroke-width:4px;',
    );
  });

  it('フェンス省略でも先頭が mermaid キーワードなら本文を採用する', () => {
    expect(extractDiagramCode(BARE)).toBe(BARE);
  });

  it('<Description> を除いた残りが生コードなら採用する', () => {
    const content = `<Description>説明</Description>\nsequenceDiagram\n    A->>B: hi`;
    expect(extractDiagramCode(content)).toBe('sequenceDiagram\n    A->>B: hi');
  });

  it('言語タグ無しの ``` フェンスでも中身を取り出す', () => {
    const content = '```\ngraph TD\n    A-->B\n```';
    expect(extractDiagramCode(content)).toBe('graph TD\n    A-->B');
  });

  it('mermaid でない素の文章は空を返す', () => {
    expect(extractDiagramCode('これはただの文章です。')).toBe('');
  });

  it('フェンス無し生コードの末尾に付く説明（Note:）を切り落とし、内部空行と classDef は保持する', () => {
    expect(extractDiagramCode(ELYZA_WITH_TRAILING_NOTE)).toBe(ELYZA_CODE);
  });

  it('非インデントの subgraph/end を含む生コードを切り詰めない', () => {
    const content = `flowchart TD
subgraph グループA
  x --> y
end
z --> x

これは補足の説明文です。`;
    expect(extractDiagramCode(content)).toBe(`flowchart TD
subgraph グループA
  x --> y
end
z --> x`);
  });

  it('sequenceDiagram の Note over 構文は本文として保持する', () => {
    const content = `sequenceDiagram
    A->>B: hi
    Note over A,B: やりとり`;
    expect(extractDiagramCode(content)).toBe(content);
  });
});

describe('extractDiagramSentence', () => {
  it('<Description> があればその中身を返す', () => {
    expect(extractDiagramSentence(FENCED)).toBe('ユーザー登録の流れです。');
  });

  it('本文全体が生コードのときは説明を空にして二重表示しない', () => {
    expect(extractDiagramSentence(BARE)).toBe('');
  });

  it('プロ文＋フェンス無し生コードでは文章のみ残す', () => {
    const content = `これはユーザー登録のフローです。\nflowchart LR\n    A --> B`;
    expect(extractDiagramSentence(content)).toBe('これはユーザー登録のフローです。');
  });

  it('図コードが無い素の文章はそのまま返す', () => {
    expect(extractDiagramSentence('これはただの文章です。')).toBe('これはただの文章です。');
  });

  it('末尾にぶら下がった ``` は説明欄に漏らさない（空を返す）', () => {
    expect(extractDiagramSentence(DANGLING_FENCE)).toBe('');
  });

  it('末尾の Note: 説明ブロックを説明欄に回す（図コードは二重表示しない）', () => {
    expect(extractDiagramSentence(ELYZA_WITH_TRAILING_NOTE)).toBe(`Note:
- id1はユーザー情報入力、id2はメールアドレス入力、id3は利用規約の確認、id4はパスワード設定、id5は登録完了を表します。
- クラス定義で、userクラスとsuccessクラスを定義しています。ユーザー情報入力や成功した場合に使用されます。`);
  });
});
