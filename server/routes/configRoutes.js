const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { getConfig, updateConfig } = require('../services/configService');

router.get('/', (req, res) => res.json(getConfig()));

router.post('/', (req, res) => {
  const { excelPath } = req.body;
  if (!excelPath) {
    return res.status(400).json({ success: false, error: 'Excel path is required.' });
  }

  const resolvedPath = path.resolve(excelPath);

  if (!fs.existsSync(resolvedPath)) {
    return res.status(400).json({
      success: false,
      error: `File does not exist at: "${excelPath}"`
    });
  }

  const updated = updateConfig({ excelPath: resolvedPath });
  res.json({ success: true, config: updated });
});

router.post('/open', (req, res) => {
  const { excelPath } = getConfig();
  if (!excelPath || !fs.existsSync(excelPath)) {
    return res.status(400).json({ success: false, error: 'Excel file path is not configured or file does not exist.' });
  }

  const command = `start "" "${excelPath}"`;
  exec(command, (err) => {
    if (err) {
      console.error('Failed to open file:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to open the file. Ensure a default app is configured for .xlsx files.'
      });
    }
    res.json({ success: true });
  });
});

module.exports = router;
