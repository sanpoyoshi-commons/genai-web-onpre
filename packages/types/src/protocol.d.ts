import { RetrieveCommandOutput as RetrieveCommandOutputKnowledgeBase } from '@aws-sdk/client-bedrock-agent-runtime';
import { StopReason } from '@aws-sdk/client-bedrock-runtime';
import { Chat } from './chat';
import { GenerateImageParams } from './image';
import { Model, RecordedMessage, ToBeRecordedMessage, UnrecordedMessage } from './message';
import { SystemContext } from './systemContext';

export type StreamingChunk = {
  text: string;
  trace?: string;
  stopReason?: StopReason | 'error';
  sessionId?: string;
};

export type Pagination<T> = {
  data: T[];
  lastEvaluatedKey?: string;
};

export type CreateChatResponse = {
  chat: Chat;
};

export type CreateMessagesRequest = {
  messages: ToBeRecordedMessage[];
};

export type CreateMessagesResponse = {
  messages: RecordedMessage[];
};

export type ListChatsResponse = Pagination<Chat>;

export type FindChatByIdResponse = {
  chat: Chat;
};

export type ListMessagesResponse = {
  messages: RecordedMessage[];
};

export type CreateSystemContextRequest = {
  systemContext: SystemContext;
};

export type UpdateSystemContextTitleRequest = {
  title: string;
};

export type UpdateSystemContextTitleResponse = {
  systemContext: SystemContext;
};

export type UpdateTitleRequest = {
  title: string;
};

export type UpdateTitleResponse = {
  chat: Chat;
};

export type PredictRequest = {
  model?: Model;
  messages: UnrecordedMessage[];
  id: string;
  /** サンプリング温度（0〜2・任意）。構造化出力（ダイアグラム生成等）は低温で書式遵守が安定する。 */
  temperature?: number;
};

export type PredictResponse = string;

export type OptimizePromptRequest = {
  prompt: string;
  targetModelId: string;
};

export type PredictTitleRequest = {
  model: Model;
  chat: Chat;
  prompt: string;
  id: string;
};

export type PredictTitleResponse = string;

export type RetrieveKnowledgeBaseRequest = {
  query: string;
};

export type RetrieveKnowledgeBaseResponse = RetrieveCommandOutputKnowledgeBase;

export type GetFileDownloadSignedUrlRequest = {
  bucketName: string;
  filePrefix: string;
  region?: string;
  contentType?: string;
};

export type GetFileDownloadSignedUrlResponse = string;

export type GetArtifactFileRequest = {
  s3Url: string;
};

export type GetArtifactFileResponse = {
  data: string;
};

export type GenerateImageRequest = {
  model?: Model;
  params: GenerateImageParams;
};
export type GenerateImageResponse = string;

export type DeleteFileRequest = {
  fileName: string;
};
export type DeleteFileResponse = null;

export type StartTranscriptionRequest = {
  audioKey: string;
  speakerLabel: boolean;
  maxSpeakers: number;
};

export type StartTranscriptionResponse = {
  jobName: string;
};

export type Transcript = {
  speakerLabel?: string;
  transcript: string;
};

export type GetTranscriptionResponse = {
  status: string;
  languageCode: string;
  transcripts?: Transcript[];
};

export type UploadAudioRequest = {
  file: File;
};

export type GetFileUploadSignedUrlRequest = {
  filename?: string;
  mediaFormat: string;
};

export type GetFileUploadSignedUrlResponse = string;

export type UploadFileRequest = {
  file: File;
};

// Code Interpreter（源内独自 IF、POST /code-interpreter/responses）。
// api 側（genai-ai-api-onpre）の zod schema / レスポンスと 1:1 で整合させる。
// 入力ファイルは base64。CSV/Excel 限定（拡張子検証は api 側が担う）。`key` は源内標準 IF 互換のため
// だけに存在し api では破棄されるが、IF 互換のため送る（既定 'file_input'）。
export type CodeInterpreterInputFile = {
  filename: string;
  // base64（`data:` プレフィックスなしのペイロード部のみ）。
  content: string;
};

export type CodeInterpreterRequest = {
  inputs: {
    input_text: string;
    files?: {
      key?: string;
      files: CodeInterpreterInputFile[];
    }[];
  };
};

// 生成物（実行で出力された PNG）。content は base64。api は .png のみ artifacts に載せる。
export type CodeInterpreterArtifact = {
  display_name: string;
  content: string;
};

export type CodeInterpreterResponse = {
  outputs: string;
  artifacts: CodeInterpreterArtifact[];
};

// 法令 RAG（法令名ベース忠実ポート、POST /law-rag/query）。
// api 側（genai-ai-api-onpre の lawRag/schemas.ts・query.ts）と 1:1 で整合させる。
// 一般文書 RAG（/rag/query）とは経路が別（法令名推定→法令特定→条文選別→レポート生成→出典結合）で、
// 出力は出典を本文に結合した Markdown レポート（outputs）。usage は LlmClient seam 未公開のため空配列。
export type LawRagQueryRequest = {
  inputs: {
    question: string;
    // 参照時点（YYYY-MM-DD・任意）。未指定＝今日時点で施行されている法令（現行）で回答する。
    // 指定時は未施行条文も候補に含め、その時点で施行されている版を構造的に解決して引用する。
    as_of_date?: string;
  };
  model?: {
    modelId?: string;
  };
};

// 引用条文 1 件分の版メタ（施行日バッジ用）。レポート本文の「## 出典」と同じ内容を構造化したもの。
export type LawRagReference = {
  // 元の引用番号（レポート本文の [n] に対応・非連続でありうる）。
  n: number;
  // 出典表示名（法令名＋条見出し）。
  title: string;
  // e-Gov 法令検索 URL。
  url: string;
  // 採用した版の施行日 YYYY-MM-DD（不明は null）。年が 2100 以降は施行日未定のプレースホルダ。
  enforceDate: string | null;
  // 未施行フラグ（今日時点でまだ効力を持たない版）。
  isFuture: boolean;
  // 改正予定＝この版より後の次版施行日（無ければ null）。
  nextEnforceDate: string | null;
};

// データ基準日（システムの知識時点＝法令データの取得日と配布タグ）。
export type LawRagDataAsOf = {
  egovFetchDate: string;
  releaseTag: string;
};

// outputs / usageMetadata は不変で、以下は追加フィールド（api が返さない場合は載らない＝後方互換）。
export type LawRagQueryResponse = {
  outputs: string;
  usageMetadata: unknown[];
  // 版解決に使った参照時点（as_of_date 指定時のみ）。
  asOfDate?: string;
  dataAsOf?: LawRagDataAsOf;
  references?: LawRagReference[];
};

// 汎用 RAG のナレッジ集（POST/GET /rag/collections ほか、-onpre 新規）。
// api 側（genai-ai-api-onpre の routes/rag/）と 1:1 で整合させる。
// 保存は 3 層（原本／抽出テキスト／チャンクと埋め込み）。原本を持たない文書は作り直せない。
export type RagCollection = {
  collectionId: string;
  name: string;
  description: string | null;
  // 外部のエージェントへ検索を開くかどうか。切り替えの口ができるまで常に false。
  mcpEnabled: boolean;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ListRagCollectionsResponse = {
  collections: RagCollection[];
};

export type CreateRagCollectionRequest = {
  name: string;
  description?: string;
};

export type UpdateRagCollectionRequest = {
  name?: string;
  description?: string;
};

// 取り込みの結果。ready＝チャンクまで作れた／failed＝本文を取り出せなかった（原本は残る）。
export type RagDocumentStatus = 'ready' | 'failed';

export type RagKnowledgeDocument = {
  documentId: string;
  collectionId: string;
  title: string;
  mime: string | null;
  originalFilename: string | null;
  byteSize: number | null;
  charCount: number | null;
  chunkCount: number;
  extractor: string | null;
  extractorVersion: string | null;
  status: RagDocumentStatus;
  error: string | null;
  // 原本を持つか。false の文書は抽出やチャンクの作り直しができない。
  hasBronze: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListRagDocumentsResponse = {
  documents: RagKnowledgeDocument[];
};

// 投入。bronzeKey（署名付き URL で上げた原本）か text（貼り付け）のどちらか一方。
export type IngestRagDocumentRequest = {
  title?: string;
  bronzeKey?: string;
  text?: string;
};

export type IngestRagDocumentResponse = {
  documentId: string;
  collectionId: string;
  title: string;
  status: RagDocumentStatus;
  charCount: number;
  chunkCount: number;
  mime?: string;
  originalFilename?: string;
  byteSize?: number;
  extractor?: string;
  extractorVersion?: string;
  // status が failed のときの理由。
  error?: string;
};

// 検索だけ（生成しない）。0 件は results: []。
export type RagSearchRequest = {
  query: string;
  collectionIds?: string[];
  topK?: number;
};

export type RagSearchResult = {
  documentId: string;
  title: string;
  collectionId: string;
  chunkIndex: number;
  headerPath: string | null;
  // チャンク本文。**文字列として描画する**（HTML や Markdown として解釈させない）。
  text: string;
  // RRF の融合スコア。
  score: number;
  // リランカのスコア（rerank が効いたときだけ）。
  rerankScore?: number;
};

export type RagSearchResponse = {
  results: RagSearchResult[];
};

// 問う（既存の POST /rag/query）。上流 ExApp 契約の inputs は変えず、collectionIds を外側に足す。
export type RagQueryRequest = {
  inputs: {
    question: string;
  };
  model?: {
    modelId?: string;
  };
  collectionIds?: string[];
};

export type RagQueryResponse = {
  outputs: string;
  usageMetadata: unknown[];
};

// 回答と参照を構造で返す（POST /rag/ask、-onpre 新規）。
// /rag/query（上流 ExApp 契約）は回答の末尾に出典を文字列で連結するため、画面は「この引用の根拠は
// どのチャンクか」を知れない。本ルートは回答と参照を分けて返し、引用番号にチャンク本文を結び付ける。
export type RagAskRequest = {
  question: string;
  model?: {
    modelId?: string;
  };
  collectionIds?: string[];
};

// 参照 1 件。n は回答本文の [n] に対応する 1 起点の番号。
export type RagReference = {
  n: number;
  documentId: string;
  title: string;
  collectionId: string;
  chunkIndex: number;
  headerPath: string | null;
  // チャンク本文。**文字列として描画する**（HTML や Markdown として解釈させない）。
  text: string;
  score: number;
  rerankScore?: number;
};

export type RagAskResponse = {
  // 回答（Markdown）。出典節は連結されていない＝参照は references で受け取る。
  answer: string;
  references: RagReference[];
};
