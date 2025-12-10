import React, { useState, useEffect } from 'react';
import { EnvTool, PipPackage, Language } from '../types';
import { translations } from '../utils/translations';
import { parsePipPackages } from '../services/localParser';
import { isElectron, runCommand } from '../utils/platform';
import ToolCard from './ToolCard';

interface PythonManagerProps {
  tools: EnvTool[];
  lang: Language;
  onRunCommand: (title: string, cmd: string, desc: string, isDestructive?: boolean) => void;
  onRemoveTool: (id: string) => void;
  onSetGlobal: (tool: EnvTool) => void;
  onInstall: () => void;
}

const PythonManager: React.FC<PythonManagerProps> = ({ 
  tools, 
  lang, 
  onRunCommand, 
  onRemoveTool, 
  onSetGlobal,
  onInstall
}) => {
  const t = translations[lang].pythonManager;
  const tm = translations[lang].mirrors;
  const tRoot = translations[lang]; // Access global translations for 'Set Global'
  const [activeSubTab, setActiveSubTab] = useState<'versions' | 'packages' | 'mirrors'>('versions');
  const [pipInput, setPipInput] = useState('');
  const [packages, setPackages] = useState<PipPackage[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isElectronApp, setIsElectronApp] = useState(false);
  const [currentMirrorUrl, setCurrentMirrorUrl] = useState<string>('---');

  useEffect(() => {
    setIsElectronApp(isElectron());
    
    // Auto-actions when switching tabs
    if (activeSubTab === 'packages' && isElectron() && packages.length === 0) {
      handleAutoScanPip();
    }
    if (activeSubTab === 'mirrors') {
      fetchCurrentMirror();
    }
  }, [activeSubTab]);

  const mirrors = [
    { name: tm.official, url: 'https://pypi.org/simple' },
    { name: tm.tuna, url: 'https://pypi.tuna.tsinghua.edu.cn/simple' },
    { name: tm.aliyun, url: 'http://mirrors.aliyun.com/pypi/simple/' },
    { name: tm.douban, url: 'http://pypi.douban.com/simple/' },
  ];

  const fetchCurrentMirror = async () => {
    if (!isElectron()) {
      setCurrentMirrorUrl("https://pypi.org/simple (Web Mock)");
      return;
    }
    try {
      const output = await runCommand('pip config get global.index-url');
      // pip config get usually returns the url or an error if not set
      if (output && !output.toLowerCase().includes('error') && output.trim() !== '') {
        setCurrentMirrorUrl(output.trim());
      } else {
        setCurrentMirrorUrl('Default (Not Set)');
      }
    } catch (e) {
      setCurrentMirrorUrl('Default (Not Set)');
    }
  };

  const handleSetMirror = (url: string) => {
    onRunCommand(
      t.setMirror,
      `pip config set global.index-url ${url}`,
      "Run this command to change your global PyPI mirror source for faster downloads.",
      false
    );
  };

  const handleAutoScanPip = async () => {
    setIsScanning(true);
    try {
      const output = await runCommand('pip list');
      setPipInput(output);
      const pkgs = parsePipPackages(output);
      setPackages(pkgs);
    } catch (e) {
      console.error("Pip scan failed", e);
    } finally {
      setIsScanning(false);
    }
  }

  const handleManualScanPip = async () => {
    if (!pipInput.trim()) return;
    setIsScanning(true);
    try {
      const pkgs = parsePipPackages(pipInput);
      setPackages(pkgs);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUninstallPkg = (pkgName: string) => {
    onRunCommand(
      `${t.uninstall} ${pkgName}`,
      `pip uninstall ${pkgName}`,
      "Run this command to remove the package.",
      true // Destructive
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Static Header Section */}
      <div className="flex-none pb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {translations[lang].toolNames.PYTHON}
          </h2>
          <button 
            onClick={onInstall}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg"
          >
            <span>+</span> {translations[lang].installNew}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg w-fit border border-slate-700">
           <button
            onClick={() => setActiveSubTab('versions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSubTab === 'versions' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {translations[lang].version}
          </button>
          <button
            onClick={() => setActiveSubTab('mirrors')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSubTab === 'mirrors' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {t.mirrors}
          </button>
          <button
            onClick={() => setActiveSubTab('packages')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSubTab === 'packages' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {t.packages}
          </button>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto min-h-0 animate-fade-in pr-2">
        
        {/* === VERSIONS TAB === */}
        {activeSubTab === 'versions' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
           {tools.length === 0 ? (
             <p className="text-slate-500 italic col-span-full text-center py-10">No Python versions detected.</p>
           ) : (
             tools.map(tool => (
               <ToolCard 
                 key={tool.id} 
                 tool={tool} 
                 onRemove={() => onRemoveTool(tool.id)}
                 onSetGlobal={() => onSetGlobal(tool)}
                 setGlobalLabel={tRoot.setGlobal}
                 activeGlobalLabel={tRoot.currentGlobal}
               />
             ))
           )}
         </div>
        )}

        {/* === MIRRORS TAB === */}
        {activeSubTab === 'mirrors' && (
          <div className="pb-20 space-y-6">
            {/* Current Mirror Status Display */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-blue-500/30 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-100 transition-opacity">
                <button 
                  onClick={fetchCurrentMirror}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                  title="Refresh Current Mirror"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{t.currentMirror}</h3>
                  <p className="text-lg md:text-xl font-mono text-emerald-400 font-medium break-all">{currentMirrorUrl}</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Switch Mirror Source</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mirrors.map((mirror, idx) => (
                <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between hover:border-slate-500 transition-colors group">
                  <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{mirror.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-1 break-all">{mirror.url}</p>
                  </div>
                  <button
                    onClick={() => handleSetMirror(mirror.url)}
                    className="mt-4 w-full py-2 bg-slate-700 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                  >
                    {t.setMirror}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PACKAGES TAB === */}
        {activeSubTab === 'packages' && (
          <div className="space-y-4 pb-20">
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col h-full max-h-[calc(100vh-200px)]">
               {isElectronApp ? (
                 <div className="flex-none flex justify-between items-center mb-4">
                   <p className="text-sm text-slate-400">
                     Automatically detected packages via <code className="bg-slate-900 px-1 py-0.5 rounded">pip list</code>
                   </p>
                   <button 
                     onClick={handleAutoScanPip}
                     disabled={isScanning}
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2"
                   >
                     {isScanning && <span className="animate-spin">⟳</span>}
                     Refresh
                   </button>
                 </div>
               ) : (
                 <div className="flex-none mb-4">
                   <textarea
                     value={pipInput}
                     onChange={(e) => setPipInput(e.target.value)}
                     placeholder={t.pastePip}
                     className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                   />
                   <div className="mt-2 flex justify-end">
                     <button 
                      onClick={handleManualScanPip}
                      disabled={isScanning || !pipInput}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                     >
                       {t.scanPackages}
                     </button>
                   </div>
                 </div>
               )}

               {/* Results Table (Scrollable inside the container) */}
               {packages.length > 0 ? (
                 <div className="flex-1 overflow-y-auto bg-slate-900 rounded-lg border border-slate-700">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-950 text-slate-400 sticky top-0 z-10 shadow">
                       <tr>
                         <th className="p-3">{t.pkgName}</th>
                         <th className="p-3">{t.pkgVersion}</th>
                         <th className="p-3 text-right">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800">
                       {packages.map((pkg, idx) => (
                         <tr key={idx} className="hover:bg-slate-800/50">
                           <td className="p-3 text-slate-200 font-mono flex items-center gap-2">
                             {pkg.name}
                             {pkg.isBuiltIn && <span className="text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">CORE</span>}
                           </td>
                           <td className="p-3 text-slate-400 font-mono">{pkg.version}</td>
                           <td className="p-3 text-right">
                             {!pkg.isBuiltIn && (
                               <button 
                                onClick={() => handleUninstallPkg(pkg.name)}
                                className="text-red-400 hover:text-red-300 text-xs hover:underline"
                               >
                                 {t.uninstall}
                               </button>
                             )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 !isScanning && <p className="text-center text-slate-500 py-8">No packages loaded.</p>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PythonManager;