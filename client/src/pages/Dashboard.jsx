import React, { useState, useEffect } from 'react';
import { getActivities, createActivity, updateActivity, getConfig, updateConfig } from '../services/activityApi';

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [excelPath, setExcelPath] = useState('');
  
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

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchConfig();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchConfig = async () => {
    try {
      const res = await getConfig();
      setExcelPath(res.data.excelPath);
    } catch (e) {
      console.error(e);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createActivity({
        ...formData,
        todayDate,
        prevAction: 'N/A',
        actionTaken: formData.actionTaken || 'New Activity',
        followUpCount: 0
      });
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

  const completeReminder = async (activity) => {
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
  };

  const hideAction = async (id) => {
    await updateActivity(id, { status: 'hidden' });
    fetchActivities();
  };

  const handleSaveSettings = async () => {
    await updateConfig({ excelPath });
    setSettingsOpen(false);
    fetchActivities();
  };

  const todayReminders = activities.filter(a => a.reminderDate === todayDate && a.status !== 'completed' && a.status !== 'hidden');
  const todayActions = activities.filter(a => a.todayDate === todayDate && a.status !== 'hidden');

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans antialiased min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        <div className="fixed bottom-4 right-4 z-50">
          <button onClick={() => setSettingsOpen(true)} className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md space-y-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h2>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dark Mode</span>
                <button onClick={() => setDarkMode(!darkMode)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Excel File Path</label>
                <input type="text" value={excelPath} onChange={(e) => setExcelPath(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <p className="text-xs text-slate-400 mt-2">Changing this will reload the dashboard with the new file.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => setSettingsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">Cancel</button>
                <button onClick={handleSaveSettings} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition">Save & Reload</button>
              </div>
            </div>
          </div>
        )}

        <header className="border-b border-slate-200 dark:border-slate-700 pb-5 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">Activity Tracker &amp; Dashboard</h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Track client interactions, manage follow-ups, and view daily reminders seamlessly.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-1.5 text-sm">
              <select className="bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="this-week">This Week</option>
              </select>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer whitespace-nowrap">
                Report by Week
              </button>
            </div>

            <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center gap-1.5 text-sm">
              <select className="bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[140px] cursor-pointer">
                <option value="all">All Accounts</option>
                {Array.from(new Set(activities.map(a => a.accountInput).filter(Boolean))).map(account => (
                    <option key={account} value={account}>{account}</option>
                ))}
              </select>
              <button className="bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 dark:hover:bg-slate-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer whitespace-nowrap">
                Report by Account
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700 h-fit">
            <h2 className="text-xl font-bold mb-5 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Log New Activity</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Account Name</label>
                <input type="text" id="accountInput" value={formData.accountInput} onChange={handleChange} list="accountsDataset" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Type or select account..." required />
                <datalist id="accountsDataset">
                  {Array.from(new Set(activities.map(a => a.accountInput).filter(Boolean))).map(account => (
                      <option key={account} value={account}>{account}</option>
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Contact Name</label>
                  <input type="text" id="contactName" value={formData.contactName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Contact Email</label>
                  <input type="email" id="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="john@example.com" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Action Taken</label>
                <input type="text" id="actionTaken" value={formData.actionTaken} onChange={handleChange} maxLength="30" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="e.g., Initial intro call" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Next Step / Action</label>
                <input type="text" id="nextStep" value={formData.nextStep} onChange={handleChange} maxLength="50" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="e.g., Follow up with proposal" required />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Reminder Date</label>
                <input type="date" id="reminderDate" value={formData.reminderDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer" required />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md cursor-pointer transition duration-150 transform active:scale-[0.99]">Save Entry</button>
            </form>
          </section>

          <div className="lg:col-span-2 space-y-8 flex flex-col">
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-100 dark:border-slate-700 pb-3">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Today's Reminders Dashboard</h2>
                <span className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-xs">Today: {todayDate}</span>
              </div>
              
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50/75 dark:bg-slate-800/75">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account Name</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact Name</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next Step / Action</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prev Action</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {todayReminders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-12 text-center text-slate-400 font-medium">No follow-up actions due today. All caught up!</td>
                      </tr>
                    ) : (
                      todayReminders.map((reminder, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">{reminder.accountInput}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{reminder.contactName}</td>
                          <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-semibold">{reminder.nextStep}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{reminder.actionTaken}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <button onClick={() => completeReminder(reminder)} title="Complete Action" className="text-emerald-500 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50 dark:hover:bg-slate-700 transition">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button onClick={() => hideAction(reminder.id)} title="Dismiss Reminder" className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-slate-700 transition">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-100 dark:border-slate-700 pb-3">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Today's Actions</h2>
                <span className="bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full shadow-xs">{todayActions.length} Completed Actions</span>
              </div>
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50/75 dark:bg-slate-800/75">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account Name</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact Name</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action Completed</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prev Action</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Logged</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {todayActions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-slate-400 font-medium">No actions logged today yet.</td>
                      </tr>
                    ) : (
                      todayActions.map((action, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">{action.accountInput}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{action.contactName}</td>
                          <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-semibold">{action.actionTaken}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{action.prevAction}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{action.todayDate}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                            <button onClick={() => hideAction(action.id)} title="Delete locally" className="text-slate-400 hover:text-red-500 transition cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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
      </div>
    </div>
  );
}
