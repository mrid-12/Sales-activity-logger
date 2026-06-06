const fs = require('fs');
const path = require('path');
const os = require('os');

const configDir = path.join(os.homedir(), '.activitytracker');
const CONFIG_PATH = path.join(configDir, 'config.json');

// Ensure directory exists
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

function getConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const raw = fs.readFileSync(CONFIG_PATH);
      return JSON.parse(raw);
    } catch(e) {}
  }
  return { excelPath: '' };
}

function updateConfig(newConfig) {
  const currentConfig = getConfig();
  const merged = { ...currentConfig, ...newConfig };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
  return merged;
}

module.exports = { getConfig, updateConfig };
