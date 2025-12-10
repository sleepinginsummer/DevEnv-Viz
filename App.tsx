import React, { useState } from 'react';
import { EnvTool, ToolType, Language } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ToolCard from './components/ToolCard';
import CommandModal from './components/CommandModal';
import PythonManager from './components/PythonManager';
import VersionSelector from './components/VersionSelector';
import EnvVarManager from './components/EnvVarManager';
import { translations } from './utils/translations';
import { isElectron } from './utils/platform';

// Rich Mock Data
const MOCK_DATA: EnvTool[] = [
  // Java
  { id: 'j1', name: 'OpenJDK 8', type: ToolType.JAVA, version: '1.8.0_352', path: '/Library/Java/JavaVirtualMachines/temurin-8.jdk/Contents/Home', isSystemDefault: false, source: 'Homebrew', detectedAt: new Date().toISOString() },
  { id: 'j2', name: 'OpenJDK 11 (LTS)', type: ToolType.JAVA, version: '11.0.17', path: '/Users/user/.sdkman/candidates/java/11.0.17-tem', isSystemDefault: false, source: 'SDKMan', detectedAt: new Date().toISOString() },
  { id: 'j3', name: 'OpenJDK 17', type: ToolType.JAVA, version: '17.0.2', path: '/Library/Java/JavaVirtualMachines/jdk-17.0.2.jdk/Contents/Home', isSystemDefault: true, source: 'Manual', detectedAt: new Date().toISOString() },
  { id: 'j4', name: 'Oracle JDK 21', type: ToolType.JAVA, version: '21.0.1', path: '/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home', isSystemDefault: false, source: 'Manual', detectedAt: new Date().toISOString() },

  // Python
  { id: 'p1', name: 'Python 3.8', type: ToolType.PYTHON, version: '3.8.10', path: '/usr/bin/python3', isSystemDefault: true, source: 'System', detectedAt: new Date().toISOString() },
  { id: 'p2', name: 'Python 3.9', type: ToolType.PYTHON, version: '3.9.13', path: '/Users/user/.pyenv/versions/3.9.13/bin/python', isSystemDefault: false, source: 'PyEnv', detectedAt: new Date().toISOString() },
  { id: 'p3', name: 'Python 3.11', type: ToolType.PYTHON, version: '3.11.4', path: '/opt/homebrew/bin/python3.11', isSystemDefault: false, source: 'Homebrew', detectedAt: new Date().toISOString() },
  { id: 'p4', name: 'Anaconda Base', type: ToolType.PYTHON, version: '3.9.12', path: '/Users/user/opt/anaconda3/bin/python', isSystemDefault: false, source: 'Conda', detectedAt: new Date().toISOString() },

  // Node
  { id: 'n1', name: 'Node.js v14', type: ToolType.NODE, version: '14.19.1', path: '/Users/user/.nvm/versions/node/v14.19.1/bin/node', isSystemDefault: false, source: 'NVM', detectedAt: new Date().toISOString() },
  { id: 'n2', name: 'Node.js v18 (LTS)', type: ToolType.NODE, version: '18.16.0', path: '/opt/homebrew/bin/node', isSystemDefault: true, source: 'Homebrew', detectedAt: new Date().toISOString() },
  { id: 'n3', name: 'Node.js v20', type: ToolType.NODE, version: '20.5.1', path: '/Users/user/.nvm/versions/node/v20.5.1/bin/node', isSystemDefault: false, source: 'NVM', detectedAt: new Date().toISOString() },

  // Go
  { id: 'g1', name: 'Go 1.18', type: ToolType.GO, version: '1.18.3', path: '/usr/local/go/bin/go', isSystemDefault: false, source: 'System', detectedAt: new Date().toISOString() },
  { id: 'g2', name: 'Go 1.21', type: ToolType.GO, version: '1.21.0', path: '/Users/user/sdk/go1.21.0/bin/go', isSystemDefault: true, source: 'GoBrew', detectedAt: new Date().toISOString() },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // LOGIC: If running in Electron (Real App), start empty to show real system state.
  // If running in Web Browser (Dev/Preview), show Mock Data.
  const [tools, setTools] = useState<EnvTool[]>(() => {
    return isElectron() ? [] : MOCK_DATA;
  });
  
  const [language, setLanguage] = useState<Language>('zh'); 
  
  // Command Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: '', command: '', description: '', isDestructive: false });

  // Version Selector State
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<ToolType>(ToolType.JAVA);

  const t = translations[language];

  const handleImport = (newTools: EnvTool[]) => {
    setTools(prev => {
      const existingPaths = new Set(prev.map(t => t.path));
      const filteredNew = newTools.filter(t => !existingPaths.has(t.path));
      return [...prev, ...filteredNew];
    });
    // Optional: Auto-switch to first tab if tools found, or stay on dashboard
    // setActiveTab('dashboard');
  };

  const showCommand = (title: string, command: string, description: string, isDestructive: boolean = false) => {
    setModalData({ title, command, description, isDestructive });
    setModalOpen(true);
  };

  // --- Command Generators ---
  const getUninstallCmd = (tool: EnvTool) => {
    if (tool.source.toLowerCase().includes('brew')) return `brew uninstall ${tool.type.toLowerCase()}@${tool.version.split('.')[0]}`;
    if (tool.type === ToolType.NODE) return `nvm uninstall ${tool.version}`;
    if (tool.type === ToolType.PYTHON) return `pyenv uninstall ${tool.version}`;
    return `sudo rm -rf "${tool.path}"`;
  };

  const getSetGlobalCmd = (tool: EnvTool) => {
    if (tool.type === ToolType.JAVA) return `export JAVA_HOME="${tool.path}"\nexport PATH="$JAVA_HOME/bin:$PATH"`;
    if (tool.type === ToolType.GO) return `export GOROOT="${tool.path}"\nexport PATH="$GOROOT/bin:$PATH"`;
    if (tool.type === ToolType.NODE) return `nvm use ${tool.version}`;
    if (tool.type === ToolType.PYTHON) return `pyenv global ${tool.version}`; 
    return `export PATH="${tool.path}:$PATH"`;
  };

  const handleRemove = (id: string) => {
    const tool = tools.find(t => t.id === id);
    if (!tool) return;
    showCommand(
      `${t.uninstall} ${tool.name}`, 
      getUninstallCmd(tool), 
      language === 'zh' ? "请在终端执行此命令卸载，然后刷新页面。" : "Run this in terminal to uninstall, then refresh.",
      true // Destructive
    );
  };

  const handleSetGlobal = (tool: EnvTool) => {
    showCommand(
      t.setGlobal,
      getSetGlobalCmd(tool),
      language === 'zh' ? "复制命令并在终端运行以切换全局环境变量。" : "Run this to set global environment variables.",
      false
    );
  };

  const handleOpenInstallSelector = (type: string) => {
    if (Object.values(ToolType).includes(type as ToolType)) {
      setSelectorType(type as ToolType);
      setSelectorOpen(true);
    }
  };

  const handleVersionSelect = (version: string, cmd: string) => {
    setSelectorOpen(false);
    showCommand(
      `${t.installNew} ${version}`,
      cmd,
      language === 'zh' ? "复制命令到终端执行安装。" : "Run this command in terminal to install.",
      false
    );
  };

  // --- UI Rendering ---
  const toolCounts = {
    'dashboard': 0,
    'env-vars': 0,
    [ToolType.JAVA]: tools.filter(t => t.type === ToolType.JAVA).length,
    [ToolType.PYTHON]: tools.filter(t => t.type === ToolType.PYTHON).length,
    [ToolType.GO]: tools.filter(t => t.type === ToolType.GO).length,
    [ToolType.NODE]: tools.filter(t => t.type === ToolType.NODE).length,
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="h-full overflow-y-auto">
          <Dashboard tools={tools} language={language} onImport={handleImport} />
        </div>
      );
    }

    if (activeTab === 'env-vars') {
      return <EnvVarManager language={language} onRunCommand={showCommand} />;
    }

    const filteredTools = tools.filter(t => t.type === activeTab);
    
    // SPECIAL CASE: PYTHON MANAGER HANDLES EVERYTHING FOR PYTHON TAB
    if (activeTab === ToolType.PYTHON) {
      return (
        <PythonManager 
          tools={filteredTools} 
          lang={language}
          onRunCommand={showCommand}
          onRemoveTool={handleRemove}
          onSetGlobal={handleSetGlobal}
          onInstall={() => handleOpenInstallSelector(activeTab)}
        />
      );
    }

    // GENERIC LIST VIEW FOR OTHER TOOLS (Java, Go, Node) - WITH STICKY HEADER
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-none pb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {translations[language].toolNames[activeTab as ToolType]}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenInstallSelector(activeTab)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg"
              >
                <span>+</span> {t.installNew}
              </button>
              <span className="text-slate-500 text-sm bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 flex items-center shadow">
                {filteredTools.length} installed
              </span>
            </div>
          </div>
        </div>
        
        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-20 animate-fade-in">
          {filteredTools.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
              <p className="text-slate-500">{t.scanError}</p>
              <button 
                onClick={() => setActiveTab('dashboard')} // Redirect to dashboard for scanner
                className="mt-4 text-blue-400 hover:text-blue-300 font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  onRemove={() => handleRemove(tool.id)} 
                  onSetGlobal={() => handleSetGlobal(tool)}
                  setGlobalLabel={t.setGlobal}
                  activeGlobalLabel={t.currentGlobal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        toolCounts={toolCounts}
        language={language}
        setLanguage={setLanguage}
      />
      
      {/* 
        Main container fixed to screen height.
        Content inside manages its own scrolling.
      */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden p-8">
        {renderContent()}
      </main>

      {modalOpen && (
        <CommandModal 
          title={modalData.title}
          command={modalData.command}
          description={modalData.description}
          onClose={() => setModalOpen(false)}
          language={language}
          isDestructive={modalData.isDestructive}
        />
      )}

      {selectorOpen && (
        <VersionSelector
          toolType={selectorType}
          language={language}
          onSelect={handleVersionSelect}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </div>
  );
};

export default App;