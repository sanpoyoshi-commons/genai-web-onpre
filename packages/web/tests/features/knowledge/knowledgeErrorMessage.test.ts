import { describe, expect, it } from 'vitest';
import { knowledgeErrorMessage } from '../../../src/features/knowledge/hooks/useKnowledgeError';
import { ApiError } from '../../../src/lib/fetcher';

describe('knowledgeErrorMessage', () => {
  it('api が整形した error 文字列を優先する', () => {
    const err = new ApiError(400, { error: '文字数が多すぎます（上限 300000 文字）。' });
    expect(knowledgeErrorMessage(err, '既定')).toBe('文字数が多すぎます（上限 300000 文字）。');
  });

  it('error フィールドが無ければ既定文言', () => {
    expect(knowledgeErrorMessage(new ApiError(500, {}), '既定')).toBe('既定');
  });

  it('一般 Error は message を返す', () => {
    expect(knowledgeErrorMessage(new Error('boom'), '既定')).toBe('boom');
  });

  it('不明なエラーは既定文言', () => {
    expect(knowledgeErrorMessage('???', '既定')).toBe('既定');
  });
});
