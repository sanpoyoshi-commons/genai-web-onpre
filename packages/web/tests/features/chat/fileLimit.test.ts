import { describe, expect, it } from 'vitest';
import { FILE_LIMIT } from '../../../src/features/chat/constants';

// 上流との意図的な乖離を守るテスト（UPSTREAM.md §6-3）。
// ローカル（Ollama）経路では api が自分で文字を取り出すため、読めない形式は選ばせない。

describe('FILE_LIMIT.accept.doc', () => {
  it('旧 OLE バイナリ（.doc・.xls）を含めない（api が読めないため）', () => {
    expect(FILE_LIMIT.accept.doc).not.toContain('.doc');
    expect(FILE_LIMIT.accept.doc).not.toContain('.xls');
  });

  it('api が読める形式は残っている', () => {
    for (const ext of ['.pdf', '.txt', '.md', '.csv', '.html', '.docx']) {
      expect(FILE_LIMIT.accept.doc).toContain(ext);
    }
  });

  it('.xlsx は残す（api が読める）', () => {
    expect(FILE_LIMIT.accept.doc).toContain('.xlsx');
  });

  it('.gif を含めない（Ollama の OpenAI 互換が受け付けない）', () => {
    expect(FILE_LIMIT.accept.doc).not.toContain('.gif');
  });
});

describe('FILE_LIMIT.accept.image', () => {
  it('PNG と JPEG だけにする', () => {
    expect([...FILE_LIMIT.accept.image].sort()).toEqual(['.jpeg', '.jpg', '.png']);
  });

  it('.webp を含めない（Ollama 同梱の x/image に既知の DoS がある）', () => {
    expect(FILE_LIMIT.accept.image).not.toContain('.webp');
  });
});

describe('FILE_LIMIT の件数と大きさ', () => {
  it('api の ATTACHMENT_MAX_FILES（既定 5）と揃っている', () => {
    expect(FILE_LIMIT.maxFileCount).toBe(5);
  });

  it('1件の大きさは api の ATTACHMENT_MAX_BYTES（5 MiB）に収まる', () => {
    expect(FILE_LIMIT.maxFileSizeMB * 1e6).toBeLessThanOrEqual(5 * 1024 * 1024);
    expect(FILE_LIMIT.maxImageFileSizeMB * 1e6).toBeLessThanOrEqual(5 * 1024 * 1024);
  });

  it('画像は api の ATTACHMENT_MAX_IMAGES（既定 3）と揃っている', () => {
    expect(FILE_LIMIT.maxImageFileCount).toBe(3);
    expect(FILE_LIMIT.maxImageFileSizeMB).toBe(2);
  });

  // 本文（base64）は元の約 4/3 倍。api の `API_JSON_BODY_LIMIT` は **48mb**
  // （deploy の compose の既定と api の `src/app.ts` の既定。2026-09-27 に 32mb から引き上げ）。
  // 引き上げた理由がこの下のテスト：useFiles の validateUploadedFiles は文書・画像・動画を
  // **別々に**数えるので、1 通に文書 5 件（4.5MB）と画像 3 件（2MB）を同時に載せられる。
  //   生 5×4.5 + 3×2 = 28.5MB → base64 で 38.0MB。32mb では 413 になり、48mb なら収まる。
  const BODY_LIMIT_MB = 48;
  const asBase64MB = (rawMB: number) => (rawMB * 4) / 3;

  it('文書だけなら body の上限に収まる', () => {
    expect(asBase64MB(FILE_LIMIT.maxFileCount * FILE_LIMIT.maxFileSizeMB)).toBeLessThanOrEqual(
      BODY_LIMIT_MB,
    );
  });

  it('画像だけなら body の上限に収まる', () => {
    expect(
      asBase64MB(FILE_LIMIT.maxImageFileCount * FILE_LIMIT.maxImageFileSizeMB),
    ).toBeLessThanOrEqual(BODY_LIMIT_MB);
  });

  it('文書と画像を同時に目一杯載せても body の上限に収まる（別枠で数えるため合算になる）', () => {
    const raw =
      FILE_LIMIT.maxFileCount * FILE_LIMIT.maxFileSizeMB +
      FILE_LIMIT.maxImageFileCount * FILE_LIMIT.maxImageFileSizeMB;
    expect(raw).toBe(28.5);
    expect(asBase64MB(raw)).toBe(38);
    expect(asBase64MB(raw)).toBeLessThanOrEqual(BODY_LIMIT_MB);
  });
});
