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
