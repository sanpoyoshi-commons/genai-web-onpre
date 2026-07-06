import { CRI_PREFIX_PATTERN, modelMetadata } from '@genai-web/common';
import type { Model } from 'genai-web';

// On-premise 実行時設定の解決。nginx が /config.js で注入する window.__APP_CONFIG__
// （parse 済み配列）を最優先し、無ければ build 時 env（VITE_APP_*、JSON 文字列）を
// JSON.parse、それも無ければ空配列にフォールバックする。これによりモデル一覧の変更が
// web 再 build 不要（.env の MODEL_IDS 編集＋nginx 再起動）で反映される。
const resolveModelIds = (
  runtime: string[] | undefined,
  buildEnv: string | undefined,
): string[] =>
  (runtime ?? (JSON.parse(buildEnv ?? '[]') as string[]))
    .map((name: string) => name.trim())
    .filter((name: string) => name);

const appConfig = window.__APP_CONFIG__ ?? {};

const bedrockModelIds: string[] = resolveModelIds(
  appConfig.modelIds,
  import.meta.env.VITE_APP_MODEL_IDS,
);

const duplicateBaseModelIds = new Set(
  bedrockModelIds
    .map((modelId) => modelId.replace(CRI_PREFIX_PATTERN, ''))
    .filter((item, index, arr) => arr.indexOf(item) !== index),
);
const endpointNames: string[] = resolveModelIds(
  appConfig.endpointNames,
  import.meta.env.VITE_APP_ENDPOINT_NAMES,
);

const imageGenModelIds: string[] = resolveModelIds(
  appConfig.imageGenModelIds,
  import.meta.env.VITE_APP_IMAGE_MODEL_IDS,
);

const textModels = [
  ...bedrockModelIds.map((name) => ({ modelId: name, type: 'bedrock' }) as Model),
  ...endpointNames.map((name) => ({ modelId: name, type: 'sagemaker' }) as Model),
];
const imageGenModels = [
  ...imageGenModelIds.map((name) => ({ modelId: name, type: 'bedrock' }) as Model),
];

export const findModelByModelId = (modelId: string) => {
  const model = textModels.find((m) => m.modelId === modelId);
  if (!model) {
    return undefined;
  }
  return { ...model };
};

export const findModelDisplayNameByModelId = (modelId: string): string => {
  let displayName = modelMetadata[modelId]?.displayName ?? modelId;
  if (duplicateBaseModelIds.has(modelId.replace(CRI_PREFIX_PATTERN, ''))) {
    const matched = modelId.match(CRI_PREFIX_PATTERN);
    if (matched) {
      displayName += ` (${matched[1].toUpperCase()})`;
    }
  }
  return displayName;
};

export const MODELS = {
  modelIds: [...bedrockModelIds, ...endpointNames],
  modelMetadata,
  imageGenModelIds: imageGenModelIds,
  imageGenModels: imageGenModels,
};
