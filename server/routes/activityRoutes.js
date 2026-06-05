const express = require('express');
const router = express.Router();
const { getActivities, addActivity, updateActivity } = require('../services/excelService');

router.get('/', (req, res) => res.json(getActivities()));

router.post('/', (req, res) => {
  addActivity(req.body);
  res.json({ success: true });
});

router.patch('/:id', (req, res) => {
  updateActivity(req.params.id, req.body);
  res.json({ success: true });
});

module.exports = router;
