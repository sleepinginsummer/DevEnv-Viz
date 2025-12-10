import React from 'react';
import { ToolType, Language } from '../types';
import { translations } from '../utils/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toolCounts: Record<string, number>;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, toolCounts, language, setLanguage }) => {
  const t = translations[language];
  const tNames = translations[language].toolNames;

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: '⚡' },
    { id: 'env-vars', label: t.envVars, icon: '🔧' },
    { id: ToolType.JAVA, label: tNames[ToolType.JAVA], icon: '☕' },
    { id: ToolType.PYTHON, label: tNames[ToolType.PYTHON], icon: '🐍' },
    { id: ToolType.GO, label: tNames[ToolType.GO], icon: '🐹' },
    { id: ToolType.NODE, label: tNames[ToolType.NODE], icon: '🟢' },
  ];

  return (
    <div className="w-64 bg-slate-800 h-screen flex flex-col border-r border-slate-700 sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          DevEnv Viz
        </h1>
        <p className="text-slate-400 text-xs mt-1">Environment Manager</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            {toolCounts[item.id] > 0 && (
              <span className="bg-slate-900 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {toolCounts[item.id]}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-4">
        {/* Language Toggle */}
        <div className="flex bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${
              language === 'en' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('zh')}
            className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${
              language === 'zh' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            中文
          </button>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 font-mono">Platform: macOS / Win</p>
          <p className="text-xs text-slate-600 font-mono mt-1">v1.3.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;