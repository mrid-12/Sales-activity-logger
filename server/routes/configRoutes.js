const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../services/configService');

router.get('/', (req, res) => res.json(getConfig()));

router.post('/', (req, res) => {
  const updated = updateConfig(req.body);
  res.json({ success: true, config: updated });
});

module.exports = router;
