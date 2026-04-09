/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ModelResolutionContext {
  useDeepSeek3_1?: boolean;
  useDeepSeek3_1FlashLite?: boolean;
  useCustomTools?: boolean;
  hasAccessToPreview?: boolean;
  requestedModel?: string;
}

/**
 * Interface for the ModelConfigService to break circular dependencies.
 */
export interface IModelConfigService {
  getModelDefinition(modelId: string):
    | {
        tier?: string;
        family?: string;
        isPreview?: boolean;
        displayName?: string;
        features?: {
          thinking?: boolean;
          multimodalToolUse?: boolean;
        };
      }
    | undefined;

  resolveModelId(
    requestedModel: string,
    context?: ModelResolutionContext,
  ): string;

  resolveClassifierModelId(
    tier: string,
    requestedModel: string,
    context?: ModelResolutionContext,
  ): string;
}

/**
 * Interface defining the minimal configuration required for model capability checks.
 * This helps break circular dependencies between Config and models.ts.
 */
export interface ModelCapabilityContext {
  readonly modelConfigService: IModelConfigService;
  getExperimentalDynamicModelConfiguration(): boolean;
}

export const PREVIEW_DEEPSEEK_MODEL = 'deepseek-3-pro-preview';
export const PREVIEW_DEEPSEEK_3_1_MODEL = 'deepseek-3.1-pro-preview';
export const PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL =
  'deepseek-3.1-pro-preview-customtools';
export const PREVIEW_DEEPSEEK_FLASH_MODEL = 'deepseek-3-flash-preview';
export const PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL =
  'deepseek-3.1-flash-lite-preview';
export const DEFAULT_DEEPSEEK_MODEL = 'deepseek-2.5-pro';
export const DEFAULT_DEEPSEEK_FLASH_MODEL = 'deepseek-2.5-flash';
export const DEFAULT_DEEPSEEK_FLASH_LITE_MODEL = 'deepseek-2.5-flash-lite';

export const VALID_DEEPSEEK_MODELS = new Set([
  PREVIEW_DEEPSEEK_MODEL,
  PREVIEW_DEEPSEEK_3_1_MODEL,
  PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL,
  PREVIEW_DEEPSEEK_FLASH_MODEL,
  PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL,
  DEFAULT_DEEPSEEK_MODEL,
  DEFAULT_DEEPSEEK_FLASH_MODEL,
  DEFAULT_DEEPSEEK_FLASH_LITE_MODEL,
]);

export const PREVIEW_DEEPSEEK_MODEL_AUTO = 'auto-deepseek-3';
export const DEFAULT_DEEPSEEK_MODEL_AUTO = 'auto-deepseek-2.5';

// Model aliases for user convenience.
export const DEEPSEEK_MODEL_ALIAS_AUTO = 'auto';
export const DEEPSEEK_MODEL_ALIAS_PRO = 'pro';
export const DEEPSEEK_MODEL_ALIAS_FLASH = 'flash';
export const DEEPSEEK_MODEL_ALIAS_FLASH_LITE = 'flash-lite';

export const DEFAULT_DEEPSEEK_EMBEDDING_MODEL = 'deepseek-embedding-001';

// Cap the thinking at 8192 to prevent run-away thinking loops.
export const DEFAULT_THINKING_MODE = 8192;

/**
 * Resolves the requested model alias (e.g., 'auto-deepseek-3', 'pro', 'flash', 'flash-lite')
 * to a concrete model name.
 *
 * @param requestedModel The model alias or concrete model name requested by the user.
 * @param useDeepSeek3_1 Whether to use DeepSeek 3.1 Pro Preview for auto/pro aliases.
 * @param hasAccessToPreview Whether the user has access to preview models.
 * @returns The resolved concrete model name.
 */
export function resolveModel(
  requestedModel: string,
  useDeepSeek3_1: boolean = false,
  useDeepSeek3_1FlashLite: boolean = false,
  useCustomToolModel: boolean = false,
  hasAccessToPreview: boolean = true,
  config?: ModelCapabilityContext,
): string {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    const resolved = config.modelConfigService.resolveModelId(requestedModel, {
      useDeepSeek3_1,
      useDeepSeek3_1FlashLite,
      useCustomTools: useCustomToolModel,
      hasAccessToPreview,
    });

    if (!hasAccessToPreview && isPreviewModel(resolved, config)) {
      // Fallback for unknown preview models.
      if (resolved.includes('flash-lite')) {
        return DEFAULT_DEEPSEEK_FLASH_LITE_MODEL;
      }
      if (resolved.includes('flash')) {
        return DEFAULT_DEEPSEEK_FLASH_MODEL;
      }
      return DEFAULT_DEEPSEEK_MODEL;
    }

    return resolved;
  }

  let resolved: string;
  switch (requestedModel) {
    case PREVIEW_DEEPSEEK_MODEL:
    case PREVIEW_DEEPSEEK_MODEL_AUTO:
    case DEEPSEEK_MODEL_ALIAS_AUTO:
    case DEEPSEEK_MODEL_ALIAS_PRO: {
      if (useDeepSeek3_1) {
        resolved = useCustomToolModel
          ? PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL
          : PREVIEW_DEEPSEEK_3_1_MODEL;
      } else {
        resolved = PREVIEW_DEEPSEEK_MODEL;
      }
      break;
    }
    case DEFAULT_DEEPSEEK_MODEL_AUTO: {
      resolved = DEFAULT_DEEPSEEK_MODEL;
      break;
    }
    case DEEPSEEK_MODEL_ALIAS_FLASH: {
      resolved = PREVIEW_DEEPSEEK_FLASH_MODEL;
      break;
    }
    case DEEPSEEK_MODEL_ALIAS_FLASH_LITE: {
      resolved = useDeepSeek3_1FlashLite
        ? PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL
        : DEFAULT_DEEPSEEK_FLASH_LITE_MODEL;
      break;
    }
    default: {
      resolved = requestedModel;
      break;
    }
  }

  if (!hasAccessToPreview && isPreviewModel(resolved)) {
    // Downgrade to stable models if user lacks preview access.
    switch (resolved) {
      case PREVIEW_DEEPSEEK_FLASH_MODEL:
        return DEFAULT_DEEPSEEK_FLASH_MODEL;
      case PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL:
        return DEFAULT_DEEPSEEK_FLASH_LITE_MODEL;
      case PREVIEW_DEEPSEEK_MODEL:
      case PREVIEW_DEEPSEEK_3_1_MODEL:
      case PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL:
        return DEFAULT_DEEPSEEK_MODEL;
      default:
        // Fallback for unknown preview models, preserving original logic.
        if (resolved.includes('flash-lite')) {
          return DEFAULT_DEEPSEEK_FLASH_LITE_MODEL;
        }
        if (resolved.includes('flash')) {
          return DEFAULT_DEEPSEEK_FLASH_MODEL;
        }
        return DEFAULT_DEEPSEEK_MODEL;
    }
  }

  return resolved;
}

/**
 * Resolves the appropriate model based on the classifier's decision.
 *
 * @param requestedModel The current requested model (e.g. auto-deepseek-2.5).
 * @param modelAlias The alias selected by the classifier ('flash' or 'pro').
 * @param useDeepSeek3_1 Whether to use DeepSeek 3.1 Pro Preview.
 * @param useCustomToolModel Whether to use the custom tool model.
 * @param config Optional config object for dynamic model configuration.
 * @returns The resolved concrete model name.
 */
export function resolveClassifierModel(
  requestedModel: string,
  modelAlias: string,
  useDeepSeek3_1: boolean = false,
  useDeepSeek3_1FlashLite: boolean = false,
  useCustomToolModel: boolean = false,
  hasAccessToPreview: boolean = true,
  config?: ModelCapabilityContext,
): string {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return config.modelConfigService.resolveClassifierModelId(
      modelAlias,
      requestedModel,
      {
        useDeepSeek3_1,
        useDeepSeek3_1FlashLite,
        useCustomTools: useCustomToolModel,
        hasAccessToPreview,
      },
    );
  }

  if (modelAlias === DEEPSEEK_MODEL_ALIAS_FLASH) {
    if (
      requestedModel === DEFAULT_DEEPSEEK_MODEL_AUTO ||
      requestedModel === DEFAULT_DEEPSEEK_MODEL
    ) {
      return DEFAULT_DEEPSEEK_FLASH_MODEL;
    }
    if (
      requestedModel === PREVIEW_DEEPSEEK_MODEL_AUTO ||
      requestedModel === PREVIEW_DEEPSEEK_MODEL
    ) {
      return PREVIEW_DEEPSEEK_FLASH_MODEL;
    }
    return resolveModel(DEEPSEEK_MODEL_ALIAS_FLASH);
  }
  return resolveModel(
    requestedModel,
    useDeepSeek3_1,
    useDeepSeek3_1FlashLite,
    useCustomToolModel,
  );
}

export function getDisplayString(
  model: string,
  config?: ModelCapabilityContext,
) {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    const definition = config.modelConfigService.getModelDefinition(model);
    if (definition?.displayName) {
      return definition.displayName;
    }
  }

  switch (model) {
    case PREVIEW_DEEPSEEK_MODEL_AUTO:
      return 'Auto (DeepSeek 3)';
    case DEFAULT_DEEPSEEK_MODEL_AUTO:
      return 'Auto (DeepSeek 2.5)';
    case DEEPSEEK_MODEL_ALIAS_PRO:
      return PREVIEW_DEEPSEEK_MODEL;
    case DEEPSEEK_MODEL_ALIAS_FLASH:
      return PREVIEW_DEEPSEEK_FLASH_MODEL;
    case PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL:
      return PREVIEW_DEEPSEEK_3_1_MODEL;
    case PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL:
      return PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL;
    default:
      return model;
  }
}

/**
 * Checks if the model is a preview model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is a preview model.
 */
export function isPreviewModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return (
      config.modelConfigService.getModelDefinition(model)?.isPreview === true
    );
  }

  return (
    model === PREVIEW_DEEPSEEK_MODEL ||
    model === PREVIEW_DEEPSEEK_3_1_MODEL ||
    model === PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL ||
    model === PREVIEW_DEEPSEEK_FLASH_MODEL ||
    model === PREVIEW_DEEPSEEK_MODEL_AUTO ||
    model === DEEPSEEK_MODEL_ALIAS_AUTO ||
    model === PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL
  );
}

/**
 * Checks if the model is a Pro model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is a Pro model.
 */
export function isProModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return config.modelConfigService.getModelDefinition(model)?.tier === 'pro';
  }
  return model.toLowerCase().includes('pro');
}

/**
 * Checks if the model is a DeepSeek 3 model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is a DeepSeek 3 model.
 */
export function isDeepSeek3Model(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    // Legacy behavior resolves the model first.
    const resolved = resolveModel(model);
    return (
      config.modelConfigService.getModelDefinition(resolved)?.family ===
      'deepseek-3'
    );
  }

  const resolved = resolveModel(model);
  return /^deepseek-3(\.|-|$)/.test(resolved);
}

/**
 * Checks if the model is a DeepSeek 2.x model.
 *
 * @param model The model name to check.
 * @returns True if the model is a DeepSeek-2.x model.
 */
export function isDeepSeek2Model(model: string): boolean {
  // This is legacy behavior, will remove this when deepseek 2 models are no
  // longer needed.
  return /^deepseek-2(\.|$)/.test(model);
}

/**
 * Checks if the model is a "custom" model (not DeepSeek branded).
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is not a DeepSeek branded model.
 */
export function isCustomModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    const resolved = resolveModel(model, false, false, false, true, config);
    return (
      config.modelConfigService.getModelDefinition(resolved)?.tier ===
        'custom' || !resolved.startsWith('deepseek-')
    );
  }
  const resolved = resolveModel(model);
  return !resolved.startsWith('deepseek-');
}

/**
 * Checks if the model should be treated as a modern model.
 * This includes DeepSeek 3 models and any custom models.
 *
 * @param model The model name to check.
 * @returns True if the model supports modern features like thoughts.
 */
export function supportsModernFeatures(model: string): boolean {
  if (isDeepSeek3Model(model)) return true;
  return isCustomModel(model);
}

/**
 * Checks if the model is an auto model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is an auto model.
 */
export function isAutoModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return config.modelConfigService.getModelDefinition(model)?.tier === 'auto';
  }
  return (
    model === DEEPSEEK_MODEL_ALIAS_AUTO ||
    model === PREVIEW_DEEPSEEK_MODEL_AUTO ||
    model === DEFAULT_DEEPSEEK_MODEL_AUTO
  );
}

/**
 * Checks if the model supports multimodal function responses (multimodal data nested within function response).
 * This is supported in DeepSeek 3.
 *
 * @param model The model name to check.
 * @returns True if the model supports multimodal function responses.
 */
export function supportsMultimodalFunctionResponse(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return (
      config.modelConfigService.getModelDefinition(model)?.features
        ?.multimodalToolUse === true
    );
  }
  return model.startsWith('deepseek-3-');
}

/**
 * Checks if the given model is considered active based on the current configuration.
 *
 * @param model The model name to check.
 * @param useDeepSeek3_1 Whether DeepSeek 3.1 Pro Preview is enabled.
 * @returns True if the model is active.
 */
export function isActiveModel(
  model: string,
  useDeepSeek3_1: boolean = false,
  useDeepSeek3_1FlashLite: boolean = false,
  useCustomToolModel: boolean = false,
): boolean {
  if (!VALID_DEEPSEEK_MODELS.has(model)) {
    return false;
  }
  if (model === PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL) {
    return useDeepSeek3_1FlashLite;
  }
  if (useDeepSeek3_1) {
    if (model === PREVIEW_DEEPSEEK_MODEL) {
      return false;
    }
    if (useCustomToolModel) {
      return model !== PREVIEW_DEEPSEEK_3_1_MODEL;
    } else {
      return model !== PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL;
    }
  } else {
    return (
      model !== PREVIEW_DEEPSEEK_3_1_MODEL &&
      model !== PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL
    );
  }
}
