import { modelMetadata } from '@genai-web/common';
import { describe, expect, it } from 'vitest';

// 上流との意図的な乖離を守るテスト（UPSTREAM.md §6-3）。
// ローカル（Ollama）経路のモデルは上流の metadata に無いので、ここで登録している。

const GEMMA4 = ['gemma4:e4b', 'gemma4:e2b', 'gemma4:26b', 'gemma4:31b'];
const OTHER_LOCAL = [
  'mistral:7b',
  'llama3.2:3b',
  'hf.co/elyza/Llama-3-ELYZA-JP-8B-GGUF',
  'schroneko/llama-3.1-swallow-8b-instruct-v0.1',
  'mixtral',
  'llama3.3:70b',
];

describe('ローカルモデルの flags', () => {
  it('Gemma 4 系は text・doc・image に対応（入力の画像対応を公表しているため）', () => {
    for (const id of GEMMA4) {
      const flags = modelMetadata[id]?.flags;
      expect(flags, id).toBeDefined();
      expect(flags?.text, id).toBe(true);
      expect(flags?.doc, id).toBe(true);
      expect(flags?.image, id).toBe(true);
    }
  });

  it('ほかのローカルモデルは image を立てない（vision 非対応のまま送らない）', () => {
    for (const id of OTHER_LOCAL) {
      const flags = modelMetadata[id]?.flags;
      expect(flags, id).toBeDefined();
      expect(flags?.doc, id).toBe(true);
      expect(flags?.image, id).toBe(false);
    }
  });

  it('ローカルモデルはどれも動画に対応しない（ローカル経路に受け口が無い）', () => {
    for (const id of [...GEMMA4, ...OTHER_LOCAL]) {
      expect(modelMetadata[id]?.flags.video, id).toBe(false);
    }
  });
});
