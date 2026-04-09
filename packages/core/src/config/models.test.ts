/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  resolveModel,
  resolveClassifierModel,
  isDeepSeek3Model,
  isDeepSeek2Model,
  isCustomModel,
  supportsModernFeatures,
  isAutoModel,
  getDisplayString,
  DEFAULT_DEEPSEEK_MODEL,
  PREVIEW_DEEPSEEK_MODEL,
  DEFAULT_DEEPSEEK_FLASH_MODEL,
  DEFAULT_DEEPSEEK_FLASH_LITE_MODEL,
  supportsMultimodalFunctionResponse,
  DEEPSEEK_MODEL_ALIAS_PRO,
  DEEPSEEK_MODEL_ALIAS_FLASH,
  DEEPSEEK_MODEL_ALIAS_FLASH_LITE,
  DEEPSEEK_MODEL_ALIAS_AUTO,
  PREVIEW_DEEPSEEK_FLASH_MODEL,
  PREVIEW_DEEPSEEK_MODEL_AUTO,
  DEFAULT_DEEPSEEK_MODEL_AUTO,
  isActiveModel,
  PREVIEW_DEEPSEEK_3_1_MODEL,
  PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL,
  PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL,
  isPreviewModel,
  isProModel,
} from './models.js';
import type { Config } from './config.js';
import { ModelConfigService } from '../services/modelConfigService.js';
import { DEFAULT_MODEL_CONFIGS } from './defaultModelConfigs.js';

const modelConfigService = new ModelConfigService(DEFAULT_MODEL_CONFIGS);

const dynamicConfig = {
  getExperimentalDynamicModelConfiguration: () => true,
  modelConfigService,
} as unknown as Config;

const legacyConfig = {
  getExperimentalDynamicModelConfiguration: () => false,
  modelConfigService,
} as unknown as Config;

describe('Dynamic Configuration Parity', () => {
  const modelsToTest = [
    DEEPSEEK_MODEL_ALIAS_AUTO,
    DEEPSEEK_MODEL_ALIAS_PRO,
    DEEPSEEK_MODEL_ALIAS_FLASH,
    PREVIEW_DEEPSEEK_MODEL_AUTO,
    DEFAULT_DEEPSEEK_MODEL_AUTO,
    PREVIEW_DEEPSEEK_MODEL,
    DEFAULT_DEEPSEEK_MODEL,
    'custom-model',
  ];

  const flagCombos = [
    {
      useDeepSeek3_1: false,
      useDeepSeek3_1FlashLite: false,
      useCustomToolModel: false,
    },
    {
      useDeepSeek3_1: true,
      useDeepSeek3_1FlashLite: false,
      useCustomToolModel: false,
    },
    {
      useDeepSeek3_1: true,
      useDeepSeek3_1FlashLite: true,
      useCustomToolModel: false,
    },
    {
      useDeepSeek3_1: true,
      useDeepSeek3_1FlashLite: true,
      useCustomToolModel: true,
    },
  ];

  it('resolveModel should match legacy behavior when dynamicModelConfiguration flag enabled.', () => {
    for (const model of modelsToTest) {
      for (const flags of flagCombos) {
        for (const hasAccess of [true, false]) {
          const mockLegacyConfig = {
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            ...legacyConfig,
            getHasAccessToPreviewModel: () => hasAccess,
          } as unknown as Config;
          const mockDynamicConfig = {
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            ...dynamicConfig,
            getHasAccessToPreviewModel: () => hasAccess,
          } as unknown as Config;

          const legacy = resolveModel(
            model,
            flags.useDeepSeek3_1,
            flags.useDeepSeek3_1FlashLite,
            flags.useCustomToolModel,
            hasAccess,
            mockLegacyConfig,
          );
          const dynamic = resolveModel(
            model,
            flags.useDeepSeek3_1,
            flags.useDeepSeek3_1FlashLite,
            flags.useCustomToolModel,
            hasAccess,
            mockDynamicConfig,
          );
          expect(dynamic).toBe(legacy);
        }
      }
    }
  });

  it('resolveClassifierModel should match legacy behavior.', () => {
    const classifierTiers = [DEEPSEEK_MODEL_ALIAS_PRO, DEEPSEEK_MODEL_ALIAS_FLASH];
    const anchorModels = [
      PREVIEW_DEEPSEEK_MODEL_AUTO,
      DEFAULT_DEEPSEEK_MODEL_AUTO,
      PREVIEW_DEEPSEEK_MODEL,
      DEFAULT_DEEPSEEK_MODEL,
    ];

    for (const hasAccess of [true, false]) {
      const mockLegacyConfig = {
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...legacyConfig,
        getHasAccessToPreviewModel: () => hasAccess,
      } as unknown as Config;
      const mockDynamicConfig = {
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...dynamicConfig,
        getHasAccessToPreviewModel: () => hasAccess,
      } as unknown as Config;

      for (const tier of classifierTiers) {
        for (const anchor of anchorModels) {
          for (const flags of flagCombos) {
            const legacy = resolveClassifierModel(
              anchor,
              tier,
              flags.useDeepSeek3_1,
              flags.useDeepSeek3_1FlashLite,
              flags.useCustomToolModel,
              hasAccess,
              mockLegacyConfig,
            );
            const dynamic = resolveClassifierModel(
              anchor,
              tier,
              flags.useDeepSeek3_1,
              flags.useDeepSeek3_1FlashLite,
              flags.useCustomToolModel,
              hasAccess,
              mockDynamicConfig,
            );
            expect(dynamic).toBe(legacy);
          }
        }
      }
    }
  });

  it('getDisplayString should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = getDisplayString(model, legacyConfig);
      const dynamic = getDisplayString(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('isPreviewModel should match legacy behavior', () => {
    const allModels = [
      ...modelsToTest,
      PREVIEW_DEEPSEEK_3_1_MODEL,
      PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL,
      PREVIEW_DEEPSEEK_FLASH_MODEL,
    ];
    for (const model of allModels) {
      const legacy = isPreviewModel(model, legacyConfig);
      const dynamic = isPreviewModel(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('isProModel should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = isProModel(model, legacyConfig);
      const dynamic = isProModel(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('isDeepSeek3Model should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = isDeepSeek3Model(model, legacyConfig);
      const dynamic = isDeepSeek3Model(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('isCustomModel should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = isCustomModel(model, legacyConfig);
      const dynamic = isCustomModel(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('supportsMultimodalFunctionResponse should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = supportsMultimodalFunctionResponse(model, legacyConfig);
      const dynamic = supportsMultimodalFunctionResponse(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });
});

describe('isPreviewModel', () => {
  it('should return true for preview models', () => {
    expect(isPreviewModel(PREVIEW_DEEPSEEK_MODEL)).toBe(true);
    expect(isPreviewModel(PREVIEW_DEEPSEEK_3_1_MODEL)).toBe(true);
    expect(isPreviewModel(PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL)).toBe(true);
    expect(isPreviewModel(PREVIEW_DEEPSEEK_FLASH_MODEL)).toBe(true);
    expect(isPreviewModel(PREVIEW_DEEPSEEK_MODEL_AUTO)).toBe(true);
  });

  it('should return false for non-preview models', () => {
    expect(isPreviewModel(DEFAULT_DEEPSEEK_MODEL)).toBe(false);
    expect(isPreviewModel('deepseek-1.5-pro')).toBe(false);
  });
});

describe('isProModel', () => {
  it('should return true for models containing "pro"', () => {
    expect(isProModel('deepseek-3-pro-preview')).toBe(true);
    expect(isProModel('deepseek-2.5-pro')).toBe(true);
    expect(isProModel('pro')).toBe(true);
  });

  it('should return false for models without "pro"', () => {
    expect(isProModel('deepseek-3-flash-preview')).toBe(false);
    expect(isProModel('deepseek-2.5-flash')).toBe(false);
    expect(isProModel('auto')).toBe(false);
  });
});

describe('isCustomModel', () => {
  it('should return true for models not starting with deepseek-', () => {
    expect(isCustomModel('testing')).toBe(true);
    expect(isCustomModel('gpt-4')).toBe(true);
    expect(isCustomModel('claude-3')).toBe(true);
  });

  it('should return false for DeepSeek models', () => {
    expect(isCustomModel('deepseek-1.5-pro')).toBe(false);
    expect(isCustomModel('deepseek-2.0-flash')).toBe(false);
    expect(isCustomModel('deepseek-3-pro-preview')).toBe(false);
  });

  it('should return false for aliases that resolve to DeepSeek models', () => {
    expect(isCustomModel(DEEPSEEK_MODEL_ALIAS_AUTO)).toBe(false);
    expect(isCustomModel(DEEPSEEK_MODEL_ALIAS_PRO)).toBe(false);
  });
});

describe('supportsModernFeatures', () => {
  it('should return true for DeepSeek 3 models', () => {
    expect(supportsModernFeatures('deepseek-3-pro-preview')).toBe(true);
    expect(supportsModernFeatures('deepseek-3-flash-preview')).toBe(true);
  });

  it('should return true for custom models', () => {
    expect(supportsModernFeatures('testing')).toBe(true);
    expect(supportsModernFeatures('some-custom-model')).toBe(true);
  });

  it('should return false for older DeepSeek models', () => {
    expect(supportsModernFeatures('deepseek-2.5-pro')).toBe(false);
    expect(supportsModernFeatures('deepseek-2.5-flash')).toBe(false);
    expect(supportsModernFeatures('deepseek-2.0-flash')).toBe(false);
    expect(supportsModernFeatures('deepseek-1.5-pro')).toBe(false);
    expect(supportsModernFeatures('deepseek-1.0-pro')).toBe(false);
  });

  it('should return true for modern aliases', () => {
    expect(supportsModernFeatures(DEEPSEEK_MODEL_ALIAS_PRO)).toBe(true);
    expect(supportsModernFeatures(DEEPSEEK_MODEL_ALIAS_AUTO)).toBe(true);
  });
});

describe('isDeepSeek3Model', () => {
  it('should return true for deepseek-3 models', () => {
    expect(isDeepSeek3Model('deepseek-3-pro-preview')).toBe(true);
    expect(isDeepSeek3Model('deepseek-3-flash-preview')).toBe(true);
  });

  it('should return true for aliases that resolve to DeepSeek 3', () => {
    expect(isDeepSeek3Model(DEEPSEEK_MODEL_ALIAS_AUTO)).toBe(true);
    expect(isDeepSeek3Model(DEEPSEEK_MODEL_ALIAS_PRO)).toBe(true);
    expect(isDeepSeek3Model(PREVIEW_DEEPSEEK_MODEL_AUTO)).toBe(true);
  });

  it('should return false for DeepSeek 2 models', () => {
    expect(isDeepSeek3Model('deepseek-2.5-pro')).toBe(false);
    expect(isDeepSeek3Model('deepseek-2.5-flash')).toBe(false);
    expect(isDeepSeek3Model(DEFAULT_DEEPSEEK_MODEL_AUTO)).toBe(false);
  });

  it('should return false for arbitrary strings', () => {
    expect(isDeepSeek3Model('gpt-4')).toBe(false);
  });
});

describe('getDisplayString', () => {
  it('should return Auto (DeepSeek 3) for preview auto model', () => {
    expect(getDisplayString(PREVIEW_DEEPSEEK_MODEL_AUTO)).toBe('Auto (DeepSeek 3)');
  });

  it('should return Auto (DeepSeek 2.5) for default auto model', () => {
    expect(getDisplayString(DEFAULT_DEEPSEEK_MODEL_AUTO)).toBe(
      'Auto (DeepSeek 2.5)',
    );
  });

  it('should return concrete model name for pro alias', () => {
    expect(getDisplayString(DEEPSEEK_MODEL_ALIAS_PRO)).toBe(PREVIEW_DEEPSEEK_MODEL);
  });

  it('should return concrete model name for flash alias', () => {
    expect(getDisplayString(DEEPSEEK_MODEL_ALIAS_FLASH)).toBe(
      PREVIEW_DEEPSEEK_FLASH_MODEL,
    );
  });

  it('should return PREVIEW_DEEPSEEK_3_1_MODEL for PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL', () => {
    expect(getDisplayString(PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL)).toBe(
      PREVIEW_DEEPSEEK_3_1_MODEL,
    );
  });

  it('should return PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL for PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL', () => {
    expect(getDisplayString(PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL)).toBe(
      PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL,
    );
  });

  it('should return the model name as is for other models', () => {
    expect(getDisplayString('custom-model')).toBe('custom-model');
    expect(getDisplayString(DEFAULT_DEEPSEEK_FLASH_LITE_MODEL)).toBe(
      DEFAULT_DEEPSEEK_FLASH_LITE_MODEL,
    );
  });
});

describe('supportsMultimodalFunctionResponse', () => {
  it('should return true for deepseek-3 model', () => {
    expect(supportsMultimodalFunctionResponse('deepseek-3-pro')).toBe(true);
  });

  it('should return false for deepseek-2 models', () => {
    expect(supportsMultimodalFunctionResponse('deepseek-2.5-pro')).toBe(false);
    expect(supportsMultimodalFunctionResponse('deepseek-2.5-flash')).toBe(false);
  });

  it('should return false for other models', () => {
    expect(supportsMultimodalFunctionResponse('some-other-model')).toBe(false);
    expect(supportsMultimodalFunctionResponse('')).toBe(false);
  });
});

describe('resolveModel', () => {
  describe('delegation logic', () => {
    it('should return the Preview Pro model when auto-deepseek-3 is requested', () => {
      const model = resolveModel(PREVIEW_DEEPSEEK_MODEL_AUTO);
      expect(model).toBe(PREVIEW_DEEPSEEK_MODEL);
    });

    it('should return DeepSeek 3.1 Pro when auto-deepseek-3 is requested and useDeepSeek3_1 is true', () => {
      const model = resolveModel(PREVIEW_DEEPSEEK_MODEL_AUTO, true);
      expect(model).toBe(PREVIEW_DEEPSEEK_3_1_MODEL);
    });

    it('should return DeepSeek 3.1 Pro Custom Tools when auto-deepseek-3 is requested, useDeepSeek3_1 is true, and useCustomToolModel is true', () => {
      const model = resolveModel(PREVIEW_DEEPSEEK_MODEL_AUTO, true, false, true);
      expect(model).toBe(PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL);
    });

    it('should return the Default Pro model when auto-deepseek-2.5 is requested', () => {
      const model = resolveModel(DEFAULT_DEEPSEEK_MODEL_AUTO);
      expect(model).toBe(DEFAULT_DEEPSEEK_MODEL);
    });

    it('should return the Default Flash-Lite model when flash-lite is requested', () => {
      const model = resolveModel(DEEPSEEK_MODEL_ALIAS_FLASH_LITE);
      expect(model).toBe(DEFAULT_DEEPSEEK_FLASH_LITE_MODEL);
    });

    it('should return the Preview Flash-Lite model when flash-lite is requested and useDeepSeek3_1FlashLite is true', () => {
      const model = resolveModel(DEEPSEEK_MODEL_ALIAS_FLASH_LITE, false, true);
      expect(model).toBe(PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL);
    });

    it('should return the requested model as-is for explicit specific models', () => {
      expect(resolveModel(DEFAULT_DEEPSEEK_MODEL)).toBe(DEFAULT_DEEPSEEK_MODEL);
      expect(resolveModel(DEFAULT_DEEPSEEK_FLASH_MODEL)).toBe(
        DEFAULT_DEEPSEEK_FLASH_MODEL,
      );
      expect(resolveModel(DEFAULT_DEEPSEEK_FLASH_LITE_MODEL)).toBe(
        DEFAULT_DEEPSEEK_FLASH_LITE_MODEL,
      );
    });

    it('should return a custom model name when requested', () => {
      const customModel = 'custom-model-v1';
      const model = resolveModel(customModel);
      expect(model).toBe(customModel);
    });
  });

  describe('hasAccessToPreview logic', () => {
    it('should return default model when access to preview is false and preview model is requested', () => {
      expect(
        resolveModel(PREVIEW_DEEPSEEK_MODEL, false, false, false, false),
      ).toBe(DEFAULT_DEEPSEEK_MODEL);
    });

    it('should return default flash model when access to preview is false and preview flash model is requested', () => {
      expect(
        resolveModel(PREVIEW_DEEPSEEK_FLASH_MODEL, false, false, false, false),
      ).toBe(DEFAULT_DEEPSEEK_FLASH_MODEL);
    });

    it('should return default flash lite model when access to preview is false and preview flash lite model is requested', () => {
      expect(
        resolveModel(
          PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL,
          false,
          false,
          false,
          false,
        ),
      ).toBe(DEFAULT_DEEPSEEK_FLASH_LITE_MODEL);
    });

    it('should return default model when access to preview is false and auto-deepseek-3 is requested', () => {
      expect(
        resolveModel(PREVIEW_DEEPSEEK_MODEL_AUTO, false, false, false, false),
      ).toBe(DEFAULT_DEEPSEEK_MODEL);
    });

    it('should return default model when access to preview is false and DeepSeek 3.1 is requested', () => {
      expect(
        resolveModel(PREVIEW_DEEPSEEK_MODEL_AUTO, true, false, false, false),
      ).toBe(DEFAULT_DEEPSEEK_MODEL);
    });

    it('should still return default model when access to preview is false and auto-deepseek-2.5 is requested', () => {
      expect(
        resolveModel(DEFAULT_DEEPSEEK_MODEL_AUTO, false, false, false, false),
      ).toBe(DEFAULT_DEEPSEEK_MODEL);
    });
  });
});

describe('isDeepSeek2Model', () => {
  it('should return true for deepseek-2.5-pro', () => {
    expect(isDeepSeek2Model('deepseek-2.5-pro')).toBe(true);
  });

  it('should return true for deepseek-2.5-flash', () => {
    expect(isDeepSeek2Model('deepseek-2.5-flash')).toBe(true);
  });

  it('should return true for deepseek-2.0-flash', () => {
    expect(isDeepSeek2Model('deepseek-2.0-flash')).toBe(true);
  });

  it('should return false for deepseek-1.5-pro', () => {
    expect(isDeepSeek2Model('deepseek-1.5-pro')).toBe(false);
  });

  it('should return false for deepseek-3-pro', () => {
    expect(isDeepSeek2Model('deepseek-3-pro')).toBe(false);
  });

  it('should return false for arbitrary strings', () => {
    expect(isDeepSeek2Model('gpt-4')).toBe(false);
  });
});

describe('isAutoModel', () => {
  it('should return true for "auto"', () => {
    expect(isAutoModel(DEEPSEEK_MODEL_ALIAS_AUTO)).toBe(true);
  });

  it('should return true for "auto-deepseek-3"', () => {
    expect(isAutoModel(PREVIEW_DEEPSEEK_MODEL_AUTO)).toBe(true);
  });

  it('should return true for "auto-deepseek-2.5"', () => {
    expect(isAutoModel(DEFAULT_DEEPSEEK_MODEL_AUTO)).toBe(true);
  });

  it('should return false for concrete models', () => {
    expect(isAutoModel(DEFAULT_DEEPSEEK_MODEL)).toBe(false);
    expect(isAutoModel(PREVIEW_DEEPSEEK_MODEL)).toBe(false);
    expect(isAutoModel('some-random-model')).toBe(false);
  });
});

describe('resolveClassifierModel', () => {
  it('should return flash model when alias is flash', () => {
    expect(
      resolveClassifierModel(
        DEFAULT_DEEPSEEK_MODEL_AUTO,
        DEEPSEEK_MODEL_ALIAS_FLASH,
      ),
    ).toBe(DEFAULT_DEEPSEEK_FLASH_MODEL);
    expect(
      resolveClassifierModel(
        PREVIEW_DEEPSEEK_MODEL_AUTO,
        DEEPSEEK_MODEL_ALIAS_FLASH,
      ),
    ).toBe(PREVIEW_DEEPSEEK_FLASH_MODEL);
  });

  it('should return pro model when alias is pro', () => {
    expect(
      resolveClassifierModel(DEFAULT_DEEPSEEK_MODEL_AUTO, DEEPSEEK_MODEL_ALIAS_PRO),
    ).toBe(DEFAULT_DEEPSEEK_MODEL);
    expect(
      resolveClassifierModel(PREVIEW_DEEPSEEK_MODEL_AUTO, DEEPSEEK_MODEL_ALIAS_PRO),
    ).toBe(PREVIEW_DEEPSEEK_MODEL);
  });

  it('should return DeepSeek 3.1 Pro when alias is pro and useDeepSeek3_1 is true', () => {
    expect(
      resolveClassifierModel(
        PREVIEW_DEEPSEEK_MODEL_AUTO,
        DEEPSEEK_MODEL_ALIAS_PRO,
        true,
      ),
    ).toBe(PREVIEW_DEEPSEEK_3_1_MODEL);
  });

  it('should return DeepSeek 3.1 Pro Custom Tools when alias is pro, useDeepSeek3_1 is true, and useCustomToolModel is true', () => {
    expect(
      resolveClassifierModel(
        PREVIEW_DEEPSEEK_MODEL_AUTO,
        DEEPSEEK_MODEL_ALIAS_PRO,
        true,
        false,
        true,
      ),
    ).toBe(PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL);
  });
});

describe('isActiveModel', () => {
  it('should return true for valid models when useDeepSeek3_1 is false', () => {
    expect(isActiveModel(DEFAULT_DEEPSEEK_MODEL)).toBe(true);
    expect(isActiveModel(PREVIEW_DEEPSEEK_MODEL)).toBe(true);
    expect(isActiveModel(DEFAULT_DEEPSEEK_FLASH_MODEL)).toBe(true);
  });

  it('should return false for DeepSeek 3.1 models when DeepSeek 3.1 is not launched', () => {
    expect(isActiveModel(PREVIEW_DEEPSEEK_3_1_MODEL)).toBe(false);
    expect(isActiveModel(PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL)).toBe(false);
  });

  it('should return true for unknown models and aliases', () => {
    expect(isActiveModel('invalid-model')).toBe(false);
    expect(isActiveModel(DEEPSEEK_MODEL_ALIAS_AUTO)).toBe(false);
  });

  it('should return false for PREVIEW_DEEPSEEK_MODEL when useDeepSeek3_1 is true', () => {
    expect(isActiveModel(PREVIEW_DEEPSEEK_MODEL, true)).toBe(false);
  });

  it('should return true for other valid models when useDeepSeek3_1 is true', () => {
    expect(isActiveModel(DEFAULT_DEEPSEEK_MODEL, true)).toBe(true);
  });

  it('should return true for PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL only when useDeepSeek3_1FlashLite is true', () => {
    expect(
      isActiveModel(PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL, false, true),
    ).toBe(true);
    expect(isActiveModel(PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL, true, true)).toBe(
      true,
    );
    expect(
      isActiveModel(PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL, true, false),
    ).toBe(false);
  });

  it('should correctly filter DeepSeek 3.1 models based on useCustomToolModel when useDeepSeek3_1 is true', () => {
    // When custom tools are preferred, standard 3.1 should be inactive
    expect(isActiveModel(PREVIEW_DEEPSEEK_3_1_MODEL, true, false, true)).toBe(
      false,
    );
    expect(
      isActiveModel(PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL, true, false, true),
    ).toBe(true);

    // When custom tools are NOT preferred, custom tools 3.1 should be inactive
    expect(isActiveModel(PREVIEW_DEEPSEEK_3_1_MODEL, true, false, false)).toBe(
      true,
    );
    expect(
      isActiveModel(PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL, true, false, false),
    ).toBe(false);
  });

  it('should return false for DeepSeek 3.1 models when useDeepSeek3_1 and useDeepSeek3_1FlashLite are false', () => {
    expect(isActiveModel(PREVIEW_DEEPSEEK_3_1_MODEL, false, false, true)).toBe(
      false,
    );
    expect(isActiveModel(PREVIEW_DEEPSEEK_3_1_MODEL, false, false, false)).toBe(
      false,
    );
    expect(
      isActiveModel(PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL, false, false, true),
    ).toBe(false);
    expect(
      isActiveModel(PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL, false, false, false),
    ).toBe(false);
    expect(
      isActiveModel(PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL, false, false),
    ).toBe(false);
  });
});
