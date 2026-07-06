import { afterEach, describe, expect, it, vi } from 'vitest';

// isUseCaseEnabled は module 評価時に window.__APP_CONFIG__ と import.meta.env を読むため、
// ケースごとに vi.resetModules() + 動的 import で再評価する（機能 ON/OFF・profile 連動の検証）。
describe('isUseCaseEnabled（compose profile 連動）', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('注入された enabledUseCases を最優先（ホワイトリスト＝未定義キーは off）', async () => {
    vi.stubGlobal('window', {
      __APP_CONFIG__: { enabledUseCases: { chat: true, generate: true, translate: false } },
    });
    const { isUseCaseEnabled } = await import('@/utils/isUseCaseEnabled');
    expect(isUseCaseEnabled('generate')).toBe(true);
    expect(isUseCaseEnabled('translate')).toBe(false);
    expect(isUseCaseEnabled('transcribe')).toBe(false); // 注入に無いキーは off
    expect(isUseCaseEnabled('generate', 'translate')).toBe(false); // every: 片方 off で false
  });

  it('未注入時は VITE_APP_HIDDEN_USE_CASES の反転に fallback（後方互換）', async () => {
    vi.stubGlobal('window', {});
    vi.stubEnv('VITE_APP_HIDDEN_USE_CASES', JSON.stringify({ generate: true }));
    const { isUseCaseEnabled } = await import('@/utils/isUseCaseEnabled');
    expect(isUseCaseEnabled('generate')).toBe(false); // hidden=true → 非表示
    expect(isUseCaseEnabled('translate')).toBe(true); // hidden 未指定 → 表示
    expect(isUseCaseEnabled('transcribe')).toBe(true); // Hidden 非対象キー（新設）→ 常時 on 扱い
  });

  it('未注入かつ env 空/不正でも throw せず全 on（防御的読み）', async () => {
    vi.stubGlobal('window', {});
    vi.stubEnv('VITE_APP_HIDDEN_USE_CASES', '');
    const { isUseCaseEnabled } = await import('@/utils/isUseCaseEnabled');
    expect(isUseCaseEnabled('generate')).toBe(true);
    expect(isUseCaseEnabled('chat')).toBe(true);
  });
});
