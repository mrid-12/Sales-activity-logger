import React from 'react';

const FollowUpModal = ({
  confirmModalActivity,
  handleConfirmComplete,
  setConfirmModalActivity
}) => {
  if (!confirmModalActivity) return null;

  return (
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
  );
};

export default FollowUpModal;
