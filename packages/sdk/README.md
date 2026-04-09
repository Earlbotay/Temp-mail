# @google/deepseek-cli-sdk

The DeepSeek CLI SDK provides a programmatic interface to interact with DeepSeek
models and tools.

## Installation

```bash
npm install @google/deepseek-cli-sdk
```

## Usage

```typescript
import { DeepSeekCliAgent } from '@google/deepseek-cli-sdk';

async function main() {
  const agent = new DeepSeekCliAgent({
    instructions: 'You are a helpful assistant.',
  });

  const controller = new AbortController();
  const signal = controller.signal;

  // Stream responses from the agent
  const stream = agent.sendStream('Why is the sky blue?', signal);

  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      process.stdout.write(chunk.value.text || '');
    }
  }
}

main().catch(console.error);
```
