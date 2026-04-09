/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type CountTokensResponse,
  type GenerateContentResponse,
  type GenerateContentParameters,
  type CountTokensParameters,
  type EmbedContentResponse,
  type EmbedContentParameters,
  type Content,
} from '@google/genai';
import { request } from 'undici';
import type { ContentGenerator } from './contentGenerator.js';
import type { LlmRole } from '../telemetry/llmRole.js';

export class DeepSeekContentGenerator implements ContentGenerator {
  constructor(
    private readonly config: {
      apiKey: string;
      baseUrl: string;
      headers: Record<string, string>;
    },
  ) {}

  private mapContentToDeepSeek(contents: Content[]) {
    return contents.map((c) => {
      const role = c.role === 'model' ? 'assistant' : 'user';
      const content = c.parts.map((p) => ('text' in p ? p.text : '')).join('\n');
      return { role, content };
    });
  }

  async generateContent(
    params: GenerateContentParameters,
    _userPromptId: string,
    _role: LlmRole,
  ): Promise<GenerateContentResponse> {
    const messages = this.mapContentToDeepSeek(params.contents);
    const body = {
      model: params.model || 'deepseek-chat',
      messages,
      stream: false,
    };

    const { body: responseBody } = await request(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        ...this.config.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const result = (await responseBody.json()) as any;
    return {
      candidates: [
        {
          content: {
            role: 'model',
            parts: [{ text: result.choices[0].message.content }],
          },
          finishReason: 'STOP',
        },
      ],
      usageMetadata: {
        promptTokenCount: result.usage.prompt_tokens,
        candidatesTokenCount: result.usage.completion_tokens,
        totalTokenCount: result.usage.total_tokens,
      },
    } as GenerateContentResponse;
  }

  async *generateContentStream(
    params: GenerateContentParameters,
    _userPromptId: string,
    _role: LlmRole,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const messages = this.mapContentToDeepSeek(params.contents);
    const body = {
      model: params.model || 'deepseek-chat',
      messages,
      stream: true,
    };

    const { body: responseStream } = await request(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        ...this.config.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    for await (const chunk of responseStream) {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              yield {
                candidates: [
                  {
                    content: {
                      role: 'model',
                      parts: [{ text: data.choices[0].delta.content }],
                    },
                  },
                ],
              } as GenerateContentResponse;
            }
          } catch (e) {
             // Ignore malformed JSON
          }
        }
      }
    }
  }

  async countTokens(_params: CountTokensParameters): Promise<CountTokensResponse> {
    return { totalTokens: 0 };
  }

  async embedContent(_params: EmbedContentParameters): Promise<EmbedContentResponse> {
    throw new Error('Embeddings not supported for DeepSeek in this wrapper');
  }
}
