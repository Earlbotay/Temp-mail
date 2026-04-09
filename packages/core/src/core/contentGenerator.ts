/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GoogleGenAI,
  type CountTokensResponse,
  type GenerateContentResponse,
  type GenerateContentParameters,
  type CountTokensParameters,
  type EmbedContentResponse,
  type EmbedContentParameters,
} from '@google/genai';
import * as os from 'node:os';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import { isCloudShell } from '../ide/detect-ide.js';
import type { Config } from '../config/config.js';
import { loadApiKey } from './apiKeyCredentialStorage.js';
import { DeepSeekContentGenerator } from './deepseekContentGenerator.js';

import type { UserTierId, DeepSeekUserTier } from '../code_assist/types.js';
import { LoggingContentGenerator } from './loggingContentGenerator.js';
import { InstallationManager } from '../utils/installationManager.js';
import { FakeContentGenerator } from './fakeContentGenerator.js';
import { parseCustomHeaders } from '../utils/customHeaderUtils.js';
import { determineSurface } from '../utils/surface.js';
import { RecordingContentGenerator } from './recordingContentGenerator.js';
import { getVersion, resolveModel } from '../../index.js';
import type { LlmRole } from '../telemetry/llmRole.js';

/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
    role: LlmRole,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
    role: LlmRole,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  userTier?: UserTierId;

  userTierName?: string;

  paidTier?: DeepSeekUserTier;
}

export enum AuthType {
  USE_API_KEY = 'api-key',
}

/**
 * Detects the best authentication type based on environment variables.
 *
 * Checks in order:
 * 1. GOOGLE_GENAI_USE_GCA=true -> LOGIN_WITH_GOOGLE
 * 2. GOOGLE_GENAI_USE_VERTEXAI=true -> USE_VERTEX_AI
 * 3. DEEPSEEK_API_KEY -> USE_DEEPSEEK
 */
export function getAuthTypeFromEnv(): AuthType | undefined {
  if (process.env['DEEPSEEK_API_KEY'] || process.env['DEEPSEEK_API_KEY']) {
    return AuthType.USE_API_KEY;
  }
  return AuthType.USE_API_KEY; // Default to API_KEY to force it
}
  if (process.env['GOOGLE_GENAI_USE_VERTEXAI'] === 'true') {
    return AuthType.USE_VERTEX_AI;
  }
  if (process.env['DEEPSEEK_API_KEY'] || process.env['DEEPSEEK_API_KEY']) {
    return AuthType.USE_DEEPSEEK;
  }
  if (
    process.env['CLOUD_SHELL'] === 'true' ||
    process.env['DEEPSEEK_CLI_USE_COMPUTE_ADC'] === 'true'
  ) {
    return AuthType.COMPUTE_ADC;
  }
  return undefined;
}

export type ContentGeneratorConfig = {
  apiKey?: string;
  vertexai?: boolean;
  authType?: AuthType;
  proxy?: string;
  baseUrl?: string;
  customHeaders?: Record<string, string>;
};

export async function createContentGeneratorConfig(
  config: Config,
  authType: AuthType | undefined,
  apiKey?: string,
  baseUrl?: string,
  customHeaders?: Record<string, string>,
): Promise<ContentGeneratorConfig> {
  const finalApiKey =
    apiKey ||
    process.env['DEEPSEEK_API_KEY'] || 
    process.env['DEEPSEEK_API_KEY'] ||
    (await loadApiKey()) ||
    undefined;

  return {
    authType: AuthType.USE_API_KEY,
    apiKey: finalApiKey,
    proxy: config?.getProxy(),
    baseUrl: baseUrl || 'https://api.deepseek.com',
    customHeaders,
  };
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  const generator = await (async () => {
    const version = await getVersion();
    const surface = determineSurface();
    const userAgent = `DeepSeekCLI/${version} (${process.platform}; ${process.arch}; ${surface})`;
    
    const headers = {
      'User-Agent': userAgent,
      ...config.customHeaders
    };

    return new LoggingContentGenerator(
      new DeepSeekContentGenerator({
        apiKey: config.apiKey || '',
        baseUrl: config.baseUrl || 'https://api.deepseek.com',
        headers,
      }),
      gcConfig
    );
  })();

  if (gcConfig.recordResponses) {
    return new RecordingContentGenerator(generator, gcConfig.recordResponses);
  }

  return generator;
}
