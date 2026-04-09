const fs = require('fs');
const path = '/storage/emulated/0/deepseek-cli/packages/core/src/core/contentGenerator.ts';
let content = fs.readFileSync(path, 'utf8');

const replacement = `      if (config.apiKey?.startsWith('sk-') || config.baseUrl?.includes('deepseek') || process.env['DEEPSEEK_API_KEY']) {
        const deepseekBaseUrl = config.baseUrl || 'https://api.deepseek.com';
        const deepseekGenerator = new DeepSeekContentGenerator({
          apiKey: config.apiKey || process.env['DEEPSEEK_API_KEY'] || '',
          baseUrl: deepseekBaseUrl,
          headers,
        });
        return new LoggingContentGenerator(deepseekGenerator, gcConfig);
      }

      const googleGenAI = new GoogleGenAI({`;

content = content.replace('      const googleGenAI = new GoogleGenAI({', replacement);

fs.writeFileSync(path, content);
