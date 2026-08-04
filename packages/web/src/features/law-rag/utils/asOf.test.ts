import type { LawRagReference } from 'genai-web';
import { describe, expect, it } from 'vitest';
import { lawRagFormSchema } from '../schema';
import {
  ENFORCE_DATE_UNDECIDED,
  badgeLabel,
  enforceNote,
  formatEnforceDate,
  todayIso,
} from './asOf';

const makeRef = (over: Partial<LawRagReference> = {}): LawRagReference => ({
  n: 1,
  title: '会社法 第331条の2',
  url: 'https://laws.e-gov.go.jp/law/129AC0000000089',
  enforceDate: '2026-07-23',
  isFuture: false,
  nextEnforceDate: null,
  ...over,
});

describe('formatEnforceDate', () => {
  it('通常の施行日はそのまま返す', () => {
    expect(formatEnforceDate('2026-07-23')).toBe('2026-07-23');
  });

  it('プレースホルダ年（2100 以降）は施行日未定ラベルへ変換する', () => {
    expect(formatEnforceDate('2117-12-31')).toBe(ENFORCE_DATE_UNDECIDED);
    expect(formatEnforceDate('2100-01-01')).toBe(ENFORCE_DATE_UNDECIDED);
  });

  it('不明（null / undefined）は null', () => {
    expect(formatEnforceDate(null)).toBeNull();
    expect(formatEnforceDate(undefined)).toBeNull();
  });
});

describe('badgeLabel', () => {
  it('未施行フラグで現行／施行予定を分類する', () => {
    expect(badgeLabel(makeRef({ isFuture: false }))).toBe('現行');
    expect(badgeLabel(makeRef({ isFuture: true }))).toBe('施行予定');
  });
});

describe('enforceNote', () => {
  it('現行は施行日、改正予定があれば併記する', () => {
    expect(enforceNote(makeRef({ nextEnforceDate: '2026-08-12' }))).toBe(
      '施行日 2026-07-23／改正予定 2026-08-12 施行',
    );
  });

  it('施行予定は「◯◯ 施行」の形にする', () => {
    expect(enforceNote(makeRef({ enforceDate: '2028-12-23', isFuture: true }))).toBe(
      '2028-12-23 施行',
    );
  });

  it('施行日未定のプレースホルダは年を出さずラベルにする', () => {
    expect(enforceNote(makeRef({ enforceDate: '2117-12-31', isFuture: true }))).toBe(
      ENFORCE_DATE_UNDECIDED,
    );
  });

  it('施行日が不明なら空文字（バッジのみ表示になる）', () => {
    expect(enforceNote(makeRef({ enforceDate: null }))).toBe('');
  });
});

describe('lawRagFormSchema', () => {
  it('参照時点は未入力でよい（＝現行で回答）', () => {
    expect(lawRagFormSchema.safeParse({ question: '有給休暇は？' }).success).toBe(true);
    expect(lawRagFormSchema.safeParse({ question: '有給休暇は？', asOfDate: '' }).success).toBe(
      true,
    );
  });

  it('今日以降の日付は受理する', () => {
    expect(
      lawRagFormSchema.safeParse({ question: '有給休暇は？', asOfDate: todayIso() }).success,
    ).toBe(true);
    expect(
      lawRagFormSchema.safeParse({ question: '有給休暇は？', asOfDate: '2099-12-31' }).success,
    ).toBe(true);
  });

  it('過去日は弾く（旧版を保持しないデータで答えられない日付を選ばせない）', () => {
    const result = lawRagFormSchema.safeParse({ question: '有給休暇は？', asOfDate: '2020-04-01' });
    expect(result.success).toBe(false);
  });

  it('形式不正の日付は弾く', () => {
    expect(
      lawRagFormSchema.safeParse({ question: '有給休暇は？', asOfDate: '2030/01/01' }).success,
    ).toBe(false);
    expect(
      lawRagFormSchema.safeParse({ question: '有給休暇は？', asOfDate: '2030-13-45' }).success,
    ).toBe(false);
  });

  it('質問は必須のまま', () => {
    expect(lawRagFormSchema.safeParse({ question: '  ' }).success).toBe(false);
  });
});
