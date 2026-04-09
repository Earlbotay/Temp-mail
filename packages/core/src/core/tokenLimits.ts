/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DEFAULT_DEEPSEEK_FLASH_LITE_MODEL,
  DEFAULT_DEEPSEEK_FLASH_MODEL,
  DEFAULT_DEEPSEEK_MODEL,
  PREVIEW_DEEPSEEK_FLASH_MODEL,
  PREVIEW_DEEPSEEK_MODEL,
} from '../config/models.js';

type Model = string;
type TokenCount = number;

export const DEFAULT_TOKEN_LIMIT = 1_048_576;

export function tokenLimit(model: Model): TokenCount {
  // Add other models as they become relevant or if specified by config
  // Pulled from https://ai.google.dev/deepseek-api/docs/models
  switch (model) {
    case PREVIEW_DEEPSEEK_MODEL:
    case PREVIEW_DEEPSEEK_FLASH_MODEL:
    case DEFAULT_DEEPSEEK_MODEL:
    case DEFAULT_DEEPSEEK_FLASH_MODEL:
    case DEFAULT_DEEPSEEK_FLASH_LITE_MODEL:
      return 1_048_576;
    default:
      return DEFAULT_TOKEN_LIMIT;
  }
}
