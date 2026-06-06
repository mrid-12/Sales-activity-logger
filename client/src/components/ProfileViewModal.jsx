import React from 'react';

const ProfileViewModal = ({
  viewingActivity,
  setViewingActivity,
  handleLinkedInClick,
}) => {
  if (!viewingActivity) return null;

  return (
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
  );
};

export default ProfileViewModal;
