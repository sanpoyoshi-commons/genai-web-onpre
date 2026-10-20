import { describe, expect, it } from 'vitest';
import { externalImageHref, isSelfServedImageSrc } from '../../src/utils/imageSrc';

// 上流との意図的な乖離を守るテスト（UPSTREAM.md §6-5）。

describe('isSelfServedImageSrc', () => {
  it('相対・同じ配信元・data:・blob: を通す', () => {
    for (const src of [
      '/assets/a.png',
      'a.png',
      './a.png',
      `${window.location.origin}/a.png`,
      'data:image/png;base64,iVBORw0KGgo=',
      `blob:${window.location.origin}/0-1`,
    ]) {
      expect(isSelfServedImageSrc(src)).toBe(true);
    }
  });

  it('外部の宛先と、宛先として扱えないものを通さない', () => {
    for (const src of [
      'https://example.test/a.png',
      'http://example.test/a.png',
      '//example.test/a.png',
      'mailto:info@example.test',
      undefined,
      '',
      '   ',
    ]) {
      expect(isSelfServedImageSrc(src)).toBe(false);
    }
  });
});

describe('externalImageHref', () => {
  it('外部の http・https だけを、解決した宛先で返す', () => {
    expect(externalImageHref('https://example.test/a.png')).toBe('https://example.test/a.png');
    expect(externalImageHref('//example.test/a.png')).toBe('http://example.test/a.png');
  });

  it('自動で描くものと、開ける宛先でないものは返さない', () => {
    for (const src of [
      '/assets/a.png',
      `${window.location.origin}/a.png`,
      'data:image/png;base64,iVBORw0KGgo=',
      'mailto:info@example.test',
      undefined,
      '',
    ]) {
      expect(externalImageHref(src)).toBeUndefined();
    }
  });
});
