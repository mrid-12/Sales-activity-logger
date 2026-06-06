import React from 'react';

const SetupScreen = ({ excelPath, setExcelPath, pathError, handleSaveSettings }) => {
  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-800 p-8 max-w-lg w-full text-center space-y-6">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to ActivityTracker</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-relaxed">
            To get started, please provide the absolute path to your Excel file where data will be stored. If the file does not exist, it will be created for you.
          </p>
        </div>
        
        <div className="text-left space-y-2 relative">
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">Excel File Path</label>
          <input 
            type="text" 
            value={excelPath} 
            onChange={(e) => setExcelPath(e.target.value)} 
            placeholder="e.g. C:\Users\John\Documents\Tracker.xlsx"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
          />
          {pathError && <p className="text-red-500 text-xs font-medium mt-1">{pathError}</p>}
        </div>

        <button 
          onClick={handleSaveSettings}
          disabled={!excelPath.trim()}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all"
        >
          Start Tracking
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
