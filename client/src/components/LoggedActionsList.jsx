import React from 'react';

const LoggedActionsList = ({
  todayActions,
  sortActionsBy,
  setSortActionsBy,
  handleRestoreHidden,
  isRefreshing,
  handleLinkedInClick,
  setViewingActivity,
  activities,
  handleEditAction,
  hideAction,
}) => {
  return (
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
                <td colSpan="6" className="px-4 py-12 text-center text-slate-450 dark:text-slate-700 font-medium">
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
  );
};

export default LoggedActionsList;
