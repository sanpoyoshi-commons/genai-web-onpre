import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock('@/lib/fetcher', () => ({
  genUApi: {
    get: getMock,
    post: vi.fn(),
    delete: vi.fn(),
  },
  uploadToSignedUrl: vi.fn(),
}));

import {
  extractStorageKey,
  getFileDownloadSignedUrl,
  getS3Uri,
  parseS3Url,
} from '../../src/lib/fileApi';

describe('parseS3Url', () => {
  describe('path 形式（オンプレの S3 互換ストレージ）', () => {
    it('https://<host>/<bucket>/<key> を解釈する', () => {
      const parsed = parseS3Url('https://example.test/genai-files/user-1/uuid-1/report.pdf');
      expect(parsed?.bucketName).toBe('genai-files');
      expect(parsed?.prefix).toBe('user-1/uuid-1/report.pdf');
      expect(parsed?.region).toBeUndefined();
    });

    it('ポート付きのホストを解釈する', () => {
      const parsed = parseS3Url('https://localhost:8443/genai-files/user-1/uuid-1/report.pdf');
      expect(parsed?.bucketName).toBe('genai-files');
      expect(parsed?.prefix).toBe('user-1/uuid-1/report.pdf');
      expect(parsed?.region).toBeUndefined();
    });

    it('IP アドレスとポートのホストを解釈する', () => {
      const parsed = parseS3Url('https://192.168.0.5:8443/genai-files/user-1/uuid-1/a.png');
      expect(parsed?.bucketName).toBe('genai-files');
      expect(parsed?.prefix).toBe('user-1/uuid-1/a.png');
    });

    it('パーセントエンコードされたキーはそのまま返す（復号は呼び出し側）', () => {
      const parsed = parseS3Url('https://localhost:8443/genai-files/user-1/uuid-1/%E5%A0%B1.pdf');
      expect(parsed?.prefix).toBe('user-1/uuid-1/%E5%A0%B1.pdf');
    });

    it('# 以降はキーに含めたまま返す（アンカーの切り出しは呼び出し側）', () => {
      const parsed = parseS3Url('https://localhost:8443/genai-files/user-1/uuid-1/a.pdf#page=2');
      expect(parsed?.prefix).toBe('user-1/uuid-1/a.pdf#page=2');
    });
  });

  describe('s3:// 形式（既存・挙動を変えない）', () => {
    it('s3://<bucket>/<key> を解釈する', () => {
      const parsed = parseS3Url('s3://my-bucket/user-1/uuid-1/report.pdf');
      expect(parsed?.bucketName).toBe('my-bucket');
      expect(parsed?.prefix).toBe('user-1/uuid-1/report.pdf');
      expect(parsed?.region).toBeUndefined();
    });
  });

  describe('amazonaws.com 形式（既存・挙動を変えない）', () => {
    it('path-style（https://s3.<region>.amazonaws.com/<bucket>/<key>）を解釈する', () => {
      const parsed = parseS3Url(
        'https://s3.ap-northeast-1.amazonaws.com/my-bucket/user-1/uuid-1/report.pdf',
      );
      expect(parsed?.bucketName).toBe('my-bucket');
      expect(parsed?.prefix).toBe('user-1/uuid-1/report.pdf');
      expect(parsed?.region).toBe('ap-northeast-1');
    });

    it('virtual-hosted-style（リージョン付き）を解釈する', () => {
      const parsed = parseS3Url(
        'https://my-bucket.s3.ap-northeast-1.amazonaws.com/user-1/uuid-1/report.pdf',
      );
      expect(parsed?.bucketName).toBe('my-bucket');
      expect(parsed?.prefix).toBe('user-1/uuid-1/report.pdf');
      expect(parsed?.region).toBe('ap-northeast-1');
    });

    it('virtual-hosted-style（リージョン無し）を解釈する', () => {
      const parsed = parseS3Url('https://my-bucket.s3.amazonaws.com/user-1/uuid-1/report.pdf');
      expect(parsed?.bucketName).toBe('my-bucket');
      expect(parsed?.prefix).toBe('user-1/uuid-1/report.pdf');
      expect(parsed?.region).toBeUndefined();
    });
  });

  describe('解釈できない入力', () => {
    it('空文字は undefined を返す', () => {
      expect(parseS3Url('')).toBeUndefined();
    });

    it('URL でない文字列は undefined を返す', () => {
      expect(parseS3Url('not-a-url')).toBeUndefined();
    });

    it('http は解釈しない（署名付き URL は https のみ）', () => {
      expect(parseS3Url('http://localhost:8443/genai-files/user-1/uuid-1/a.pdf')).toBeUndefined();
    });

    it('バケットとキーに分けられないパスは undefined を返す', () => {
      expect(parseS3Url('https://localhost:8443/genai-files')).toBeUndefined();
    });

    it('バケット名が空のパスは undefined を返す', () => {
      expect(parseS3Url('https://localhost:8443//user-1/uuid-1/a.pdf')).toBeUndefined();
    });
  });
});

describe('extractStorageKey', () => {
  it('path 形式ではバケット名を含めずキーだけを返す', () => {
    expect(extractStorageKey('https://localhost:8443/genai-files/user-1/uuid-1/report.pdf')).toBe(
      'user-1/uuid-1/report.pdf',
    );
  });

  it('署名付き URL のクエリは落とす', () => {
    expect(
      extractStorageKey(
        'https://localhost:8443/genai-audio/user-1/uuid-1/talk.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600',
      ),
    ).toBe('user-1/uuid-1/talk.mp3');
  });

  it('# 以降も落とす', () => {
    expect(
      extractStorageKey('https://localhost:8443/genai-files/user-1/uuid-1/report.pdf#page=2'),
    ).toBe('user-1/uuid-1/report.pdf');
  });

  it('パーセントエンコードされたキーを復号する', () => {
    expect(
      extractStorageKey('https://localhost:8443/genai-files/user-1/uuid-1/%E5%A0%B1%E5%91%8A.pdf'),
    ).toBe('user-1/uuid-1/報告.pdf');
  });

  it('amazonaws.com の virtual-hosted-style でもキーだけを返す', () => {
    expect(
      extractStorageKey('https://my-bucket.s3.ap-northeast-1.amazonaws.com/user-1/uuid-1/a.pdf'),
    ).toBe('user-1/uuid-1/a.pdf');
  });

  it('s3:// 形式でもキーだけを返す', () => {
    expect(extractStorageKey('s3://my-bucket/user-1/uuid-1/a.pdf')).toBe('user-1/uuid-1/a.pdf');
  });

  it('解釈できない URL は undefined を返す', () => {
    expect(extractStorageKey('')).toBeUndefined();
    expect(extractStorageKey('not-a-url')).toBeUndefined();
    expect(extractStorageKey('https://localhost:8443/genai-files')).toBeUndefined();
  });

  it('復号できないキーは undefined を返す', () => {
    expect(
      extractStorageKey('https://localhost:8443/genai-files/user-1/%E0%A4%A.pdf'),
    ).toBeUndefined();
  });
});

describe('getS3Uri', () => {
  it('path 形式の URL を s3:// 形式に変換する', () => {
    expect(getS3Uri('https://localhost:8443/genai-files/user-1/uuid-1/movie.mp4')).toBe(
      's3://genai-files/user-1/uuid-1/movie.mp4',
    );
  });

  it('s3:// 形式はそのままの内容を返す', () => {
    expect(getS3Uri('s3://my-bucket/user-1/uuid-1/movie.mp4')).toBe(
      's3://my-bucket/user-1/uuid-1/movie.mp4',
    );
  });

  it('解釈できない URL は例外にする', () => {
    expect(() => getS3Uri('not-a-url')).toThrow('Unsupported storage URL format');
  });
});

describe('getFileDownloadSignedUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMock.mockResolvedValue({ data: 'https://localhost:8443/signed', status: 200 });
  });

  it('path 形式の URL からバケットとキーを渡す（region は付けない）', async () => {
    const url = await getFileDownloadSignedUrl(
      'https://localhost:8443/genai-files/user-1/uuid-1/report.pdf',
    );

    expect(getMock).toHaveBeenCalledWith('/file/url', {
      params: {
        bucketName: 'genai-files',
        filePrefix: 'user-1/uuid-1/report.pdf',
        region: undefined,
      },
    });
    expect(url).toBe('https://localhost:8443/signed');
  });

  it('キーを復号して渡す', async () => {
    await getFileDownloadSignedUrl(
      'https://localhost:8443/genai-files/user-1/uuid-1/%E5%A0%B1%E5%91%8A.pdf',
    );

    expect(getMock).toHaveBeenCalledWith('/file/url', {
      params: {
        bucketName: 'genai-files',
        filePrefix: 'user-1/uuid-1/報告.pdf',
        region: undefined,
      },
    });
  });

  it('# のアンカーは署名付き URL の末尾に戻す', async () => {
    const url = await getFileDownloadSignedUrl(
      'https://localhost:8443/genai-files/user-1/uuid-1/report.pdf#page=2',
    );

    expect(getMock).toHaveBeenCalledWith('/file/url', {
      params: {
        bucketName: 'genai-files',
        filePrefix: 'user-1/uuid-1/report.pdf',
        region: undefined,
      },
    });
    expect(url).toBe('https://localhost:8443/signed#page=2');
  });

  it('amazonaws.com 形式では region も渡す（既存・挙動を変えない）', async () => {
    await getFileDownloadSignedUrl(
      'https://my-bucket.s3.ap-northeast-1.amazonaws.com/user-1/uuid-1/report.pdf',
    );

    expect(getMock).toHaveBeenCalledWith('/file/url', {
      params: {
        bucketName: 'my-bucket',
        filePrefix: 'user-1/uuid-1/report.pdf',
        region: 'ap-northeast-1',
      },
    });
  });

  it('解釈できない URL は例外にし、api を呼ばない', async () => {
    await expect(getFileDownloadSignedUrl('not-a-url')).rejects.toThrow(
      'Unsupported storage URL format',
    );
    expect(getMock).not.toHaveBeenCalled();
  });
});
