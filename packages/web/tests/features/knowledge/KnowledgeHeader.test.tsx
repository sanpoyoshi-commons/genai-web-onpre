import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KnowledgeHeader } from '../../../src/features/knowledge/components/KnowledgeHeader';

// 冒頭の説明文は 2026-10-10 に文面を決めたもの。言い換えに気づけるよう、構成と要点を固定する。
describe('KnowledgeHeader', () => {
  it('見出しの構成（ナレッジ集／想定用途／アプリ個別の留意点／操作方法／仕組み）', () => {
    render(<KnowledgeHeader />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('ナレッジ集');
    expect(screen.getByRole('heading', { level: 2, name: '想定用途' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'アプリ個別の留意点' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: '操作方法' })).toBeTruthy();
    // 「仕組み」は折りたたみ（既定は閉じている）。
    expect(screen.getByText('仕組み')).toBeTruthy();
  });

  it('想定用途：2つの段の呼び名を出す', () => {
    const { container } = render(<KnowledgeHeader />);
    expect(container.textContent).toContain(
      '手元の文書（PDF・Word・Excel・テキスト）を「ナレッジ集」に入れておくと',
    );
    expect(container.textContent).toContain('入れた文書は入れた本人だけが検索・閲覧でき');
    expect(container.textContent).toContain('チャンク検索確認は生成AIを使わず');
    expect(container.textContent).toContain(
      '汎用RAG質問は、その検索結果をもとに生成AIが回答します',
    );
  });

  it('留意点：根拠を確かめること・上限超えは断ること・文書内の指示に従わせないことを書く', () => {
    const { container } = render(<KnowledgeHeader />);
    expect(container.textContent).toContain('既定では、この機械の中で動く小型 LLM');
    expect(container.textContent).toContain('参考情報からは確認できません');
    expect(container.textContent).toContain('途中まで取り込むのではなく、取り込みを断ります');
    expect(container.textContent).toContain('これまでの指示を無視して');
  });

  it('操作方法：4 つの手順を順に出す', () => {
    const { container } = render(<KnowledgeHeader />);
    const steps = container.querySelectorAll('ol > li');
    expect(steps).toHaveLength(4);
    expect(steps[0]?.textContent).toContain('ナレッジ集を作り、使うナレッジ集を選びます');
    expect(steps[1]?.textContent).toContain('「文書」の段で');
    expect(steps[2]?.textContent).toContain('「チャンク検索確認」で');
    expect(steps[3]?.textContent).toContain('「汎用RAG質問」に質問を入れます');
  });

  it('仕組み：3 つの層・2 本立ての検索・生成は 1 回を書く', () => {
    const { container } = render(<KnowledgeHeader />);
    expect(container.textContent).toContain('3つの層に分けて保存します');
    expect(container.textContent).toContain('この画面ができる前に');
    expect(container.textContent).toContain(
      'ベクトル検索（意味の近さ）と全文検索（文字の一致）の2本立て',
    );
    expect(container.textContent).toContain('生成AIを呼ぶのは質問1回につき1回に固定してあり');
  });
});
