import React, { useState, useEffect } from 'react';
import { getActivities, createActivity, updateActivity, getConfig, updateConfig, openExcelFile, reportByWeek, reportByAccount } from '../services/activityApi';
import Combobox from '../components/Combobox';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CONSTANTS from '../../../server/constants';

import SetupScreen from '../components/SetupScreen';
import SidebarSettings from '../components/SidebarSettings';
import ActivityForm from '../components/ActivityForm';
import RemindersList from '../components/RemindersList';
import LoggedActionsList from '../components/LoggedActionsList';
import FollowUpModal from '../components/FollowUpModal';
import ProfileViewModal from '../components/ProfileViewModal';

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });
  const [excelPath, setExcelPath] = useState('');
  const [activePath, setActivePath] = useState(''); // Stores the path that is currently loaded/active
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [pathError, setPathError] = useState('');
  
  // File opening status states
  const [openFileLoading, setOpenFileLoading] = useState(false);
  const [openFileError, setOpenFileError] = useState('');
  const [openFileSuccess, setOpenFileSuccess] = useState(false);

  // Modal states for Reporting
  const [reportWeekModalOpen, setReportWeekModalOpen] = useState(false);
  const [reportAccountModalOpen, setReportAccountModalOpen] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportAccount, setReportAccount] = useState('');
  const [reportPath, setReportPath] = useState('');

  const [formData, setFormData] = useState({
    accountInput: '',
    contactName: '',
    contactEmail: '',
    linkedinUrl: '',
    roleTitle: '',
    actionTaken: '',
    nextStep: '',
    reminderDate: '',
    notes: ''
  });

  const [sortRemindersBy, setSortRemindersBy] = useState('date');
  const [sortActionsBy, setSortActionsBy] = useState('date');
  const [editingActivity, setEditingActivity] = useState(null);
  const [confirmModalActivity, setConfirmModalActivity] = useState(null);
  const [viewingActivity, setViewingActivity] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const todayDate = getLocalDateString();

  useEffect(() => {
    if (viewingActivity || confirmModalActivity || reportWeekModalOpen || reportAccountModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingActivity, confirmModalActivity, reportWeekModalOpen, reportAccountModalOpen]);

  useEffect(() => {
    fetchConfig();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchConfig = async () => {
    try {
      const res = await getConfig();
      setExcelPath(res.data.excelPath);
      setActivePath(res.data.excelPath);
    } catch (e) {
      console.error('Error fetching configuration:', e);
    } finally {
      setIsConfigLoaded(true);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await getActivities();
      setActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDateChange = (date, fieldId) => {
    if (date) {
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      setFormData({ ...formData, [fieldId]: localDate.toISOString().split('T')[0] });
    } else {
      setFormData({ ...formData, [fieldId]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, {
          ...formData,
          todayDate,
          followUpCount: editingActivity.followUpCount,
          actionTaken: formData.actionTaken || CONSTANTS.DEFAULT_ACTION_TAKEN
        });
        setEditingActivity(null);
      } else {
        await createActivity({
          ...formData,
          todayDate,
          prevAction: CONSTANTS.DEFAULT_PREV_ACTION,
          actionTaken: formData.actionTaken || CONSTANTS.DEFAULT_ACTION_TAKEN,
          followUpCount: 0
        });
      }
      setFormData({
        accountInput: '',
        contactName: '',
        contactEmail: '',
        linkedinUrl: '',
        roleTitle: '',
        actionTaken: '',
        nextStep: '',
        reminderDate: '',
        notes: ''
      });
      fetchActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleEditAction = (action) => {
    setFormData({
      accountInput: action.accountInput || '',
      contactName: action.contactName || '',
      contactEmail: action.contactEmail || '',
      linkedinUrl: action.linkedinUrl || '',
      roleTitle: action.roleTitle || '',
      actionTaken: action.actionTaken || '',
      nextStep: action.nextStep || '',
      reminderDate: action.reminderDate || '',
      notes: action.notes || ''
    });
    setEditingActivity(action);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeReminder = (activity) => {
    setConfirmModalActivity(activity);
  };

  const handleConfirmComplete = async (editMode) => {
    const activity = confirmModalActivity;
    setConfirmModalActivity(null);

    if (editMode) {
      setFormData({
        accountInput: activity.accountInput || '',
        contactName: activity.contactName || '',
        contactEmail: activity.contactEmail || '',
        linkedinUrl: activity.linkedinUrl || '',
        roleTitle: activity.roleTitle || '',
        actionTaken: activity.actionTaken || '',
        nextStep: activity.nextStep || '',
        reminderDate: activity.reminderDate || '',
        notes: activity.notes || ''
      });
      setEditingActivity({ ...activity, followUpCount: (activity.followUpCount || 0) + 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await updateActivity(activity.id, { status: CONSTANTS.STATUS_COMPLETED });
      
      const newCount = (activity.followUpCount || 0) + 1;
      const isFirstFollowUp = newCount === 1;
      
      await createActivity({
        ...activity,
        id: undefined, 
        status: CONSTANTS.STATUS_ACTIVE,
        todayDate,
        actionTaken: `${CONSTANTS.FOLLOW_UP_PREFIX} ${newCount}`,
        prevAction: isFirstFollowUp ? CONSTANTS.DEFAULT_ACTION_TAKEN : `${CONSTANTS.FOLLOW_UP_PREFIX} ${newCount - 1}`,
        followUpCount: newCount,
        nextStep: '',
        reminderDate: ''
      });
      
      fetchActivities();
    }
  };

  const rescheduleReminder = async (activityId, newDate) => {
    if (newDate) {
      const offset = newDate.getTimezoneOffset();
      const localDate = new Date(newDate.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
      await updateActivity(activityId, { reminderDate: localDate });
      fetchActivities();
    }
  };

  const hideAction = async (id) => {
    await updateActivity(id, { status: CONSTANTS.STATUS_HIDDEN });
    fetchActivities();
  };

  const handleRestoreHidden = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);

    const hiddenToday = activities.filter(a => a.todayDate === todayDate && a.status === CONSTANTS.STATUS_HIDDEN);
    if (hiddenToday.length === 0) {
      return;
    }
    for (let a of hiddenToday) {
      await updateActivity(a.id, { status: CONSTANTS.STATUS_ACTIVE });
    }
    // Only update the activities state for restored items, preventing Reminders from fully refreshing
    setActivities(prev => prev.map(a => 
      (a.todayDate === todayDate && a.status === CONSTANTS.STATUS_HIDDEN) ? { ...a, status: CONSTANTS.STATUS_ACTIVE } : a
    ));
  };

  const handleLinkedInClick = (url) => {
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      alert("Failed to reach URL. Please ensure the LinkedIn URL is valid and starts with http:// or https://");
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveSettings = async () => {
    try {
      setPathError('');
      const res = await updateConfig({ excelPath });
      setActivePath(res.data.config.excelPath);
      setSettingsOpen(false);
      fetchActivities();
    } catch (e) {
      if (e.response && e.response.data && e.response.data.error) {
        setPathError(e.response.data.error);
      } else {
        setPathError('An unexpected error occurred while validating the path.');
      }
    }
  };

  const handleOpenFile = async () => {
    try {
      setOpenFileLoading(true);
      setOpenFileError('');
      setOpenFileSuccess(false);
      await openExcelFile();
      setOpenFileSuccess(true);
      setTimeout(() => setOpenFileSuccess(false), 4000);
    } catch (e) {
      if (e.response && e.response.data && e.response.data.error) {
        setOpenFileError(e.response.data.error);
      } else {
        setOpenFileError('Could not open the file. Make sure a default Excel editor is installed.');
      }
    } finally {
      setOpenFileLoading(false);
    }
  };

  const handleReportWeek = async (e) => {
    e.preventDefault();
    try {
      await reportByWeek({ startDate: reportStartDate, endDate: reportEndDate, directoryPath: reportPath, fileName: CONSTANTS.REPORT_FILE_WEEKLY });
      setReportWeekModalOpen(false);
      alert('Weekly report generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate weekly report. Check if path exists and is accessible.');
    }
  };

  const handleReportAccount = async (e) => {
    e.preventDefault();
    try {
      await reportByAccount({ accountName: reportAccount, directoryPath: reportPath, fileName: `${reportAccount.replace(/\s+/g, '_')}${CONSTANTS.REPORT_FILE_SUFFIX}` });
      setReportAccountModalOpen(false);
      alert('Account report generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate account report. Check if path exists and is accessible.');
    }
  };

  const handleStartDateChange = (e) => {
    const start = e.target.value;
    setReportStartDate(start);
    if (start) {
      const d = new Date(start);
      // JS Date from YYYY-MM-DD uses UTC, so adding 6 days is safe here for basic logic
      d.setUTCDate(d.getUTCDate() + 6);
      setReportEndDate(d.toISOString().split('T')[0]);
    }
  };

  let todayReminders = activities.filter(a => a.reminderDate === todayDate && a.status !== CONSTANTS.STATUS_COMPLETED && a.status !== CONSTANTS.STATUS_HIDDEN);
  let todayActions = activities.filter(a => a.todayDate === todayDate && a.status !== CONSTANTS.STATUS_HIDDEN);

  if (sortRemindersBy === 'date') {
    todayReminders.sort((a, b) => (a.todayDate || '').localeCompare(b.todayDate || ''));
  } else if (sortRemindersBy === 'account') {
    todayReminders.sort((a, b) => (a.accountInput || '').localeCompare(b.accountInput || ''));
  }

  if (sortActionsBy === 'date') {
    todayActions.sort((a, b) => (a.reminderDate || '').localeCompare(b.reminderDate || ''));
  } else if (sortActionsBy === 'account') {
    todayActions.sort((a, b) => (a.accountInput || '').localeCompare(b.accountInput || ''));
  }

  if (!isConfigLoaded) {
    return (
      <div className="min-h-screen bg-slate-200 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isConfigLoaded && !activePath) {
    return (
      <SetupScreen 
        excelPath={excelPath} 
        setExcelPath={setExcelPath} 
        pathError={pathError} 
        handleSaveSettings={handleSaveSettings} 
      />
    );
  }

  return (
    <div className="bg-slate-200 dark:bg-slate-950 text-black dark:text-slate-200 font-sans antialiased min-h-screen transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-400 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                ActivityTracker
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Reporting Buttons */}
            <button
              onClick={() => setReportWeekModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Report by Week</span>
            </button>
            <button
              onClick={() => setReportAccountModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Report by Account</span>
            </button>
            {/* Quick Dark Mode Switch */}
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646Z" />
                </svg>
              )}
            </button>

            {/* Sidebar Toggle Button */}
            <button 
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium text-sm cursor-pointer"
            >
              <svg className="w-5 h-5 text-slate-700 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Sidebar Content Component */}
      <SidebarSettings 
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        activePath={activePath}
        excelPath={excelPath}
        setExcelPath={setExcelPath}
        pathError={pathError}
        setPathError={setPathError}
        handleSaveSettings={handleSaveSettings}
        handleOpenFile={handleOpenFile}
        openFileLoading={openFileLoading}
        openFileError={openFileError}
        openFileSuccess={openFileSuccess}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Statistics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-400 dark:border-slate-800 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{todayReminders.length}</span>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Reminders Today</span>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-400 dark:border-slate-800 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{todayActions.length}</span>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions Completed Today</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-400 dark:border-slate-800 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{activities.length}</span>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stored Records</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Log Activity Form Card Component */}
          <ActivityForm 
            editingActivity={editingActivity}
            setEditingActivity={setEditingActivity}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            handleDateChange={handleDateChange}
            activities={activities}
          />

          {/* Right: Dashboard Lists */}
          <div className="lg:col-span-2 space-y-8 flex flex-col">
            
            {/* 1. Today's Reminders Dashboard Component */}
            <RemindersList 
              todayReminders={todayReminders}
              sortRemindersBy={sortRemindersBy}
              setSortRemindersBy={setSortRemindersBy}
              todayDate={todayDate}
              handleLinkedInClick={handleLinkedInClick}
              setViewingActivity={setViewingActivity}
              activities={activities}
              rescheduleReminder={rescheduleReminder}
              completeReminder={completeReminder}
            />

            {/* 2. Today's Actions Component */}
            <LoggedActionsList 
              todayActions={todayActions}
              sortActionsBy={sortActionsBy}
              setSortActionsBy={setSortActionsBy}
              handleRestoreHidden={handleRestoreHidden}
              isRefreshing={isRefreshing}
              handleLinkedInClick={handleLinkedInClick}
              setViewingActivity={setViewingActivity}
              activities={activities}
              handleEditAction={handleEditAction}
              hideAction={hideAction}
            />

          </div>
        </div>
      </main>

      {/* Report by Week Modal */}
      {reportWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReportWeekModalOpen(false)}></div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-400 dark:border-slate-800 w-full max-w-md relative z-10 p-6 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export Weekly Report</h3>
            <form onSubmit={handleReportWeek} className="space-y-4">
              <div className="space-y-1 custom-datepicker-wrapper relative z-50">
                <label className="block text-xs font-bold uppercase text-slate-700">Start Date</label>
                <DatePicker 
                  selected={reportStartDate ? new Date(reportStartDate + 'T12:00:00Z') : null}
                  onChange={(date) => {
                    if (date) {
                      const offset = date.getTimezoneOffset();
                      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                      handleStartDateChange({ target: { value: localDate.toISOString().split('T')[0] } });
                    } else {
                      handleStartDateChange({ target: { value: '' } });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-transparent"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select start date"
                  required
                />
              </div>
              <div className="space-y-1 custom-datepicker-wrapper relative z-40">
                <label className="block text-xs font-bold uppercase text-slate-700">End Date</label>
                <DatePicker 
                  selected={reportEndDate ? new Date(reportEndDate + 'T12:00:00Z') : null}
                  onChange={(date) => {
                    if (date) {
                      const offset = date.getTimezoneOffset();
                      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                      setReportEndDate(localDate.toISOString().split('T')[0]);
                    } else {
                      setReportEndDate('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-transparent"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select end date"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">Export Directory Path</label>
                <input 
                  type="text" 
                  value={reportPath} 
                  onChange={(e) => setReportPath(e.target.value)} 
                  placeholder="e.g. C:/Reports"
                  className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                  required 
                />
              </div>
              <div className="pt-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setReportWeekModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition">Export Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report by Account Modal */}
      {reportAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReportAccountModalOpen(false)}></div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-400 dark:border-slate-800 w-full max-w-md relative z-10 p-6 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export Account Report</h3>
            <form onSubmit={handleReportAccount} className="space-y-4">
              <div className="space-y-1 relative z-50">
                <label className="block text-xs font-bold uppercase text-slate-700">Account Name</label>
                <Combobox
                  id="reportAccount"
                  value={reportAccount}
                  onChange={(e) => setReportAccount(e.target.value)}
                  options={Array.from(new Set(activities.map(a => a.accountInput).filter(Boolean)))}
                  className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  placeholder="Select Account"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-700">Export Directory Path</label>
                <input 
                  type="text" 
                  value={reportPath} 
                  onChange={(e) => setReportPath(e.target.value)} 
                  placeholder="e.g. C:/Reports"
                  className="w-full px-3 py-2 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" 
                  required 
                />
              </div>
              <div className="pt-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setReportAccountModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition">Export Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Component */}
      <FollowUpModal 
        confirmModalActivity={confirmModalActivity}
        handleConfirmComplete={handleConfirmComplete}
        setConfirmModalActivity={setConfirmModalActivity}
      />

      {/* View Details Profile Modal Component */}
      <ProfileViewModal 
        viewingActivity={viewingActivity}
        setViewingActivity={setViewingActivity}
        handleLinkedInClick={handleLinkedInClick}
      />

    </div>
  );
}
