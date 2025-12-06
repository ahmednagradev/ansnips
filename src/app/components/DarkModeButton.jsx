import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeButton = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className={`relative w-14 h-7 rounded-full p-1 transition-all duration-300 hover:scale-105 focus:outline-none ${
        isDark 
          ? 'bg-slate-700 focus:ring-slate-400' 
          : 'bg-amber-200 focus:ring-amber-300'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full shadow-sm flex items-center justify-center transition-transform duration-300 ${
          isDark 
            ? 'translate-x-7 bg-slate-800' 
            : 'translate-x-0 bg-white'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-slate-400" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </div>
    </button>
  );
};

export default DarkModeButton;