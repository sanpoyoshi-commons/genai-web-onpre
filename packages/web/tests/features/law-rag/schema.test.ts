import { describe, expect, it } from 'vitest';
import { lawRagFormSchema } from '../../../src/features/law-rag/schema';

describe('lawRagFormSchema', () => {
  it('非空の質問を通す', () => {
    const result = lawRagFormSchema.safeParse({ question: '有給休暇の付与日数は？' });
    expect(result.success).toBe(true);
  });

  it('空文字は弾く', () => {
    const result = lawRagFormSchema.safeParse({ question: '' });
    expect(result.success).toBe(false);
  });

  it('空白のみは trim して弾く', () => {
    const result = lawRagFormSchema.safeParse({ question: '   ' });
    expect(result.success).toBe(false);
  });
});
