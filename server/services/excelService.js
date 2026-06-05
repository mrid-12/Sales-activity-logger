const XLSX = require('xlsx');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getConfig } = require('./configService');

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
  if (!activity.status) activity.status = 'active';
  if (activity.followUpCount === undefined) activity.followUpCount = 0;
  if (!activity.prevAction) activity.prevAction = 'N/A';
  if (!activity.actionTaken) activity.actionTaken = 'New Activity';

  rows.push(activity);
  
  const newSheet = XLSX.utils.json_to_sheet(rows);
  if (workbook.SheetNames.length > 0) {
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  } else {
    XLSX.utils.book_append_sheet(workbook, newSheet, 'Activities');
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

module.exports = { getActivities, addActivity, updateActivity };
