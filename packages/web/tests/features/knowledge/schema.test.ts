import { describe, expect, it } from 'vitest';
import {
  askFormSchema,
  collectionFormSchema,
  KNOWLEDGE_ACCEPT,
  KNOWLEDGE_ALLOWED_EXT,
  pasteTextFormSchema,
  searchFormSchema,
} from '../../../src/features/knowledge/schema';

describe('collectionFormSchema', () => {
  it('名前があれば通る（説明は任意）', () => {
    expect(collectionFormSchema.safeParse({ name: 'テストA' }).success).toBe(true);
    expect(collectionFormSchema.safeParse({ name: 'テストA', description: '説明' }).success).toBe(
      true,
    );
  });

  it('空白のみの名前は弾く', () => {
    expect(collectionFormSchema.safeParse({ name: '   ' }).success).toBe(false);
  });

  it('長すぎる名前は弾く（api の上限と同じ 100 文字）', () => {
    expect(collectionFormSchema.safeParse({ name: 'あ'.repeat(100) }).success).toBe(true);
    expect(collectionFormSchema.safeParse({ name: 'あ'.repeat(101) }).success).toBe(false);
  });
});

describe('pasteTextFormSchema', () => {
  it('タイトルと本文が要る', () => {
    expect(pasteTextFormSchema.safeParse({ title: 'メモ', text: '本文' }).success).toBe(true);
    expect(pasteTextFormSchema.safeParse({ title: 'メモ', text: '  ' }).success).toBe(false);
    expect(pasteTextFormSchema.safeParse({ title: '', text: '本文' }).success).toBe(false);
  });
});

describe('searchFormSchema / askFormSchema', () => {
  it('空の入力を弾く', () => {
    expect(searchFormSchema.safeParse({ query: '' }).success).toBe(false);
    expect(askFormSchema.safeParse({ question: '  ' }).success).toBe(false);
  });

  it('長すぎる検索語は弾く（api の上限と同じ 1000 文字）', () => {
    expect(searchFormSchema.safeParse({ query: 'あ'.repeat(1000) }).success).toBe(true);
    expect(searchFormSchema.safeParse({ query: 'あ'.repeat(1001) }).success).toBe(false);
  });
});

describe('取り込める形式', () => {
  it('画像は入っていない（文字が取れないため）', () => {
    for (const ext of ['.png', '.jpg', '.jpeg', '.gif', '.webp']) {
      expect(KNOWLEDGE_ALLOWED_EXT).not.toContain(ext);
    }
  });

  it('api の抽出器が読める形式がそろっている', () => {
    for (const ext of ['.pdf', '.docx', '.xlsx', '.txt', '.md', '.csv', '.html']) {
      expect(KNOWLEDGE_ALLOWED_EXT).toContain(ext);
    }
  });

  it('accept 属性はカンマ区切りの文字列（DADS の useFileUpload が string を取る）', () => {
    expect(KNOWLEDGE_ACCEPT).toBe(KNOWLEDGE_ALLOWED_EXT.join(','));
    expect(KNOWLEDGE_ACCEPT).toContain('.pdf');
  });
});
