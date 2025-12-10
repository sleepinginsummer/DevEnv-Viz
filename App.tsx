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
  { id: 'g2', name: 'Go 1.21', type: ToolType.GO, version: '1.21.0', path: '/opt/homebrew/Cellar/go/1.21.0/bin/go', isSystemDefault: true, source: 'Homebrew', detectedAt: new Date().toISOString() },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [tools, setTools] = useState<EnvTool[]>(isElectron() ? [] : MOCK_DATA);
  
  // Command Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: '', cmd: '', desc: '', isDestructive: false });
  
  // Version Selector State
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorTool, setSelectorTool] = useState<ToolType>(ToolType.UNKNOWN);

  const t = translations[language];

  const handleImport = (newTools: EnvTool[]) => {
    // Merge new tools with existing ones
    setTools(prev => {
      const unique = [...prev];
      newTools.forEach(nt => {
        if (!unique.find(u => u.id === nt.id || (u.type === nt.type && u.version === nt.version))) {
          unique.push(nt);
        }
      });
      return unique;
    });
  };

  const handleRemove = (id: string) => {
    showCommand(
      translations[language].uninstall,
      `echo "Simulating removal of tool ID: ${id}"`, // In real app, this would be specific uninstall cmd
      "This will remove the selected environment version.",
      true // isDestructive
    );
    setTools(prev => prev.filter(t => t.id !== id));
  };

  const showCommand = (title: string, cmd: string, desc: string, isDestructive: boolean = false) => {
    setModalData({ title, cmd, desc, isDestructive });
    setModalOpen(true);
  };

  const handleSetGlobal = (tool: EnvTool) => {
    let cmd = '';
    let hint = '';

    if (tool.type === ToolType.JAVA) {
      cmd = `export JAVA_HOME="${tool.path}" && export PATH="$JAVA_HOME/bin:$PATH"`;
      hint = "Updates JAVA_HOME in your current session. Add to ~/.zshrc to make permanent.";
    } else if (tool.type === ToolType.PYTHON) {
      if (tool.source === 'PyEnv') {
        cmd = `pyenv global ${tool.version}`;
        hint = "Sets global python version via PyEnv.";
      } else {
        cmd = `alias python="${tool.path}"`;
        hint = "Sets python alias.";
      }
    } else if (tool.type === ToolType.NODE) {
      if (tool.source === 'NVM') {
        cmd = `nvm use ${tool.version} && nvm alias default ${tool.version}`;
        hint = "Switches Node version via NVM and sets as default.";
      } else {
        cmd = `export PATH="${tool.path.replace('/bin/node', '/bin')}:$PATH"`;
        hint = "Updates PATH to prioritize this Node version.";
      }
    } else if (tool.type === ToolType.GO) {
      cmd = `export PATH="${tool.path.replace('/bin/go', '/bin')}:$PATH"`;
      hint = "Updates PATH to use this Go version.";
    }

    showCommand(translations[language].setGlobal, cmd, hint);
  };

  const handleInstallClick = (type: ToolType) => {
    setSelectorTool(type);
    setSelectorOpen(true);
  };

  const handleVersionSelect = (version: string, cmd: string) => {
    setSelectorOpen(false);
    showCommand(
      `${translations[language].installNew} ${version}`,
      cmd,
      "Run this command to install the selected version."
    );
  };

  const toolCounts = {
    dashboard: 0,
    'env-vars': 0,
    [ToolType.JAVA]: tools.filter(t => t.type === ToolType.JAVA).length,
    [ToolType.PYTHON]: tools.filter(t => t.type === ToolType.PYTHON).length,
    [ToolType.GO]: tools.filter(t => t.type === ToolType.GO).length,
    [ToolType.NODE]: tools.filter(t => t.type === ToolType.NODE).length,
    [ToolType.UNKNOWN]: 0
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tools={tools} language={language} onImport={handleImport} />;
      case 'env-vars':
        return <EnvVarManager language={language} onRunCommand={showCommand} />;
      case ToolType.PYTHON:
        return (
          <PythonManager 
            tools={tools.filter(t => t.type === ToolType.PYTHON)} 
            lang={language}
            onRunCommand={showCommand}
            onRemoveTool={handleRemove}
            onSetGlobal={handleSetGlobal}
            onInstall={() => handleInstallClick(ToolType.PYTHON)}
          />
        );
      case ToolType.JAVA:
      case ToolType.GO:
      case ToolType.NODE:
        const currentTools = tools.filter(t => t.type === activeTab);
        return (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-none pb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                   {translations[language].toolNames[activeTab as ToolType]}
                </h2>
                <button 
                  onClick={() => handleInstallClick(activeTab as ToolType)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg"
                >
                  <span>+</span> {translations[language].installNew}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0 animate-fade-in pr-2 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTools.length === 0 ? (
                  <p className="text-slate-500 italic col-span-full text-center py-10">No versions detected.</p>
                ) : (
                  currentTools.map(tool => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      onRemove={handleRemove}
                      onSetGlobal={() => handleSetGlobal(tool)}
                      setGlobalLabel={translations[language].setGlobal}
                      activeGlobalLabel={translations[language].currentGlobal}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        );
      default:
        return <div className="text-white">Select a tool</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        toolCounts={toolCounts}
        language={language}
        setLanguage={setLanguage}
      />
      
      {/* 
        Main Content Area 
        WebkitAppRegion: 'drag' makes the container draggable (like a title bar).
      */}
      <main className="flex-1 relative bg-slate-900 overflow-hidden" style={{ WebkitAppRegion: 'drag' } as any}>
        <div className="absolute inset-0 p-8 overflow-hidden flex flex-col" style={{ WebkitAppRegion: 'no-drag' } as any}>
          {renderContent()}
        </div>
      </main>

      {modalOpen && (
        <CommandModal 
          title={modalData.title}
          command={modalData.cmd}
          description={modalData.desc}
          isDestructive={modalData.isDestructive}
          onClose={() => setModalOpen(false)}
          language={language}
        />
      )}

      {selectorOpen && (
        <VersionSelector
          toolType={selectorTool}
          language={language}
          onSelect={handleVersionSelect}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </div>
  );
};

export default App;