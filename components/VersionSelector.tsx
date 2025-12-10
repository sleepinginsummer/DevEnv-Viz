import React from 'react';
import { ToolType, Language } from '../types';
import { translations } from '../utils/translations';

interface VersionSelectorProps {
  toolType: ToolType;
  language: Language;
  onSelect: (version: string, cmd: string) => void;
  onClose: () => void;
}

const AVAILABLE_VERSIONS = {
  [ToolType.JAVA]: [
    { version: 'OpenJDK 21 (LTS)', cmd: 'brew install openjdk@21', desc: 'Latest Long Term Support' },
    { version: 'OpenJDK 17 (LTS)', cmd: 'brew install openjdk@17', desc: 'Previous LTS, widely used' },
    { version: 'OpenJDK 11 (LTS)', cmd: 'brew install openjdk@11', desc: 'Legacy Enterprise Standard' },
    { version: 'OpenJDK 8', cmd: 'brew install openjdk@8', desc: 'Legacy Support' },
  ],
  [ToolType.PYTHON]: [
    { version: 'Python 3.12', cmd: 'pyenv install 3.12.1', desc: 'Latest Stable' },
    { version: 'Python 3.11', cmd: 'pyenv install 3.11.7', desc: 'Stable, high performance' },
    { version: 'Python 3.10', cmd: 'pyenv install 3.10.13', desc: 'Mature release' },
    { version: 'Anaconda 3', cmd: 'brew install --cask anaconda', desc: 'Data Science Platform' },
  ],
  [ToolType.NODE]: [
    { version: 'Node 20 (LTS)', cmd: 'nvm install 20', desc: 'Active LTS (Iron)' },
    { version: 'Node 18 (LTS)', cmd: 'nvm install 18', desc: 'Maintenance LTS (Hydrogen)' },
    { version: 'Node 21', cmd: 'nvm install 21', desc: 'Current Latest Features' },
    { version: 'Node 16', cmd: 'nvm install 16', desc: 'Legacy' },
  ],
  [ToolType.GO]: [
    { version: 'Go 1.22', cmd: 'brew install go', desc: 'Latest Release' },
    { version: 'Go 1.21', cmd: 'brew install go@1.21', desc: 'Previous Stable' },
    { version: 'Go 1.20', cmd: 'brew install go@1.20', desc: 'Legacy' },
  ],
  [ToolType.UNKNOWN]: []
};

const VersionSelector: React.FC<VersionSelectorProps> = ({ toolType, language, onSelect, onClose }) => {
  const t = translations[language];
  const list = AVAILABLE_VERSIONS[toolType] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-xl font-bold text-white mb-2">{t.installNew} {translations[language].toolNames[toolType]}</h3>
        <p className="text-slate-400 text-sm mb-6">{t.availableVersions}</p>

        <div className="space-y-3">
          {list.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(item.version, item.cmd)}
              className="w-full text-left bg-slate-700/50 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500 p-4 rounded-xl transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 group-hover:text-blue-300">{item.version}</span>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono">
                  {item.cmd.split(' ')[0]}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersionSelector;