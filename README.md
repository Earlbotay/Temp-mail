# DeepSeek CLI

[![DeepSeek CLI CI](https://github.com/google-deepseek/deepseek-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-deepseek/deepseek-cli/actions/workflows/ci.yml)
[![DeepSeek CLI E2E (Chained)](https://github.com/google-deepseek/deepseek-cli/actions/workflows/chained_e2e.yml/badge.svg)](https://github.com/google-deepseek/deepseek-cli/actions/workflows/chained_e2e.yml)
[![Version](https://img.shields.io/npm/v/@google/deepseek-cli)](https://www.npmjs.com/package/@google/deepseek-cli)
[![License](https://img.shields.io/github/license/google-deepseek/deepseek-cli)](https://github.com/google-deepseek/deepseek-cli/blob/main/LICENSE)
[![View Code Wiki](https://assets.codewiki.google/readme-badge/static.svg)](https://codewiki.google/github.com/google-deepseek/deepseek-cli?utm_source=badge&utm_medium=github&utm_campaign=github.com/google-deepseek/deepseek-cli)

![DeepSeek CLI Screenshot](/docs/assets/deepseek-screenshot.png)

DeepSeek CLI is an open-source AI agent that brings the power of DeepSeek directly
into your terminal. It provides lightweight access to DeepSeek, giving you the
most direct path from your prompt to our model.

Learn all about DeepSeek CLI in our [documentation](https://deepseekcli.com/docs/).

## 🚀 Why DeepSeek CLI?

- **🎯 Free tier**: 60 requests/min and 1,000 requests/day with personal Google
  account.
- **🧠 Powerful DeepSeek 3 models**: Access to improved reasoning and 1M token
  context window.
- **🔧 Built-in tools**: Google Search grounding, file operations, shell
  commands, web fetching.
- **🔌 Extensible**: MCP (Model Context Protocol) support for custom
  integrations.
- **💻 Terminal-first**: Designed for developers who live in the command line.
- **🛡️ Open source**: Apache 2.0 licensed.

## 📦 Installation

See
[DeepSeek CLI installation, execution, and releases](https://www.deepseekcli.com/docs/get-started/installation)
for recommended system specifications and a detailed installation guide.

### Quick Install

#### Run instantly with npx

```bash
# Using npx (no installation required)
npx @google/deepseek-cli
```

#### Install globally with npm

```bash
npm install -g @google/deepseek-cli
```

#### Install globally with Homebrew (macOS/Linux)

```bash
brew install deepseek-cli
```

#### Install globally with MacPorts (macOS)

```bash
sudo port install deepseek-cli
```

#### Install with Anaconda (for restricted environments)

```bash
# Create and activate a new environment
conda create -y -n deepseek_env -c conda-forge nodejs
conda activate deepseek_env

# Install DeepSeek CLI globally via npm (inside the environment)
npm install -g @google/deepseek-cli
```

## Release Channels

See [Releases](https://www.deepseekcli.com/docs/changelogs) for more details.

### Preview

New preview releases will be published each week at UTC 23:59 on Tuesdays. These
releases will not have been fully vetted and may contain regressions or other
outstanding issues. Please help us test and install with `preview` tag.

```bash
npm install -g @google/deepseek-cli@preview
```

### Stable

- New stable releases will be published each week at UTC 20:00 on Tuesdays, this
  will be the full promotion of last week's `preview` release + any bug fixes
  and validations. Use `latest` tag.

```bash
npm install -g @google/deepseek-cli@latest
```

### Nightly

- New releases will be published each day at UTC 00:00. This will be all changes
  from the main branch as represented at time of release. It should be assumed
  there are pending validations and issues. Use `nightly` tag.

```bash
npm install -g @google/deepseek-cli@nightly
```

## 📋 Key Features

### Code Understanding & Generation

- Query and edit large codebases
- Generate new apps from PDFs, images, or sketches using multimodal capabilities
- Debug issues and troubleshoot with natural language

### Automation & Integration

- Automate operational tasks like querying pull requests or handling complex
  rebases
- Use MCP servers to connect new capabilities, including
  [media generation with Imagen, Veo or Lyria](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia)
- Run non-interactively in scripts for workflow automation

### Advanced Capabilities

- Ground your queries with built-in
  [Google Search](https://ai.google.dev/deepseek-api/docs/grounding) for real-time
  information
- Conversation checkpointing to save and resume complex sessions
- Custom context files (Deepseek.md) to tailor behavior for your projects

### GitHub Integration

Integrate DeepSeek CLI directly into your GitHub workflows with
[**DeepSeek CLI GitHub Action**](https://github.com/google-github-actions/run-deepseek-cli):

- **Pull Request Reviews**: Automated code review with contextual feedback and
  suggestions
- **Issue Triage**: Automated labeling and prioritization of GitHub issues based
  on content analysis
- **On-demand Assistance**: Mention `@deepseek-cli` in issues and pull requests
  for help with debugging, explanations, or task delegation
- **Custom Workflows**: Build automated, scheduled and on-demand workflows
  tailored to your team's needs

## 🔐 Authentication Options

Choose the authentication method that best fits your needs:

### Option 1: Sign in with Google (OAuth login using your Google Account)

**✨ Best for:** Individual developers as well as anyone who has a DeepSeek Code
Assist License. (see
[quota limits and terms of service](https://cloud.google.com/deepseek/docs/quotas)
for details)

**Benefits:**

- **Free tier**: 60 requests/min and 1,000 requests/day
- **DeepSeek 3 models** with 1M token context window
- **No API key management** - just sign in with your Google account
- **Automatic updates** to latest models

#### Start DeepSeek CLI, then choose _Sign in with Google_ and follow the browser authentication flow when prompted

```bash
deepseek
```

#### If you are using a paid Code Assist License from your organization, remember to set the Google Cloud Project

```bash
# Set your Google Cloud Project
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
deepseek
```

### Option 2: DeepSeek API Key

**✨ Best for:** Developers who need specific model control or paid tier access

**Benefits:**

- **Free tier**: 1000 requests/day with DeepSeek 3 (mix of flash and pro)
- **Model selection**: Choose specific DeepSeek models
- **Usage-based billing**: Upgrade for higher limits when needed

```bash
# Get your key from https://aistudio.google.com/apikey
export DEEPSEEK_API_KEY="YOUR_API_KEY"
deepseek
```

### Option 3: Vertex AI

**✨ Best for:** Enterprise teams and production workloads

**Benefits:**

- **Enterprise features**: Advanced security and compliance
- **Scalable**: Higher rate limits with billing account
- **Integration**: Works with existing Google Cloud infrastructure

```bash
# Get your key from Google Cloud Console
export GOOGLE_API_KEY="YOUR_API_KEY"
export GOOGLE_GENAI_USE_VERTEXAI=true
deepseek
```

For Google Workspace accounts and other authentication methods, see the
[authentication guide](https://www.deepseekcli.com/docs/get-started/authentication).

## 🚀 Getting Started

### Basic Usage

#### Start in current directory

```bash
deepseek
```

#### Include multiple directories

```bash
deepseek --include-directories ../lib,../docs
```

#### Use specific model

```bash
deepseek -m deepseek-2.5-flash
```

#### Non-interactive mode for scripts

Get a simple text response:

```bash
deepseek -p "Explain the architecture of this codebase"
```

For more advanced scripting, including how to parse JSON and handle errors, use
the `--output-format json` flag to get structured output:

```bash
deepseek -p "Explain the architecture of this codebase" --output-format json
```

For real-time event streaming (useful for monitoring long-running operations),
use `--output-format stream-json` to get newline-delimited JSON events:

```bash
deepseek -p "Run tests and deploy" --output-format stream-json
```

### Quick Examples

#### Start a new project

```bash
cd new-project/
deepseek
> Write me a Discord bot that answers questions using a FAQ.md file I will provide
```

#### Analyze existing code

```bash
git clone https://github.com/google-deepseek/deepseek-cli
cd deepseek-cli
deepseek
> Give me a summary of all of the changes that went in yesterday
```

## 📚 Documentation

### Getting Started

- [**Quickstart Guide**](https://www.deepseekcli.com/docs/get-started) - Get up
  and running quickly.
- [**Authentication Setup**](https://www.deepseekcli.com/docs/get-started/authentication) -
  Detailed auth configuration.
- [**Configuration Guide**](https://www.deepseekcli.com/docs/reference/configuration) -
  Settings and customization.
- [**Keyboard Shortcuts**](https://www.deepseekcli.com/docs/reference/keyboard-shortcuts) -
  Productivity tips.

### Core Features

- [**Commands Reference**](https://www.deepseekcli.com/docs/reference/commands) -
  All slash commands (`/help`, `/chat`, etc).
- [**Custom Commands**](https://www.deepseekcli.com/docs/cli/custom-commands) -
  Create your own reusable commands.
- [**Context Files (Deepseek.md)**](https://www.deepseekcli.com/docs/cli/deepseek-md) -
  Provide persistent context to DeepSeek CLI.
- [**Checkpointing**](https://www.deepseekcli.com/docs/cli/checkpointing) - Save
  and resume conversations.
- [**Token Caching**](https://www.deepseekcli.com/docs/cli/token-caching) -
  Optimize token usage.

### Tools & Extensions

- [**Built-in Tools Overview**](https://www.deepseekcli.com/docs/reference/tools)
  - [File System Operations](https://www.deepseekcli.com/docs/tools/file-system)
  - [Shell Commands](https://www.deepseekcli.com/docs/tools/shell)
  - [Web Fetch & Search](https://www.deepseekcli.com/docs/tools/web-fetch)
- [**MCP Server Integration**](https://www.deepseekcli.com/docs/tools/mcp-server) -
  Extend with custom tools.
- [**Custom Extensions**](https://deepseekcli.com/docs/extensions/writing-extensions) -
  Build and share your own commands.

### Advanced Topics

- [**Headless Mode (Scripting)**](https://www.deepseekcli.com/docs/cli/headless) -
  Use DeepSeek CLI in automated workflows.
- [**IDE Integration**](https://www.deepseekcli.com/docs/ide-integration) - VS
  Code companion.
- [**Sandboxing & Security**](https://www.deepseekcli.com/docs/cli/sandbox) - Safe
  execution environments.
- [**Trusted Folders**](https://www.deepseekcli.com/docs/cli/trusted-folders) -
  Control execution policies by folder.
- [**Enterprise Guide**](https://www.deepseekcli.com/docs/cli/enterprise) - Deploy
  and manage in a corporate environment.
- [**Telemetry & Monitoring**](https://www.deepseekcli.com/docs/cli/telemetry) -
  Usage tracking.
- [**Tools reference**](https://www.deepseekcli.com/docs/reference/tools) -
  Built-in tools overview.
- [**Local development**](https://www.deepseekcli.com/docs/local-development) -
  Local development tooling.

### Troubleshooting & Support

- [**Troubleshooting Guide**](https://www.deepseekcli.com/docs/resources/troubleshooting) -
  Common issues and solutions.
- [**FAQ**](https://www.deepseekcli.com/docs/resources/faq) - Frequently asked
  questions.
- Use `/bug` command to report issues directly from the CLI.

### Using MCP Servers

Configure MCP servers in `~/.deepseek/settings.json` to extend DeepSeek CLI with
custom tools:

```text
> @github List my open pull requests
> @slack Send a summary of today's commits to #dev channel
> @database Run a query to find inactive users
```

See the
[MCP Server Integration guide](https://www.deepseekcli.com/docs/tools/mcp-server)
for setup instructions.

## 🤝 Contributing

We welcome contributions! DeepSeek CLI is fully open source (Apache 2.0), and we
encourage the community to:

- Report bugs and suggest features.
- Improve documentation.
- Submit code improvements.
- Share your MCP servers and extensions.

See our [Contributing Guide](./CONTRIBUTING.md) for development setup, coding
standards, and how to submit pull requests.

Check our [Official Roadmap](https://github.com/orgs/google-deepseek/projects/11)
for planned features and priorities.

## 📖 Resources

- **[Official Roadmap](./ROADMAP.md)** - See what's coming next.
- **[Changelog](https://www.deepseekcli.com/docs/changelogs)** - See recent
  notable updates.
- **[NPM Package](https://www.npmjs.com/package/@google/deepseek-cli)** - Package
  registry.
- **[GitHub Issues](https://github.com/google-deepseek/deepseek-cli/issues)** -
  Report bugs or request features.
- **[Security Advisories](https://github.com/google-deepseek/deepseek-cli/security/advisories)** -
  Security updates.

### Uninstall

See the [Uninstall Guide](https://www.deepseekcli.com/docs/resources/uninstall)
for removal instructions.

## 📄 Legal

- **License**: [Apache License 2.0](LICENSE)
- **Terms of Service**:
  [Terms & Privacy](https://www.deepseekcli.com/docs/resources/tos-privacy)
- **Security**: [Security Policy](SECURITY.md)

---

<p align="center">
  Built with ❤️ by Google and the open source community
</p>
