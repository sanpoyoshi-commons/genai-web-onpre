import { describe, expect, it } from 'vitest';
import { ApiError } from '../../../src/lib/fetcher';
import { errorMessage } from '../../../src/features/law-rag/hooks/useLawRag';

describe('law-rag errorMessage', () => {
  it('ApiError の整形済み error 文字列を優先する', () => {
    const err = new ApiError(403, { error: 'rag use case is disabled' });
    expect(errorMessage(err)).toBe('rag use case is disabled');
  });

  it('ApiError で error フィールドが無ければ既定文言', () => {
    const err = new ApiError(500, {});
    expect(errorMessage(err)).toBe('法令調査サービスでエラーが発生しました。');
  });

  it('一般 Error は message を返す', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
  });

  it('不明なエラーは汎用文言', () => {
    expect(errorMessage('???')).toBe('予期しないエラーが発生しました。');
  });
});
