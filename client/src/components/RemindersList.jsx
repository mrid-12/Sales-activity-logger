import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomCalendarInput = React.forwardRef(({ value, onClick }, ref) => (
  <button 
    className="text-amber-500 hover:text-white p-1.5 rounded-lg hover:bg-amber-500 dark:hover:bg-amber-500 transition cursor-pointer flex items-center justify-center" 
    onClick={onClick} 
    ref={ref}
    title="Reschedule"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  </button>
));

const RemindersList = ({
  todayReminders,
  sortRemindersBy,
  setSortRemindersBy,
  todayDate,
  handleLinkedInClick,
  setViewingActivity,
  activities,
  rescheduleReminder,
  completeReminder,
}) => {
  return (
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
                        popperModifiers={[
                          {
                            name: 'offset',
                            options: {
                              offset: [0, 8],
                            },
                          },
                          {
                            name: 'preventOverflow',
                            options: {
                              rootBoundary: 'document',
                              tether: false,
                              altAxis: true,
                            },
                          },
                        ]}
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
  );
};

export default RemindersList;
