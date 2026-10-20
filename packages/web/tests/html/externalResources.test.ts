import { describe, expect, it } from 'vitest';
import html403 from '../../403.html?raw';
import indexHtml from '../../index.html?raw';
import maintenanceHtml from '../../maintenance.html?raw';

// 上流との意図的な乖離を守るテスト（UPSTREAM.md §6-4）。
// 配信する HTML は書体を端末に入っているものに任せる＝外部から stylesheet も書体も
// 読み込まない。読み込みが戻ると、利用者の端末から第三者へ要求が出て、外部へ出られない
// 網では描画がその要求の完了を待つ。

const PAGES = [
  { name: 'index.html', source: indexHtml },
  { name: '403.html', source: html403 },
  { name: 'maintenance.html', source: maintenanceHtml },
] as const;

/** 書体を配っている既知のホスト（link 以外の形で現れても拾うため、本文を直接見る）。 */
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// 外部を指す宛先。`//host/...`（プロトコル相対）も外部なので含める。
// `/favicon.svg` のような同一オリジンの絶対パスは斜線 1 本なので一致しない。
const EXTERNAL_URL = /^(https?:)?\/\//i;

// 外部の stylesheet・書体を引き込みうる link の rel。preconnect と dns-prefetch は
// 書体そのものを読まないが要求は出るため、宛先が外部なら同じく許さない。
const LOADING_RELS = new Set([
  'stylesheet',
  'preload',
  'prefetch',
  'preconnect',
  'dns-prefetch',
  'modulepreload',
]);

const parse = (source: string) => new DOMParser().parseFromString(source, 'text/html');

/** 文書に書かれたインラインの CSS（style 要素と style 属性）をまとめて返す。 */
const inlineStyles = (doc: Document) => [
  ...[...doc.querySelectorAll('style')].map((element) => element.textContent ?? ''),
  ...[...doc.querySelectorAll('[style]')].map((element) => element.getAttribute('style') ?? ''),
];

describe.each(PAGES)('$name', ({ source }) => {
  it('書体を配るホストを参照しない', () => {
    for (const host of FONT_HOSTS) {
      expect(source).not.toContain(host);
    }
  });

  it('外部を指す stylesheet・書体の link が無い', () => {
    const external = [...parse(source).querySelectorAll('link')]
      .filter((link) => {
        const rels = (link.getAttribute('rel') ?? '').toLowerCase().split(/\s+/);
        return rels.some((rel) => LOADING_RELS.has(rel));
      })
      .map((link) => link.getAttribute('href') ?? '')
      .filter((href) => EXTERNAL_URL.test(href));

    expect(external).toEqual([]);
  });

  it('インラインの CSS が外部の @import・url() を持たない', () => {
    for (const css of inlineStyles(parse(source))) {
      expect(css).not.toMatch(/@import\s+(url\(\s*)?['"]?https?:\/\//i);
      expect(css).not.toMatch(/url\(\s*['"]?https?:\/\//i);
    }
  });
});
