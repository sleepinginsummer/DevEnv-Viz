import React from 'react';
import { EnvTool, ToolType } from '../types';

interface ToolCardProps {
  tool: EnvTool;
  onRemove: (id: string) => void;
  onSetGlobal?: () => void;
  setGlobalLabel?: string;
  activeGlobalLabel?: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onRemove, onSetGlobal, setGlobalLabel, activeGlobalLabel }) => {
  const getIconColor = (type: ToolType) => {
    switch (type) {
      case ToolType.JAVA: return 'text-orange-400 bg-orange-900/20';
      case ToolType.PYTHON: return 'text-blue-400 bg-blue-900/20';
      case ToolType.GO: return 'text-cyan-400 bg-cyan-900/20';
      case ToolType.NODE: return 'text-green-400 bg-green-900/20';
      default: return 'text-slate-400 bg-slate-800';
    }
  };

  const getSourceBadge = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('brew')) return 'bg-yellow-900/30 text-yellow-500 border-yellow-700/50';
    if (s.includes('system')) return 'bg-slate-700 text-slate-300 border-slate-600';
    if (s.includes('pyenv') || s.includes('nvm') || s.includes('sdk')) return 'bg-purple-900/30 text-purple-400 border-purple-700/50';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const isGlobal = tool.isSystemDefault;

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition-all duration-300 group relative flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${getIconColor(tool.type)}`}>
           <span className="font-bold text-lg">{tool.type}</span>
        </div>
        {isGlobal && (
          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20">
            DEFAULT
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-1">{tool.name}</h3>
      <p className="text-sm text-slate-400 font-mono mb-4">v{tool.version}</p>

      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${getSourceBadge(tool.source)}`}>
            {tool.source}
          </span>
        </div>
        
        <div className="bg-slate-900/80 p-2 rounded text-xs font-mono text-slate-500 truncate" title={tool.path}>
          {tool.path}
        </div>
      </div>

      {onSetGlobal && (
        <div className="mt-5 pt-4 border-t border-slate-700">
          <button 
            onClick={isGlobal ? undefined : onSetGlobal}
            disabled={isGlobal}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              isGlobal 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                : 'bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white'
            }`}
          >
            {isGlobal ? (activeGlobalLabel || '✓ Global') : (setGlobalLabel || 'Set Global')}
          </button>
        </div>
      )}
      
      <button 
        onClick={() => onRemove(tool.id)}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-all"
        title="Remove"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default ToolCard;