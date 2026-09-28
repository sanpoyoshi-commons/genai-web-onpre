import {
  DeleteFileResponse,
  GetFileDownloadSignedUrlRequest,
  GetFileDownloadSignedUrlResponse,
  GetFileUploadSignedUrlRequest,
  GetFileUploadSignedUrlResponse,
  UploadFileRequest,
} from 'genai-web';
import { genUApi, uploadToSignedUrl } from '@/lib/fetcher';

// ストレージ URL の解釈パターン。先に一致したものを採る（順序に意味がある）。
const S3_URL_PATTERNS = [
  // s3://<bucket>/<key>
  /^s3:\/\/(?<bucketName>.+?)\/(?<prefix>.+)/,
  // https://s3.<region>.amazonaws.com/<bucket>/<key>（AWS path-style）
  /^https:\/\/s3.(?<region>.+?).amazonaws.com\/(?<bucketName>.+?)\/(?<prefix>.+)$/,
  // https://<bucket>.s3[.-<region>].amazonaws.com/<key>（AWS virtual-hosted-style）
  /^https:\/\/(?<bucketName>.+?).s3(|(\.|-)(?<region>.+?)).amazonaws.com\/(?<prefix>.+)$/,
  // https://<host>[:port]/<bucket>/<key>（path-style。オンプレの S3 互換ストレージはこの形）。
  // AWS の 2 形式より後に置き、既存の解釈を変えない。region は URL に現れないため undefined。
  /^https:\/\/[^/]+\/(?<bucketName>[^/]+)\/(?<prefix>.+)$/,
];

type ParsedS3Url = {
  bucketName: string;
  prefix: string;
  region?: string;
};

export const parseS3Url = (s3Url: string): ParsedS3Url | undefined => {
  let result: RegExpExecArray | null = null;

  for (const pattern of S3_URL_PATTERNS) {
    result = pattern.exec(s3Url);
    if (result) {
      break;
    }
  }

  return result?.groups as ParsedS3Url | undefined;
};

/**
 * ストレージ URL から S3 キーを取り出す（バケット名は含まない）。
 *
 * path-style の URL ではパスの先頭がバケット名になるため、`new URL(...).pathname` をそのままキーには
 * できない（api はキーの先頭セグメントで所有権を見るため、バケット名が混ざると 403 になる）。
 * 署名付き URL をそのまま渡せるよう、クエリとフラグメントは落とす。
 * 解釈できない URL とデコードできないキーは undefined。
 */
export const extractStorageKey = (url: string): string | undefined => {
  const parsed = parseS3Url(url.split(/[?#]/)[0]);
  if (!parsed) {
    return undefined;
  }
  try {
    return decodeURIComponent(parsed.prefix);
  } catch {
    return undefined;
  }
};

export const getSignedUrl = (req: GetFileUploadSignedUrlRequest) => {
  return genUApi.post<GetFileUploadSignedUrlResponse>('file/url', req);
};

export const uploadFile = (url: string, req: UploadFileRequest) => {
  return uploadToSignedUrl(url, req.file, 'file/*');
};

export const getFileDownloadSignedUrl = async (s3Url: string) => {
  const parsed = parseS3Url(s3Url);
  if (!parsed) {
    throw new Error('Unsupported storage URL format');
  }
  const { bucketName, prefix, region } = parsed;

  const [filePrefix, anchorLink] = prefix.split('#');

  const params: GetFileDownloadSignedUrlRequest = {
    bucketName: bucketName,
    filePrefix: decodeURIComponent(filePrefix),
    region: region,
  };
  const { data: url } = await genUApi.get<GetFileDownloadSignedUrlResponse>('/file/url', {
    params,
  });
  return `${url}${anchorLink ? `#${anchorLink}` : ''}`;
};

export const deleteUploadedFile = async (fileName: string) => {
  return genUApi.delete<DeleteFileResponse>(`file/${encodeURIComponent(fileName)}`);
};

export const getS3Uri = (s3Url: string) => {
  const parsed = parseS3Url(s3Url);
  if (!parsed) {
    throw new Error('Unsupported storage URL format');
  }
  return `s3://${parsed.bucketName}/${parsed.prefix}`;
};
