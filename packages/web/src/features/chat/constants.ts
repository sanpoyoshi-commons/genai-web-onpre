import { FileLimit } from 'genai-web';

export const FILE_LIMIT: FileLimit = {
  accept: {
    // 上流との意図的な乖離（UPSTREAM.md §6-3）。選べてしまうと、添付できたのに
    // 「読み取れません」と返るだけになるので、api が扱えないものは外してある。
    // - `.doc`・`.xls`（旧 OLE バイナリ）：現役の純 JS 実装が無く、api が中身を読めない。
    // - `.gif`：Ollama の OpenAI 互換が受け付けない（data URI は jpeg/jpg/png/webp のみ）。
    // - `.webp`：Ollama 同梱の `golang.org/x/image` に既知の DoS があり、api が渡さない。
    doc: ['.csv', '.docx', '.html', '.md', '.pdf', '.txt', '.xlsx'],
    image: ['.jpg', '.jpeg', '.png'],
    video: ['.mkv', '.mov', '.mp4', '.webm'],
  },
  maxFileCount: 5,
  maxFileSizeMB: 4.5,
  // 画像は枚数も大きさも上流より絞る。`api` の `ATTACHMENT_MAX_IMAGES`（既定 3）に合わせ、
  // 送信の本文（base64）が `API_JSON_BODY_LIMIT`（48mb）に収まるようにするため
  // （3 件 × 2MB ＝ base64 で約 8MB。会話が続いて過去の添付が再送されても余裕がある）。
  maxImageFileCount: 3,
  maxImageFileSizeMB: 2,
  maxVideoFileCount: 1,
  maxVideoFileSizeMB: 1000, // 1 GB for S3 input
} as const;
