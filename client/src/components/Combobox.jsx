import React, { useState, useRef, useEffect } from 'react';

export default function Combobox({ 
  id, 
  value, 
  onChange, 
  options = [], 
  placeholder = "", 
  className = "", 
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Update filtered options when options prop changes or when value changes
    if (value) {
      setFilteredOptions(options.filter(opt => opt.toLowerCase().includes(value.toLowerCase())));
    } else {
      setFilteredOptions(options);
    }
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    onChange(e);
    setIsOpen(true);
  };

  const handleOptionClick = (opt) => {
    // Simulate an event object to pass to the parent's onChange handler
    onChange({ target: { id, value: opt } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className={className}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {/* Caret icon inside input to signify dropdown */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((opt, idx) => (
                <li
                  key={idx}
                  onClick={() => handleOptionClick(opt)}
                  className="px-4 py-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {opt}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 italic">No existing matches. Press enter to add new.</div>
          )}
        </div>
      )}
    </div>
  );
}
