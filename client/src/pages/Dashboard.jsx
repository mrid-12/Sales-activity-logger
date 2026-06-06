import React, { useState, useEffect } from 'react';
import { getActivities, createActivity, updateActivity, getConfig, updateConfig, openExcelFile, reportByWeek, reportByAccount } from '../services/activityApi';
import Combobox from '../components/Combobox';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });
  const [excelPath, setExcelPath] = useState('');
  const [activePath, setActivePath] = useState(''); // Stores the path that is currently loaded/active
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

  const CustomCalendarInput = React.forwardRef(({ value, onClick }, ref) => (
    <button type="button" onClick={onClick} ref={ref} className="text-amber-500 hover:text-amber-600 transition cursor-pointer p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30" title="Reschedule">
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </button>
  ));

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
          actionTaken: formData.actionTaken || 'New Activity'
        });
        setEditingActivity(null);
      } else {
        await createActivity({
          ...formData,
          todayDate,
          prevAction: 'N/A',
          actionTaken: formData.actionTaken || 'New Activity',
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
      await updateActivity(activity.id, { status: 'completed' });
      
      const newCount = (activity.followUpCount || 0) + 1;
      const isFirstFollowUp = newCount === 1;
      
      await createActivity({
        ...activity,
        id: undefined, 
        status: 'active',
        todayDate,
        actionTaken: `follow-up ${newCount}`,
        prevAction: isFirstFollowUp ? 'New Activity' : `follow-up ${newCount - 1}`,
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
    await updateActivity(id, { status: 'hidden' });
    fetchActivities();
  };

  const handleRestoreHidden = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);

    const hiddenToday = activities.filter(a => a.todayDate === todayDate && a.status === 'hidden');
    if (hiddenToday.length === 0) {
      return;
    }
    for (let a of hiddenToday) {
      await updateActivity(a.id, { status: 'active' });
    }
    // Only update the activities state for restored items, preventing Reminders from fully refreshing
    setActivities(prev => prev.map(a => 
      (a.todayDate === todayDate && a.status === 'hidden') ? { ...a, status: 'active' } : a
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
      await reportByWeek({ startDate: reportStartDate, endDate: reportEndDate, directoryPath: reportPath, fileName: 'WeeklyReport.xlsx' });
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
      await reportByAccount({ accountName: reportAccount, directoryPath: reportPath, fileName: `${reportAccount.replace(/\s+/g, '_')}_Report.xlsx` });
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

  let todayReminders = activities.filter(a => a.reminderDate === todayDate && a.status !== 'completed' && a.status !== 'hidden');
  let todayActions = activities.filter(a => a.todayDate === todayDate && a.status !== 'hidden');

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

      {/* Settings Sliding Sidebar Overlay */}
      {settingsOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/20 dark:bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => {
          setSettingsOpen(false);
          setPathError('');
          setExcelPath(activePath);
        }}></div>
      )}

      {/* Settings Sliding Sidebar */}
      <aside 
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-slate-50 dark:bg-slate-900 border-l border-slate-400 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-out transform flex flex-col ${
          settingsOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-400 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Workspace Configuration</h2>
          </div>
          <button 
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Active Path Box */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-400 dark:border-slate-800/80 space-y-3.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Active Excel Database</span>
              <span className="text-xs font-mono break-all text-slate-700 dark:text-slate-300 font-medium">
                {activePath || 'Not configured'}
              </span>
            </div>
            
            <button
              onClick={handleOpenFile}
              disabled={openFileLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 transition disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {openFileLoading ? 'Opening...' : 'Open File in Default App'}
            </button>

            {openFileError && (
              <p className="text-xs text-rose-500 font-medium text-center">{openFileError}</p>
            )}
            {openFileSuccess && (
              <p className="text-xs text-emerald-500 font-semibold text-center flex items-center justify-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Opened successfully!
              </p>
            )}
          </div>

          {/* Edit Path Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Edit File Location
            </label>
            <input 
              type="text" 
              value={excelPath} 
              onChange={(e) => {
                setExcelPath(e.target.value);
                setPathError('');
              }}
              placeholder="e.g., C:/path/to/activityTracker.xlsx"
              className={`w-full px-3.5 py-2.5 border text-sm rounded-xl focus:ring-2 focus:outline-none dark:bg-slate-950 dark:text-white transition-all ${
                pathError 
                  ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' 
                  : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
            {pathError && (
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-start gap-1.5 mt-1">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{pathError}</span>
              </div>
            )}
            <p className="text-[11px] text-slate-400 leading-normal">
              Provide an absolute path or relative path from the server directory. Paths must target an existing spreadsheet.
            </p>
          </div>

          {/* Theme Settings Row */}
          <div className="flex items-center justify-between py-4 border-t border-slate-400 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-850 dark:text-slate-200">Dark Mode</span>
              <span className="text-xs text-slate-400">Toggle dark styling across dashboard</span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-slate-400 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-end gap-3">
          <button 
            onClick={() => {
              setSettingsOpen(false);
              setPathError('');
              setExcelPath(activePath);
            }} 
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveSettings} 
            className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition cursor-pointer"
          >
            Save &amp; Reload
          </button>
        </div>
      </aside>

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
          
          {/* Left: Log Activity Form Card */}
          <section className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-400 dark:border-slate-800 shadow-xs h-fit space-y-6">
            <div className="border-b border-slate-300 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingActivity ? "Edit Log Entry" : "Log New Activity"}
                </h2>
              </div>
              {editingActivity && (
                <button 
                  onClick={() => {
                    setEditingActivity(null);
                    setFormData({
                      accountInput: '', contactName: '', contactEmail: '', linkedinUrl: '', roleTitle: '', actionTaken: '', nextStep: '', reminderDate: '', notes: ''
                    });
                  }}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold uppercase tracking-wider"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 z-40 relative">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Account Name <span className="text-rose-500">*</span></label>
                <Combobox
                  id="accountInput"
                  value={formData.accountInput}
                  onChange={handleChange}
                  options={Array.from(new Set(activities.map(a => a.accountInput).filter(Boolean)))}
                  className="w-full px-4 py-3 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-base"
                  placeholder="Acme Corp"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1 z-30 relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Name <span className="text-rose-500">*</span></label>
                  <Combobox
                    id="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    options={Array.from(new Set(
                      activities
                        .filter(a => a.accountInput === formData.accountInput)
                        .map(a => a.contactName)
                        .filter(Boolean)
                    ))}
                    className="w-full px-4 py-3 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-base"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Email</label>
                  <input 
                    type="email" 
                    id="contactEmail" 
                    value={formData.contactEmail} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-base" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">LinkedIn URL</label>
                  <input 
                    type="url" 
                    id="linkedinUrl" 
                    value={formData.linkedinUrl} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-base" 
                    placeholder="https://linkedin.com/in/..." 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Role / Title</label>
                  <input 
                    type="text" 
                    id="roleTitle" 
                    value={formData.roleTitle} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-base" 
                    placeholder="e.g., CEO" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Action Taken <span className="text-rose-500">*</span></label>
                <textarea 
                  id="actionTaken" 
                  value={formData.actionTaken} 
                  onChange={handleChange} 
                  maxLength="250" 
                  rows="2"
                  className="w-full px-4 py-3 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-base resize-none" 
                  placeholder="e.g., Cold introduction" 
                  required
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Next Step / Action</label>
                <textarea 
                  id="nextStep" 
                  value={formData.nextStep} 
                  onChange={handleChange} 
                  maxLength="250" 
                  rows="2"
                  className="w-full px-4 py-3 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-base resize-none" 
                  placeholder="e.g., Email catalog" 
                ></textarea>
              </div>

              <div className="space-y-1 z-20 relative custom-datepicker-wrapper">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Reminder Date</label>
                <DatePicker 
                  selected={formData.reminderDate ? new Date(formData.reminderDate + 'T12:00:00Z') : null}
                  onChange={(date) => handleDateChange(date, 'reminderDate')}
                  className="w-full px-4 py-3 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all text-base bg-transparent"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select a date"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Notes</label>
                <textarea 
                  id="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  rows="4" 
                  className="w-full px-4 py-3 border border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 text-base resize-none" 
                  placeholder="Add any extra notes or details here..." 
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 cursor-pointer transition-all transform active:scale-[0.98] text-base mt-4"
              >
                {editingActivity ? "Update Log Entry" : "Save Log Entry"}
              </button>
            </form>
          </section>

          {/* Right: Dashboard Lists */}
          <div className="lg:col-span-2 space-y-8 flex flex-col">
            
            {/* 1. Today's Reminders Dashboard */}
            <section className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-400 dark:border-slate-800 shadow-xs flex-1 flex flex-col space-y-4">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-300 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Reminders Dashboard</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex bg-slate-300 dark:bg-slate-800 border border-slate-400 dark:border-transparent rounded-lg p-1">
                    <button 
                      onClick={() => setSortRemindersBy('date')} 
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${sortRemindersBy === 'date' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'bg-transparent dark:bg-transparent text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                      Sort by Prev Date
                    </button>
                    <button 
                      onClick={() => setSortRemindersBy('account')} 
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${sortRemindersBy === 'account' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'bg-transparent dark:bg-transparent text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                      Sort by Account
                    </button>
                  </div>
                  <span className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-slate-400 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold px-3 py-1 rounded-lg shadow-2xs">
                    Today: {todayDate}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto border border-slate-400 dark:border-slate-800 rounded-xl flex-1 custom-scrollbar">
                <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-800">
                  <thead className="bg-slate-50/60 dark:bg-slate-950/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Contact Name</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Account Name</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest w-2/5">Next Step / Action</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest w-[13%]">Prev Action</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Prev Corr. Date</th>
                      <th className="px-4 py-3 text-right text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-sm">
                    {todayReminders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-16 text-center text-slate-450 dark:text-slate-700 font-medium">
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-8 h-8 text-slate-350 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>No follow-up actions due today. All caught up!</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      todayReminders.map((reminder, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors border-b border-slate-300 dark:border-slate-800/50 last:border-0">
                          <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              {reminder.contactName}
                              {reminder.linkedinUrl && (
                                <button type="button" onClick={() => handleLinkedInClick(reminder.linkedinUrl)} className="text-blue-500 hover:text-blue-700 transition" title="Open LinkedIn">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-medium">{reminder.accountInput}</td>
                          <td className="px-4 py-3.5 text-slate-900 dark:text-slate-100 font-bold">{reminder.nextStep}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-450 dark:text-slate-700 font-mono truncate max-w-[80px] xl:max-w-[120px]">{reminder.actionTaken}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-700 font-medium">{reminder.todayDate}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1.5 overflow-visible">
                              <button 
                                onClick={() => {
                                  const related = activities.filter(a => a.contactName === reminder.contactName && a.accountInput === reminder.accountInput);
                                  related.sort((a, b) => (b.followUpCount || 0) - (a.followUpCount || 0));
                                  setViewingActivity(related[0] || reminder);
                                }} 
                                title="View Details" 
                                className="text-sky-500 hover:text-white p-1.5 rounded-lg hover:bg-sky-500 dark:hover:bg-sky-500 transition cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <DatePicker
                                selected={null}
                                onChange={(date) => rescheduleReminder(reminder.id, date)}
                                customInput={<CustomCalendarInput />}
                                popperPlacement="bottom-end"
                              />
                              <button 
                                onClick={() => completeReminder(reminder)} 
                                title="Complete Action" 
                                className="text-emerald-600 hover:text-white p-1.5 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 transition cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2. Today's Actions */}
            <section className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-400 dark:border-slate-800 shadow-xs flex-1 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-300 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Logged Actions</h2>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex bg-slate-300 dark:bg-slate-800 border border-slate-400 dark:border-transparent rounded-lg p-1">
                    <button 
                      onClick={() => setSortActionsBy('date')} 
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${sortActionsBy === 'date' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'bg-transparent dark:bg-transparent text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                      Sort by Reminder Date
                    </button>
                    <button 
                      onClick={() => setSortActionsBy('account')} 
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${sortActionsBy === 'account' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'bg-transparent dark:bg-transparent text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                      Sort by Account
                    </button>
                  </div>
                  <button 
                    onClick={handleRestoreHidden}
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/30 border border-slate-400 dark:border-transparent px-3 py-2 rounded-lg shadow-sm"
                  >
                    <svg className={`w-3.5 h-3.5 transition-transform duration-500 ${isRefreshing ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-400 dark:border-slate-800 rounded-xl flex-1 shadow-sm custom-scrollbar">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-100/60 dark:bg-slate-950/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Contact Name</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Account Name</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Action Completed</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest w-1/3">Action Taken</th>
                      <th className="px-4 py-3 text-left text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Future Reminder</th>
                      <th className="px-4 py-3 text-right text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-sm">
                    {todayActions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-12 text-center text-slate-450 dark:text-slate-700 font-medium">
                          No actions logged today yet. Get started by entering an activity on the left.
                        </td>
                      </tr>
                    ) : (
                      todayActions.map((action, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors border-b border-slate-300 dark:border-slate-800/50 last:border-0">
                          <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              {action.contactName}
                              {action.linkedinUrl && (
                                <button type="button" onClick={() => handleLinkedInClick(action.linkedinUrl)} className="text-blue-500 hover:text-blue-700 transition" title="Open LinkedIn">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700 dark:text-slate-400 font-medium">{action.accountInput}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100 font-bold">
                            {(!action.followUpCount || action.followUpCount === 0) ? 'New activity' : `Follow up ${action.followUpCount}`}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-400 font-medium truncate max-w-[100px] xl:max-w-[200px]">{action.actionTaken}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-700 font-medium">{action.reminderDate || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button 
                                onClick={() => {
                                  const related = activities.filter(a => a.contactName === action.contactName && a.accountInput === action.accountInput);
                                  related.sort((a, b) => (b.followUpCount || 0) - (a.followUpCount || 0));
                                  setViewingActivity(related[0] || action);
                                }} 
                                title="View Details" 
                                className="text-sky-500 hover:text-white p-1.5 rounded-lg hover:bg-sky-500 dark:hover:bg-sky-500 transition cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleEditAction(action)} 
                                title="Edit Action" 
                                className="text-indigo-500 hover:text-white p-1.5 rounded-lg hover:bg-indigo-500 dark:hover:bg-indigo-500 transition cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => hideAction(action.id)} 
                                title="Dismiss Locally (Preserves in Excel)" 
                                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

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

      {/* Confirmation Modal for Complete Action */}
      {confirmModalActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-400 dark:border-slate-800 w-full max-w-md relative z-10 p-6 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">Complete Action</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              Would you like to edit the user's information or schedule a second follow up?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => handleConfirmComplete(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                No, mark as done
              </button>
              <button 
                onClick={() => handleConfirmComplete(true)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
              >
                Yes, edit user info
              </button>
            </div>
            <button 
              onClick={() => setConfirmModalActivity(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* View Details Profile Modal */}
      {viewingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-md p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-700 w-full max-w-lg relative z-10 overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Modal Header / Banner */}
            <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 dark:from-indigo-900 dark:to-slate-800 w-full relative">
              <button 
                onClick={() => setViewingActivity(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Avatar Overlay */}
            <div className="px-8 relative pb-6">
              <div className="absolute -top-12 left-8 border-[5px] border-white dark:border-slate-900 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center w-24 h-24 shadow-md overflow-hidden ring-1 ring-slate-400 dark:ring-0">
                {viewingActivity.contactName ? (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(viewingActivity.contactName)}&background=random&size=128&bold=true`} 
                    alt={viewingActivity.contactName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              <div className="pt-14 space-y-1">
                <div className="flex items-center gap-3 justify-between">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{viewingActivity.contactName}</h2>
                  {viewingActivity.linkedinUrl && (
                    <button 
                      type="button" 
                      onClick={() => handleLinkedInClick(viewingActivity.linkedinUrl)} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full text-xs font-bold transition-colors border border-blue-200 dark:border-blue-800 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      LinkedIn
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {viewingActivity.roleTitle || 'No Role specified'} • {viewingActivity.accountInput || 'No Account'}
                </p>
                {viewingActivity.contactEmail && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <a href={`mailto:${viewingActivity.contactEmail}`} className="hover:underline">{viewingActivity.contactEmail}</a>
                  </p>
                )}
              </div>

              {/* Data Grid */}
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-400 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {(!viewingActivity.followUpCount || viewingActivity.followUpCount === 0) ? 'New activity' : `Follow up ${viewingActivity.followUpCount}`}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-400 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Next Reminder</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {viewingActivity.reminderDate || 'None'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 pb-2 border-b border-slate-400 dark:border-slate-800">Action Taken</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-400 dark:border-slate-800 overflow-y-auto max-h-[150px] custom-scrollbar">
                    {viewingActivity.actionTaken || 'No action recorded.'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 pb-2 border-b border-slate-400 dark:border-slate-800">Next Step</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-400 dark:border-slate-800 overflow-y-auto max-h-[150px] custom-scrollbar">
                    {viewingActivity.nextStep || 'No next step planned.'}
                  </p>
                </div>

                {viewingActivity.notes && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 pb-2 border-b border-slate-400 dark:border-slate-800">Additional Notes</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-400 dark:border-slate-800 overflow-y-auto max-h-[100px] custom-scrollbar">
                      {viewingActivity.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


