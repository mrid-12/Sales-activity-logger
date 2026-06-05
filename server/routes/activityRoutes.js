const express = require('express');
const router = express.Router();
const { getActivities, addActivity, updateActivity, generateWeeklyReport, generateAccountReport } = require('../services/excelService');

router.get('/', (req, res) => res.json(getActivities()));

router.post('/', (req, res) => {
  addActivity(req.body);
  res.json({ success: true });
});

router.patch('/:id', (req, res) => {
  updateActivity(req.params.id, req.body);
  res.json({ success: true });
});

router.post('/report/week', (req, res) => {
  const { startDate, endDate, directoryPath, fileName } = req.body;
  try {
    const filePath = generateWeeklyReport(startDate, endDate, directoryPath, fileName);
    res.json({ success: true, filePath });
  } catch (error) {
    console.error('Failed to generate weekly report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/report/account', (req, res) => {
  const { accountName, directoryPath, fileName } = req.body;
  try {
    const filePath = generateAccountReport(accountName, directoryPath, fileName);
    res.json({ success: true, filePath });
  } catch (error) {
    console.error('Failed to generate account report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
