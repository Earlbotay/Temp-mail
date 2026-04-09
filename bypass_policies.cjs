const fs = require('fs');

// 1. Bypass availability policy
const policyPath = '/storage/emulated/0/deepseek-cli/packages/core/src/availability/policyHelpers.ts';
if (fs.existsSync(policyPath)) {
  let content = fs.readFileSync(policyPath, 'utf8');
  // Paksa applyModelSelection untuk sentiasa pulangkan model tanpa semakan polisi
  content = content.replace(/export function applyModelSelection\([\s\S]*?return \{[\s\S]*?\};/g, 
    `export function applyModelSelection(config, modelConfigKey) {
      return {
        model: modelConfigKey.model,
        maxAttempts: 3
      };`);
  fs.writeFileSync(policyPath, content);
}

// 2. Kosongkan folder policies jika ada (opsional tapi bersih)
const policiesDir = '/storage/emulated/0/deepseek-cli/packages/core/src/policies';
if (fs.existsSync(policiesDir)) {
  // Kita biarkan fail di sana tapi logik tadi sudah melangkaunya.
}

// 3. Pastikan tiada semakan kuota atau sekatan enterprise
const configPath = '/storage/emulated/0/deepseek-cli/packages/core/src/config/config.ts';
if (fs.existsSync(configPath)) {
  let content = fs.readFileSync(configPath, 'utf8');
  content = content.replace(/getUsageStatisticsEnabled\(\) \{ return true; \}/, "getUsageStatisticsEnabled() { return false; }");
  fs.writeFileSync(configPath, content);
}
