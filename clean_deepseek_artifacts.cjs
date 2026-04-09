const fs = require('fs');
const path = '/storage/emulated/0/deepseek-cli/packages/core/src/core/contentGenerator.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Mudahkan AuthType - hanya simpan yang berkaitan API Key
content = content.replace(/export enum AuthType \{[\s\S]*?\}/, `export enum AuthType {
  USE_API_KEY = 'api-key',
}`);

// 2. Mudahkan getAuthTypeFromEnv - hanya cari API Key
content = content.replace(/export function getAuthTypeFromEnv\(\): AuthType \| undefined \{[\s\S]*?\}/, `export function getAuthTypeFromEnv(): AuthType | undefined {
  if (process.env['DEEPSEEK_API_KEY'] || process.env['DEEPSEEK_API_KEY']) {
    return AuthType.USE_API_KEY;
  }
  return AuthType.USE_API_KEY; // Default to API_KEY to force it
}`);

// 3. Mudahkan createContentGeneratorConfig
content = content.replace(/export async function createContentGeneratorConfig\([\s\S]*?\}\n\n  return contentGeneratorConfig;\n\}/, `export async function createContentGeneratorConfig(
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
}`);

// 4. Mudahkan createContentGenerator - paksa DeepSeek
content = content.replace(/export async function createContentGenerator\([\s\S]*?throw new Error\([\s\S]*?\);[\s\S]*?\}\)\(\);/, `export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  const generator = await (async () => {
    const version = await getVersion();
    const surface = determineSurface();
    const userAgent = \`DeepSeekCLI/\${version} (\${process.platform}; \${process.arch}; \${surface})\`;
    
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
  })();`);

fs.writeFileSync(path, content);
