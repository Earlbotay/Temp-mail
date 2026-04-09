# DeepSeek CLI SDK (`@google/deepseek-cli-sdk`)

Programmatic SDK for embedding DeepSeek CLI agent capabilities into other
applications.

## Architecture

- `src/agent.ts`: Agent creation and management.
- `src/session.ts`: Session lifecycle and state management.
- `src/tool.ts`: Tool definition and execution interface.
- `src/skills.ts`: Skill integration.
- `src/fs.ts` & `src/shell.ts`: File system and shell utilities.
- `src/types.ts`: Public type definitions.

## Testing

- Run tests: `npm test -w @google/deepseek-cli-sdk`
- Integration tests use `*.integration.test.ts` naming convention.
