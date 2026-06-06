const XLSX = require('xlsx');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getConfig } = require('./configService');
const CONSTANTS = require('../constants');

function getFilePath() {
  return getConfig().excelPath;
}

function getActivities() {
  const file = getFilePath();
  if (!fs.existsSync(file)) return [];
  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

function addActivity(activity) {
  const file = getFilePath();
  let workbook, sheet, rows = [];
  if (fs.existsSync(file)) {
    workbook = XLSX.readFile(file);
    sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(sheet);
  } else {
    workbook = XLSX.utils.book_new();
  }
  
  if (!activity.id) activity.id = uuidv4();
  if (!activity.status) activity.status = CONSTANTS.STATUS_ACTIVE;
  if (activity.followUpCount === undefined) activity.followUpCount = 0;
  if (!activity.prevAction) activity.prevAction = CONSTANTS.DEFAULT_PREV_ACTION;
  if (!activity.actionTaken) activity.actionTaken = CONSTANTS.DEFAULT_ACTION_TAKEN;

  rows.push(activity);
  
  const newSheet = XLSX.utils.json_to_sheet(rows);
  if (workbook.SheetNames.length > 0) {
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  } else {
    XLSX.utils.book_append_sheet(workbook, newSheet, CONSTANTS.SHEET_NAME_ACTIVITIES);
  }
  XLSX.writeFile(workbook, file);
}

function updateActivity(id, updates) {
  const file = getFilePath();
  if (!fs.existsSync(file)) return;
  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  
  const index = rows.findIndex(r => r.id === id);
  if (index !== -1) {
    rows[index] = { ...rows[index], ...updates };
    workbook.Sheets[workbook.SheetNames[0]] = XLSX.utils.json_to_sheet(rows);
    XLSX.writeFile(workbook, file);
  }
}

function exportReport(activities, targetDir, fileName) {
  const path = require('path');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const file = path.join(targetDir, fileName);
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(activities);
  XLSX.utils.book_append_sheet(workbook, sheet, CONSTANTS.SHEET_NAME_REPORT);
  XLSX.writeFile(workbook, file);
  return file;
}

function generateWeeklyReport(startDate, endDate, targetDir, fileName) {
  const activities = getActivities();
  const filtered = activities.filter(a => {
    if (!a.todayDate) return false;
    return a.todayDate >= startDate && a.todayDate <= endDate;
  });
  return exportReport(filtered, targetDir, fileName);
}

function generateAccountReport(accountName, targetDir, fileName) {
  const activities = getActivities();
  const filtered = activities.filter(a => a.accountInput === accountName);
  return exportReport(filtered, targetDir, fileName);
}

module.exports = { 
  getActivities, 
  addActivity, 
  updateActivity,
  generateWeeklyReport,
  generateAccountReport
};
