# DeepSeek CLI cheatsheet

This page provides a reference for commonly used DeepSeek CLI commands, options,
and parameters.

## CLI commands

| Command                            | Description                        | Example                                                      |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| `deepseek`                           | Start interactive REPL             | `deepseek`                                                     |
| `deepseek -p "query"`                | Query non-interactively            | `deepseek -p "summarize README.md"`                            |
| `deepseek "query"`                   | Query and continue interactively   | `deepseek "explain this project"`                              |
| `cat file \| deepseek`               | Process piped content              | `cat logs.txt \| deepseek`<br>`Get-Content logs.txt \| deepseek` |
| `deepseek -i "query"`                | Execute and continue interactively | `deepseek -i "What is the purpose of this project?"`           |
| `deepseek -r "latest"`               | Continue most recent session       | `deepseek -r "latest"`                                         |
| `deepseek -r "latest" "query"`       | Continue session with a new prompt | `deepseek -r "latest" "Check for type errors"`                 |
| `deepseek -r "<session-id>" "query"` | Resume session by ID               | `deepseek -r "abc123" "Finish this PR"`                        |
| `deepseek update`                    | Update to latest version           | `deepseek update`                                              |
| `deepseek extensions`                | Manage extensions                  | See [Extensions Management](#extensions-management)          |
| `deepseek mcp`                       | Configure MCP servers              | See [MCP Server Management](#mcp-server-management)          |

### Positional arguments

| Argument | Type              | Description                                                                                                |
| -------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `query`  | string (variadic) | Positional prompt. Defaults to interactive mode in a TTY. Use `-p/--prompt` for non-interactive execution. |

## Interactive commands

These commands are available within the interactive REPL.

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `/skills reload`     | Reload discovered skills from disk       |
| `/agents reload`     | Reload the agent registry                |
| `/commands reload`   | Reload custom slash commands             |
| `/memory reload`     | Reload context files (e.g., `Deepseek.md`) |
| `/mcp reload`        | Restart and reload MCP servers           |
| `/extensions reload` | Reload all active extensions             |
| `/help`              | Show help for all commands               |
| `/quit`              | Exit the interactive session             |

## CLI Options

| Option                           | Alias | Type    | Default   | Description                                                                                                                                                            |
| -------------------------------- | ----- | ------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--debug`                        | `-d`  | boolean | `false`   | Run in debug mode with verbose logging                                                                                                                                 |
| `--version`                      | `-v`  | -       | -         | Show CLI version number and exit                                                                                                                                       |
| `--help`                         | `-h`  | -       | -         | Show help information                                                                                                                                                  |
| `--model`                        | `-m`  | string  | `auto`    | Model to use. See [Model Selection](#model-selection) for available values.                                                                                            |
| `--prompt`                       | `-p`  | string  | -         | Prompt text. Appended to stdin input if provided. Forces non-interactive mode.                                                                                         |
| `--prompt-interactive`           | `-i`  | string  | -         | Execute prompt and continue in interactive mode                                                                                                                        |
| `--worktree`                     | `-w`  | string  | -         | Start DeepSeek in a new git worktree. If no name is provided, one is generated automatically. Requires `experimental.worktrees: true` in settings.                       |
| `--sandbox`                      | `-s`  | boolean | `false`   | Run in a sandboxed environment for safer execution                                                                                                                     |
| `--approval-mode`                | -     | string  | `default` | Approval mode for tool execution. Choices: `default`, `auto_edit`, `yolo`, `plan`                                                                                      |
| `--yolo`                         | `-y`  | boolean | `false`   | **Deprecated.** Auto-approve all actions. Use `--approval-mode=yolo` instead.                                                                                          |
| `--experimental-acp`             | -     | boolean | -         | Start in ACP (Agent Code Pilot) mode. **Experimental feature.**                                                                                                        |
| `--experimental-zed-integration` | -     | boolean | -         | Run in Zed editor integration mode. **Experimental feature.**                                                                                                          |
| `--allowed-mcp-server-names`     | -     | array   | -         | Allowed MCP server names (comma-separated or multiple flags)                                                                                                           |
| `--allowed-tools`                | -     | array   | -         | **Deprecated.** Use the [Policy Engine](../reference/policy-engine.md) instead. Tools that are allowed to run without confirmation (comma-separated or multiple flags) |
| `--extensions`                   | `-e`  | array   | -         | List of extensions to use. If not provided, all extensions are enabled (comma-separated or multiple flags)                                                             |
| `--list-extensions`              | `-l`  | boolean | -         | List all available extensions and exit                                                                                                                                 |
| `--resume`                       | `-r`  | string  | -         | Resume a previous session. Use `"latest"` for most recent or index number (e.g. `--resume 5`)                                                                          |
| `--list-sessions`                | -     | boolean | -         | List available sessions for the current project and exit                                                                                                               |
| `--delete-session`               | -     | string  | -         | Delete a session by index number (use `--list-sessions` to see available sessions)                                                                                     |
| `--include-directories`          | -     | array   | -         | Additional directories to include in the workspace (comma-separated or multiple flags)                                                                                 |
| `--screen-reader`                | -     | boolean | -         | Enable screen reader mode for accessibility                                                                                                                            |
| `--output-format`                | `-o`  | string  | `text`    | The format of the CLI output. Choices: `text`, `json`, `stream-json`                                                                                                   |

## Model selection

The `--model` (or `-m`) flag lets you specify which DeepSeek model to use. You can
use either model aliases (user-friendly names) or concrete model names.

### Model aliases

These are convenient shortcuts that map to specific models:

| Alias        | Resolves To                                | Description                                                                                                               |
| ------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `auto`       | `deepseek-2.5-pro` or `deepseek-3-pro-preview` | **Default.** Resolves to the preview model if preview features are enabled, otherwise resolves to the standard pro model. |
| `pro`        | `deepseek-2.5-pro` or `deepseek-3-pro-preview` | For complex reasoning tasks. Uses preview model if enabled.                                                               |
| `flash`      | `deepseek-2.5-flash`                         | Fast, balanced model for most tasks.                                                                                      |
| `flash-lite` | `deepseek-2.5-flash-lite`                    | Fastest model for simple tasks.                                                                                           |

## Extensions management

| Command                                            | Description                                  | Example                                                                        |
| -------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| `deepseek extensions install <source>`               | Install extension from Git URL or local path | `deepseek extensions install https://github.com/user/my-extension`               |
| `deepseek extensions install <source> --ref <ref>`   | Install from specific branch/tag/commit      | `deepseek extensions install https://github.com/user/my-extension --ref develop` |
| `deepseek extensions install <source> --auto-update` | Install with auto-update enabled             | `deepseek extensions install https://github.com/user/my-extension --auto-update` |
| `deepseek extensions uninstall <name>`               | Uninstall one or more extensions             | `deepseek extensions uninstall my-extension`                                     |
| `deepseek extensions list`                           | List all installed extensions                | `deepseek extensions list`                                                       |
| `deepseek extensions update <name>`                  | Update a specific extension                  | `deepseek extensions update my-extension`                                        |
| `deepseek extensions update --all`                   | Update all extensions                        | `deepseek extensions update --all`                                               |
| `deepseek extensions enable <name>`                  | Enable an extension                          | `deepseek extensions enable my-extension`                                        |
| `deepseek extensions disable <name>`                 | Disable an extension                         | `deepseek extensions disable my-extension`                                       |
| `deepseek extensions link <path>`                    | Link local extension for development         | `deepseek extensions link /path/to/extension`                                    |
| `deepseek extensions new <path>`                     | Create new extension from template           | `deepseek extensions new ./my-extension`                                         |
| `deepseek extensions validate <path>`                | Validate extension structure                 | `deepseek extensions validate ./my-extension`                                    |

See [Extensions Documentation](../extensions/index.md) for more details.

## MCP server management

| Command                                                       | Description                     | Example                                                                                              |
| ------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `deepseek mcp add <name> <command>`                             | Add stdio-based MCP server      | `deepseek mcp add github npx -y @modelcontextprotocol/server-github`                                   |
| `deepseek mcp add <name> <url> --transport http`                | Add HTTP-based MCP server       | `deepseek mcp add api-server http://localhost:3000 --transport http`                                   |
| `deepseek mcp add <name> <command> --env KEY=value`             | Add with environment variables  | `deepseek mcp add slack node server.js --env SLACK_TOKEN=xoxb-xxx`                                     |
| `deepseek mcp add <name> <command> --scope user`                | Add with user scope             | `deepseek mcp add db node db-server.js --scope user`                                                   |
| `deepseek mcp add <name> <command> --include-tools tool1,tool2` | Add with specific tools         | `deepseek mcp add github npx -y @modelcontextprotocol/server-github --include-tools list_repos,get_pr` |
| `deepseek mcp remove <name>`                                    | Remove an MCP server            | `deepseek mcp remove github`                                                                           |
| `deepseek mcp list`                                             | List all configured MCP servers | `deepseek mcp list`                                                                                    |

See [MCP Server Integration](../tools/mcp-server.md) for more details.

## Skills management

| Command                          | Description                           | Example                                           |
| -------------------------------- | ------------------------------------- | ------------------------------------------------- |
| `deepseek skills list`             | List all discovered agent skills      | `deepseek skills list`                              |
| `deepseek skills install <source>` | Install skill from Git, path, or file | `deepseek skills install https://github.com/u/repo` |
| `deepseek skills link <path>`      | Link local agent skills via symlink   | `deepseek skills link /path/to/my-skills`           |
| `deepseek skills uninstall <name>` | Uninstall an agent skill              | `deepseek skills uninstall my-skill`                |
| `deepseek skills enable <name>`    | Enable an agent skill                 | `deepseek skills enable my-skill`                   |
| `deepseek skills disable <name>`   | Disable an agent skill                | `deepseek skills disable my-skill`                  |
| `deepseek skills enable --all`     | Enable all skills                     | `deepseek skills enable --all`                      |
| `deepseek skills disable --all`    | Disable all skills                    | `deepseek skills disable --all`                     |

See [Agent Skills Documentation](./skills.md) for more details.
