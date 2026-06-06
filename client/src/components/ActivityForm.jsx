import React from 'react';
import Combobox from './Combobox';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ActivityForm = ({
  editingActivity,
  setEditingActivity,
  formData,
  setFormData,
  handleSubmit,
  handleChange,
  handleDateChange,
  activities,
}) => {
  return (
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
        <div className="space-y-1 z-20 relative">
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
          <div className="space-y-1 z-10 relative">
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

        <div className="space-y-1 z-0 relative custom-datepicker-wrapper">
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
  );
};

export default ActivityForm;
