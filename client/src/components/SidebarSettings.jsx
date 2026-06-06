import React from 'react';

const SidebarSettings = ({
  settingsOpen,
  setSettingsOpen,
  activePath,
  excelPath,
  setExcelPath,
  pathError,
  setPathError,
  handleSaveSettings,
  handleOpenFile,
  openFileLoading,
  openFileError,
  openFileSuccess,
  darkMode,
  setDarkMode,
}) => {
  return (
    <>
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
            Save Changes
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarSettings;
