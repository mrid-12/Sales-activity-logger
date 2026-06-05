const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/config.json');

function getConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    const raw = fs.readFileSync(CONFIG_PATH);
    return JSON.parse(raw);
  }
  return { excelPath: path.join(__dirname, '../data/activityTracker.xlsx') };
}

function updateConfig(newConfig) {
  const currentConfig = getConfig();
  const merged = { ...currentConfig, ...newConfig };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
  return merged;
}

module.exports = { getConfig, updateConfig };
