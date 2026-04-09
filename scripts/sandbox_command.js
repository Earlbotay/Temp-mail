/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import stripJsonComments from 'strip-json-comments';
import os from 'node:os';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import { DEEPSEEK_DIR } from '@google/deepseek-cli-core';

const argv = yargs(hideBin(process.argv)).option('q', {
  alias: 'quiet',
  type: 'boolean',
  default: false,
}).argv;

const homedir = () => process.env['DEEPSEEK_CLI_HOME'] || os.homedir();

let deepseekSandbox = process.env.DEEPSEEK_SANDBOX;

if (!deepseekSandbox) {
  const userSettingsFile = join(homedir(), DEEPSEEK_DIR, 'settings.json');
  if (existsSync(userSettingsFile)) {
    const settings = JSON.parse(
      stripJsonComments(readFileSync(userSettingsFile, 'utf-8')),
    );
    if (settings.sandbox) {
      deepseekSandbox = settings.sandbox;
    }
  }
}

if (!deepseekSandbox) {
  let currentDir = process.cwd();
  while (true) {
    const deepseekEnv = join(currentDir, DEEPSEEK_DIR, '.env');
    const regularEnv = join(currentDir, '.env');
    if (existsSync(deepseekEnv)) {
      dotenv.config({ path: deepseekEnv, quiet: true });
      break;
    } else if (existsSync(regularEnv)) {
      dotenv.config({ path: regularEnv, quiet: true });
      break;
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  deepseekSandbox = process.env.DEEPSEEK_SANDBOX;
}

deepseekSandbox = (deepseekSandbox || '').toLowerCase();

const commandExists = (cmd) => {
  const checkCommand = os.platform() === 'win32' ? 'where' : 'command -v';
  try {
    execSync(`${checkCommand} ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    if (os.platform() === 'win32') {
      try {
        execSync(`${checkCommand} ${cmd}.exe`, { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

let command = '';
if (['1', 'true'].includes(deepseekSandbox)) {
  if (commandExists('docker')) {
    command = 'docker';
  } else if (commandExists('podman')) {
    command = 'podman';
  } else {
    console.error(
      'ERROR: install docker or podman or specify command in DEEPSEEK_SANDBOX',
    );
    process.exit(1);
  }
} else if (deepseekSandbox && !['0', 'false'].includes(deepseekSandbox)) {
  if (commandExists(deepseekSandbox)) {
    command = deepseekSandbox;
  } else {
    console.error(
      `ERROR: missing sandbox command '${deepseekSandbox}' (from DEEPSEEK_SANDBOX)`,
    );
    process.exit(1);
  }
} else {
  if (os.platform() === 'darwin' && process.env.SEATBELT_PROFILE !== 'none') {
    if (commandExists('sandbox-exec')) {
      command = 'sandbox-exec';
    } else {
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}

if (!argv.q) {
  console.log(command);
}
process.exit(0);
