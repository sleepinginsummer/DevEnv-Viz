import React, { useState, useEffect } from 'react';
import { Language, Platform } from '../types';
import { translations } from '../utils/translations';
import { detectOS, isElectron } from '../utils/platform';

interface EnvVarManagerProps {
  language: Language;
  onRunCommand: (title: string, cmd: string, desc: string, isDestructive?: boolean) => void;
}

interface EnvVar {
  key: string;
  value: string;
}

const EnvVarManager: React.FC<EnvVarManagerProps> = ({ language, onRunCommand }) => {
  const t = translations[language].envVarManager;
  const platform = detectOS();
  const [vars, setVars] = useState<EnvVar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal for adding/editing
  const [isEditMode, setIsEditMode] = useState(false);
  const [editVar, setEditVar] = useState<EnvVar>({ key: '', value: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadVars();
  }, []);

  const loadVars = () => {
    // If in Electron, we could read process.env (Node integration)
    // For Web/Demo, we mock realistic data based on OS
    if (isElectron()) {
      // In a real Electron app with contextIsolation: false, process is available
      // In safe mode, this would be via preload script
      const env = (window as any).process?.env || mockEnv(platform);
      const parsed = Object.entries(env).map(([key, value]) => ({ key, value: String(value) }));
      setVars(parsed.sort((a, b) => a.key.localeCompare(b.key)));
    } else {
      setVars(convertObjToArr(mockEnv(platform)));
    }
  };

  const mockEnv = (os: Platform) => {
    if (os === Platform.MAC) {
      return {
        PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Users/user/.nvm/versions/node/v18.16.0/bin",
        SHELL: "/bin/zsh",
        USER: "developer",
        HOME: "/Users/developer",
        JAVA_HOME: "/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home",
        LANG: "en_US.UTF-8",
        TERM: "xterm-256color",
        SSH_AUTH_SOCK: "/private/tmp/com.apple.launchd.xxx/Listeners"
      };
    } else {
      return {
        Path: "C:\\Windows\\system32;C:\\Windows;C:\\Program Files\\Java\\jdk-17\\bin;C:\\Program Files\\nodejs\\",
        OS: "Windows_NT",
        USERNAME: "Developer",
        HOMEPATH: "\\Users\\Developer",
        JAVA_HOME: "C:\\Program Files\\Java\\jdk-17",
        NUMBER_OF_PROCESSORS: "16",
        PROCESSOR_ARCHITECTURE: "AMD64",
        PSModulePath: "C:\\Program Files\\WindowsPowerShell\\Modules"
      };
    }
  };

  const convertObjToArr = (obj: Record<string, string>) => {
    return Object.entries(obj).map(([key, value]) => ({ key, value })).sort((a, b) => a.key.localeCompare(b.key));
  };

  const handleSave = () => {
    if (!editVar.key) return;

    if (platform === Platform.MAC) {
      const cmd = `echo 'export ${editVar.key}="${editVar.value}"' >> ~/.zshrc && source ~/.zshrc`;
      onRunCommand(
        isEditMode ? `${t.edit} ${editVar.key}` : t.add,
        cmd,
        t.macHint,
        false
      );
    } else {
      // Windows command
      const cmd = `setx ${editVar.key} "${editVar.value}"`;
      onRunCommand(
        isEditMode ? `${t.edit} ${editVar.key}` : t.add,
        cmd,
        t.winHint,
        false
      );
    }
    
    // Optimistic update for UI
    setVars(prev => {
      const filtered = prev.filter(v => v.key !== editVar.key);
      return [...filtered, editVar].sort((a, b) => a.key.localeCompare(b.key));
    });
    setShowModal(false);
  };

  const handleDelete = (key: string) => {
    if (platform === Platform.MAC) {
      onRunCommand(
        `${t.delete} ${key}`,
        `unset ${key} # Remove from .zshrc manually to persist`,
        "This temporarily unsets it. Please remove the export line from your config file manually.",
        true // Destructive
      );
    } else {
      onRunCommand(
        `${t.delete} ${key}`,
        `REG delete HKCU\\Environment /F /V ${key}`,
        "Deletes the user environment variable from Registry.",
        true // Destructive
      );
    }
    setVars(prev => prev.filter(v => v.key !== key));
  };

  const openAdd = () => {
    setEditVar({ key: '', value: '' });
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEdit = (v: EnvVar) => {
    setEditVar({ ...v });
    setIsEditMode(true);
    setShowModal(true);
  };

  const filteredVars = vars.filter(v => 
    v.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-none pb-6">
        <div className="flex justify-between items-center mb-4">
           <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
               {t.title}
             </h2>
             <p className="text-sm text-slate-400 mt-1">
               {platform === Platform.MAC ? "macOS (Zsh/Bash)" : "Windows (User/System)"}
             </p>
           </div>
           <button 
             onClick={openAdd}
             className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg"
           >
             <span>+</span> {t.add}
           </button>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 font-semibold w-1/4">{t.key}</th>
              <th className="p-4 font-semibold w-1/2">{t.value}</th>
              <th className="p-4 font-semibold text-right">{translations[language].manage}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredVars.map((v) => (
              <tr key={v.key} className="hover:bg-slate-700/30 group transition-colors">
                <td className="p-4 font-mono text-blue-300 font-medium select-all">{v.key}</td>
                <td className="p-4 font-mono text-slate-300 break-all select-all line-clamp-2 max-w-xl block mt-2">
                  {v.value}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEdit(v)}
                      className="px-3 py-1 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      {t.edit}
                    </button>
                    <button 
                      onClick={() => handleDelete(v.key)}
                      className="px-3 py-1 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      {t.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredVars.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500 italic">
                  No matching variables found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {isEditMode ? t.edit : t.add}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t.key}</label>
                <input 
                  type="text" 
                  value={editVar.key}
                  onChange={(e) => setEditVar({...editVar, key: e.target.value})}
                  disabled={isEditMode}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-slate-200 font-mono disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t.value}</label>
                <textarea 
                  value={editVar.value}
                  onChange={(e) => setEditVar({...editVar, value: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-slate-200 font-mono h-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!editVar.key}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.copyCmd}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvVarManager;