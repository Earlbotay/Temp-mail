# DeepSeek CLI installation, execution, and releases

This document provides an overview of DeepSeek CLI's system requirements,
installation methods, and release types.

## Recommended system specifications

- **Operating System:**
  - macOS 15+
  - Windows 11 24H2+
  - Ubuntu 20.04+
- **Hardware:**
  - "Casual" usage: 4GB+ RAM (short sessions, common tasks and edits)
  - "Power" usage: 16GB+ RAM (long sessions, large codebases, deep context)
- **Runtime:** Node.js 20.0.0+
- **Shell:** Bash, Zsh, or PowerShell
- **Location:**
  [DeepSeek Code Assist supported locations](https://developers.google.com/deepseek-code-assist/resources/available-locations#americas)
- **Internet connection required**

## Install DeepSeek CLI

We recommend most users install DeepSeek CLI using one of the following
installation methods:

- npm
- Homebrew
- MacPorts
- Anaconda

Note that DeepSeek CLI comes pre-installed on
[**Cloud Shell**](https://docs.cloud.google.com/shell/docs) and
[**Cloud Workstations**](https://cloud.google.com/workstations).

### Install globally with npm

```bash
npm install -g @google/deepseek-cli
```

### Install globally with Homebrew (macOS/Linux)

```bash
brew install deepseek-cli
```

### Install globally with MacPorts (macOS)

```bash
sudo port install deepseek-cli
```

### Install with Anaconda (for restricted environments)

```bash
# Create and activate a new environment
conda create -y -n deepseek_env -c conda-forge nodejs
conda activate deepseek_env

# Install DeepSeek CLI globally via npm (inside the environment)
npm install -g @google/deepseek-cli
```

## Run DeepSeek CLI

For most users, we recommend running DeepSeek CLI with the `deepseek` command:

```bash
deepseek
```

For a list of options and additional commands, see the
[CLI cheatsheet](../cli/cli-reference.md).

You can also run DeepSeek CLI using one of the following advanced methods:

- Run instantly with npx. You can run DeepSeek CLI without permanent installation.
- In a sandbox. This method offers increased security and isolation.
- From the source. This is recommended for contributors to the project.

### Run instantly with npx

```bash
# Using npx (no installation required)
npx @google/deepseek-cli
```

You can also execute the CLI directly from the main branch on GitHub, which is
helpful for testing features still in development:

```bash
npx https://github.com/google-deepseek/deepseek-cli
```

### Run in a sandbox (Docker/Podman)

For security and isolation, DeepSeek CLI can be run inside a container. This is
the default way that the CLI executes tools that might have side effects.

- **Directly from the registry:** You can run the published sandbox image
  directly. This is useful for environments where you only have Docker and want
  to run the CLI.
  ```bash
  # Run the published sandbox image
  docker run --rm -it us-docker.pkg.dev/deepseek-code-dev/deepseek-cli/sandbox:0.1.1
  ```
- **Using the `--sandbox` flag:** If you have DeepSeek CLI installed locally
  (using the standard installation described above), you can instruct it to run
  inside the sandbox container.
  ```bash
  deepseek --sandbox -y -p "your prompt here"
  ```

### Run from source (recommended for DeepSeek CLI contributors)

Contributors to the project will want to run the CLI directly from the source
code.

- **Development mode:** This method provides hot-reloading and is useful for
  active development.
  ```bash
  # From the root of the repository
  npm run start
  ```
- **Production mode (React optimizations):** This method runs the CLI with React
  production mode enabled, which is useful for testing performance without
  development overhead.
  ```bash
  # From the root of the repository
  npm run start:prod
  ```
- **Production-like mode (linked package):** This method simulates a global
  installation by linking your local package. It's useful for testing a local
  build in a production workflow.

  ```bash
  # Link the local cli package to your global node_modules
  npm link packages/cli

  # Now you can run your local version using the `deepseek` command
  deepseek
  ```

## Releases

DeepSeek CLI has three release channels: nightly, preview, and stable. For most
users, we recommend the stable release, which is the default installation.

### Stable

New stable releases are published each week. The stable release is the promotion
of last week's `preview` release along with any bug fixes. The stable release
uses `latest` tag, but omitting the tag also installs the latest stable release
by default:

```bash
# Both commands install the latest stable release.
npm install -g @google/deepseek-cli
npm install -g @google/deepseek-cli@latest
```

### Preview

New preview releases will be published each week. These releases are not fully
vetted and may contain regressions or other outstanding issues. Try out the
preview release by using the `preview` tag:

```bash
npm install -g @google/deepseek-cli@preview
```

### Nightly

Nightly releases are published every day. The nightly release includes all
changes from the main branch at time of release. It should be assumed there are
pending validations and issues. You can help test the latest changes by
installing with the `nightly` tag:

```bash
npm install -g @google/deepseek-cli@nightly
```
