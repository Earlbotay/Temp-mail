/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { ModelQuotaDisplay } from './ModelQuotaDisplay.js';
import { useUIState } from '../contexts/UIStateContext.js';
import {
  PREVIEW_DEEPSEEK_MODEL,
  PREVIEW_DEEPSEEK_3_1_MODEL,
  PREVIEW_DEEPSEEK_FLASH_MODEL,
  PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL,
  PREVIEW_DEEPSEEK_MODEL_AUTO,
  DEFAULT_DEEPSEEK_MODEL,
  DEFAULT_DEEPSEEK_FLASH_MODEL,
  DEFAULT_DEEPSEEK_FLASH_LITE_MODEL,
  DEFAULT_DEEPSEEK_MODEL_AUTO,
  ModelSlashCommandEvent,
  logModelSlashCommand,
  getDisplayString,
  AuthType,
  PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL,
  isProModel,
} from '@google/deepseek-cli-core';
import { useKeypress } from '../hooks/useKeypress.js';
import { theme } from '../semantic-colors.js';
import { DescriptiveRadioButtonSelect } from './shared/DescriptiveRadioButtonSelect.js';
import { ConfigContext } from '../contexts/ConfigContext.js';
import { useSettings } from '../contexts/SettingsContext.js';

interface ModelDialogProps {
  onClose: () => void;
}

export function ModelDialog({ onClose }: ModelDialogProps): React.JSX.Element {
  const config = useContext(ConfigContext);
  const settings = useSettings();
  const { terminalWidth } = useUIState();
  const [hasAccessToProModel, setHasAccessToProModel] = useState<boolean>(
    () => !(config?.getProModelNoAccessSync() ?? false),
  );
  const [view, setView] = useState<'main' | 'manual'>(() =>
    config?.getProModelNoAccessSync() ? 'manual' : 'main',
  );
  const [persistMode, setPersistMode] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      if (!config) return;
      const noAccess = await config.getProModelNoAccess();
      setHasAccessToProModel(!noAccess);
      if (noAccess) {
        setView('manual');
      }
    }
    void checkAccess();
  }, [config]);

  // Determine the Preferred Model (read once when the dialog opens).
  const preferredModel = config?.getModel() || DEFAULT_DEEPSEEK_MODEL_AUTO;

  const shouldShowPreviewModels = config?.getHasAccessToPreviewModel();
  const useDeepSeek31 = config?.getDeepSeek31LaunchedSync?.() ?? false;
  const useDeepSeek31FlashLite =
    config?.getDeepSeek31FlashLiteLaunchedSync?.() ?? false;
  const selectedAuthType = settings.merged.security.auth.selectedType;
  const useCustomToolModel =
    useDeepSeek31 && selectedAuthType === AuthType.USE_DEEPSEEK;

  const manualModelSelected = useMemo(() => {
    if (
      config?.getExperimentalDynamicModelConfiguration?.() === true &&
      config.getModelConfigService
    ) {
      const def = config
        .getModelConfigService()
        .getModelDefinition(preferredModel);
      // Only treat as manual selection if it's a visible, non-auto model.
      return def && def.tier !== 'auto' && def.isVisible === true
        ? preferredModel
        : '';
    }

    const manualModels = [
      DEFAULT_DEEPSEEK_MODEL,
      DEFAULT_DEEPSEEK_FLASH_MODEL,
      DEFAULT_DEEPSEEK_FLASH_LITE_MODEL,
      PREVIEW_DEEPSEEK_MODEL,
      PREVIEW_DEEPSEEK_3_1_MODEL,
      PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL,
      PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL,
      PREVIEW_DEEPSEEK_FLASH_MODEL,
    ];
    if (manualModels.includes(preferredModel)) {
      return preferredModel;
    }
    return '';
  }, [preferredModel, config]);

  useKeypress(
    (key) => {
      if (key.name === 'escape') {
        if (view === 'manual' && hasAccessToProModel) {
          setView('main');
        } else {
          onClose();
        }
        return true;
      }
      if (key.name === 'tab') {
        setPersistMode((prev) => !prev);
        return true;
      }
      return false;
    },
    { isActive: true },
  );

  const mainOptions = useMemo(() => {
    // --- DYNAMIC PATH ---
    if (
      config?.getExperimentalDynamicModelConfiguration?.() === true &&
      config.getModelConfigService
    ) {
      const allOptions = config
        .getModelConfigService()
        .getAvailableModelOptions({
          useDeepSeek3_1: useDeepSeek31,
          useDeepSeek3_1FlashLite: useDeepSeek31FlashLite,
          useCustomTools: useCustomToolModel,
          hasAccessToPreview: shouldShowPreviewModels,
          hasAccessToProModel,
        });

      const list = allOptions
        .filter((o) => o.tier === 'auto')
        .map((o) => ({
          value: o.modelId,
          title: o.name,
          description: o.description,
          key: o.modelId,
        }));

      list.push({
        value: 'Manual',
        title: manualModelSelected
          ? `Manual (${getDisplayString(manualModelSelected, config ?? undefined)})`
          : 'Manual',
        description: 'Manually select a model',
        key: 'Manual',
      });
      return list;
    }

    // --- LEGACY PATH ---
    const list = [
      {
        value: DEFAULT_DEEPSEEK_MODEL_AUTO,
        title: getDisplayString(DEFAULT_DEEPSEEK_MODEL_AUTO),
        description:
          'Let DeepSeek CLI decide the best model for the task: deepseek-2.5-pro, deepseek-2.5-flash',
        key: DEFAULT_DEEPSEEK_MODEL_AUTO,
      },
      {
        value: 'Manual',
        title: manualModelSelected
          ? `Manual (${getDisplayString(manualModelSelected)})`
          : 'Manual',
        description: 'Manually select a model',
        key: 'Manual',
      },
    ];

    if (shouldShowPreviewModels) {
      list.unshift({
        value: PREVIEW_DEEPSEEK_MODEL_AUTO,
        title: getDisplayString(PREVIEW_DEEPSEEK_MODEL_AUTO),
        description: useDeepSeek31
          ? 'Let DeepSeek CLI decide the best model for the task: deepseek-3.1-pro, deepseek-3-flash'
          : 'Let DeepSeek CLI decide the best model for the task: deepseek-3-pro, deepseek-3-flash',
        key: PREVIEW_DEEPSEEK_MODEL_AUTO,
      });
    }
    return list;
  }, [
    config,
    shouldShowPreviewModels,
    manualModelSelected,
    useDeepSeek31,
    useDeepSeek31FlashLite,
    useCustomToolModel,
    hasAccessToProModel,
  ]);

  const manualOptions = useMemo(() => {
    // --- DYNAMIC PATH ---
    if (
      config?.getExperimentalDynamicModelConfiguration?.() === true &&
      config.getModelConfigService
    ) {
      const allOptions = config
        .getModelConfigService()
        .getAvailableModelOptions({
          useDeepSeek3_1: useDeepSeek31,
          useDeepSeek3_1FlashLite: useDeepSeek31FlashLite,
          useCustomTools: useCustomToolModel,
          hasAccessToPreview: shouldShowPreviewModels,
          hasAccessToProModel,
        });

      return allOptions
        .filter((o) => o.tier !== 'auto')
        .map((o) => ({
          value: o.modelId,
          title: o.name,
          key: o.modelId,
        }));
    }

    // --- LEGACY PATH ---
    const list = [
      {
        value: DEFAULT_DEEPSEEK_MODEL,
        title: getDisplayString(DEFAULT_DEEPSEEK_MODEL),
        key: DEFAULT_DEEPSEEK_MODEL,
      },
      {
        value: DEFAULT_DEEPSEEK_FLASH_MODEL,
        title: getDisplayString(DEFAULT_DEEPSEEK_FLASH_MODEL),
        key: DEFAULT_DEEPSEEK_FLASH_MODEL,
      },
      {
        value: DEFAULT_DEEPSEEK_FLASH_LITE_MODEL,
        title: getDisplayString(DEFAULT_DEEPSEEK_FLASH_LITE_MODEL),
        key: DEFAULT_DEEPSEEK_FLASH_LITE_MODEL,
      },
    ];

    if (shouldShowPreviewModels) {
      const previewProModel = useDeepSeek31
        ? PREVIEW_DEEPSEEK_3_1_MODEL
        : PREVIEW_DEEPSEEK_MODEL;

      const previewProValue = useCustomToolModel
        ? PREVIEW_DEEPSEEK_3_1_CUSTOM_TOOLS_MODEL
        : previewProModel;

      const previewOptions = [
        {
          value: previewProValue,
          title: getDisplayString(previewProModel),
          key: previewProModel,
        },
        {
          value: PREVIEW_DEEPSEEK_FLASH_MODEL,
          title: getDisplayString(PREVIEW_DEEPSEEK_FLASH_MODEL),
          key: PREVIEW_DEEPSEEK_FLASH_MODEL,
        },
      ];

      if (useDeepSeek31FlashLite) {
        previewOptions.push({
          value: PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL,
          title: getDisplayString(PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL),
          key: PREVIEW_DEEPSEEK_3_1_FLASH_LITE_MODEL,
        });
      }

      list.unshift(...previewOptions);
    }

    if (!hasAccessToProModel) {
      // Filter out all Pro models for free tier
      return list.filter((option) => !isProModel(option.value));
    }

    return list;
  }, [
    shouldShowPreviewModels,
    useDeepSeek31,
    useDeepSeek31FlashLite,
    useCustomToolModel,
    hasAccessToProModel,
    config,
  ]);

  const options = view === 'main' ? mainOptions : manualOptions;

  // Calculate the initial index based on the preferred model.
  const initialIndex = useMemo(() => {
    const idx = options.findIndex((option) => option.value === preferredModel);
    if (idx !== -1) {
      return idx;
    }
    if (view === 'main') {
      const manualIdx = options.findIndex((o) => o.value === 'Manual');
      return manualIdx !== -1 ? manualIdx : 0;
    }
    return 0;
  }, [preferredModel, options, view]);

  // Handle selection internally (Autonomous Dialog).
  const handleSelect = useCallback(
    (model: string) => {
      if (model === 'Manual') {
        setView('manual');
        return;
      }

      if (config) {
        config.setModel(model, persistMode ? false : true);
        const event = new ModelSlashCommandEvent(model);
        logModelSlashCommand(config, event);
      }
      onClose();
    },
    [config, onClose, persistMode],
  );

  return (
    <Box
      borderStyle="round"
      borderColor={theme.border.default}
      flexDirection="column"
      padding={1}
      width="100%"
    >
      <Text bold>Select Model</Text>

      <Box marginTop={1}>
        <DescriptiveRadioButtonSelect
          items={options}
          onSelect={handleSelect}
          initialIndex={initialIndex}
          showNumbers={true}
        />
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text bold color={theme.text.primary}>
            Remember model for future sessions:{' '}
          </Text>
          <Text color={theme.status.success}>
            {persistMode ? 'true' : 'false'}
          </Text>
          <Text color={theme.text.secondary}> (Press Tab to toggle)</Text>
        </Box>
      </Box>
      <Box flexDirection="column">
        <Text color={theme.text.secondary}>
          {'> To use a specific DeepSeek model on startup, use the --model flag.'}
        </Text>
      </Box>
      <ModelQuotaDisplay
        buckets={config?.getLastRetrievedQuota()?.buckets}
        availableWidth={terminalWidth - 2}
      />
      <Box marginTop={1} flexDirection="column">
        <Text color={theme.text.secondary}>(Press Esc to close)</Text>
      </Box>
    </Box>
  );
}
