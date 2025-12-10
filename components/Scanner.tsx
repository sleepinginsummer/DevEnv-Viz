import React, { useState, useEffect } from 'react';
import { Platform, EnvTool } from '../types';
import { parseEnvironmentLogs } from '../services/localParser';
import { isElectron, runCommand, detectOS } from '../utils/platform';

interface ScannerProps {
  onImport: (newTools: EnvTool[]) => void;
  embedded?: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onImport, embedded = false }) => {
  const [input, setInput] = useState('');
  const [platform, setPlatform] = useState<Platform>(Platform.MAC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isElectronApp, setIsElectronApp] = useState(false);

  useEffect(() => {
    setIsElectronApp(isElectron());
    setPlatform(detectOS());
  }, []);

  const handleScan = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Local regex parsing
      const results = parseEnvironmentLogs(input, platform);
      if (results.length === 0) {
        setError("No tools detected in the text. Try pasting output from 'brew list' or 'java -version'.");
      } else {
        onImport(results);
        setInput(''); 
      }
    } catch (err) {
      setError("Failed to parse logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoScan = async () => {
    setLoading(true);
    setError(null);
    let combinedOutput = "";
    
    try {
      // Define commands to run based on OS
      // We run "version" commands AND "which/where" commands to get paths
      // We also run "Deep Scan" commands like java_home -V or pyenv versions
      
      const macDeepScan = [
        // Java
        { cmd: "java -version" },
        { cmd: "which java", label: "Java Path", prefix: "Path: " },
        { cmd: "/usr/libexec/java_home -V", label: "Java Deep Scan" },
        
        // Python
        { cmd: "python3 --version" },
        { cmd: "which python3", label: "Python Path", prefix: "Path: " },
        { cmd: "pyenv versions", label: "PyEnv Versions" },
        
        // Go
        { cmd: "go version" },
        { cmd: "which go", label: "Go Path", prefix: "Path: " },
        { cmd: "ls ~/sdk", label: "Go SDK Folder" }, // Check default go sdk folder
        
        // Node
        { cmd: "node -v" },
        { cmd: "which node", label: "Node Path", prefix: "Path: " },
        { cmd: "ls ~/.nvm/versions/node", label: "NVM Versions" }, // Check NVM folder
        
        // Brew
        { cmd: "brew list --versions" }
      ];

      const winDeepScan = [
        // Java
        { cmd: "java -version" },
        { cmd: "where java", label: "Java Path", prefix: "Path: " },
        
        // Python
        { cmd: "python --version" },
        { cmd: "where python", label: "Python Path", prefix: "Path: " },
        { cmd: "pyenv versions", label: "PyEnv Versions" },
        
        // Go
        { cmd: "go version" },
        { cmd: "where go", label: "Go Path", prefix: "Path: " },
        
        // Node
        { cmd: "node -v" },
        { cmd: "where node", label: "Node Path", prefix: "Path: " },
        { cmd: "nvm list", label: "NVM List" },
      ];

      const commands = platform === Platform.MAC ? macDeepScan : winDeepScan;

      for (const item of commands) {
        try {
          const output = await runCommand(item.cmd);
          if (output && !output.toLowerCase().includes('error')) {
            combinedOutput += `\n$ ${item.cmd}\n`;
            if (item.prefix) {
                // If we ran 'which java', prepend 'Path: ' to help the parser
                combinedOutput += `${item.prefix}${output.trim()}\n`;
            } else {
                combinedOutput += `${output}\n`;
            }
          }
        } catch (e) {
          // ignore individual failures (e.g. if pyenv is not installed)
        }
      }

      setInput(combinedOutput); // Show user what we found
      const results = parseEnvironmentLogs(combinedOutput, platform);
      
      if (results.length > 0) {
        onImport(results);
      } else {
        setError("Auto-scan finished but found no recognizable versions.");
      }

    } catch (e) {
      setError("Auto-scan failed. Are you running in the Desktop App?");
    } finally {
      setLoading(false);
    }
  };

  const macCommands = [
    { label: "Java Deep Scan", cmd: "/usr/libexec/java_home -V" },
    { label: "Brew Packages", cmd: "brew list --versions" },
    { label: "PyEnv Versions", cmd: "pyenv versions" },
    { label: "Go Version", cmd: "go version" },
    { label: "Node Version", cmd: "node -v" }
  ];

  const winCommands = [
    { label: "Java Version", cmd: "java -version" },
    { label: "Python Version", cmd: "python --version" },
    { label: "Go Version", cmd: "go version" },
    { label: "Node Version", cmd: "node -v" }
  ];

  return (
    <div className={`animate-fade-in ${embedded ? 'h-full' : 'max-w-4xl mx-auto space-y-8'}`}>
      <div className={`${embedded ? 'h-full flex flex-col' : 'bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl'}`}>
        {!embedded && (
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Environment Scanner</h2>
              <p className="text-slate-400">
                {isElectronApp 
                  ? "Click 'Auto Scan' to detect environments automatically, or paste terminal output manually." 
                  : "Paste your terminal output below to detect installed versions and paths."}
              </p>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 ${embedded ? 'lg:grid-cols-1 gap-4' : 'lg:grid-cols-3 gap-6'}`}>
          {/* Input Area */}
          <div className={`${embedded ? '' : 'lg:col-span-2'} space-y-4`}>
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-lg font-bold text-white">Scanner</h3>
               <div className="bg-slate-900/80 px-2 py-1 rounded text-xs border border-slate-700">
                <span className="text-slate-500 font-bold mr-2">OS:</span>
                <span className={`font-bold ${platform === Platform.MAC ? 'text-blue-400' : 'text-emerald-400'}`}>
                  {platform === Platform.MAC ? 'macOS' : 'Windows'}
                </span>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={platform === Platform.MAC 
                ? `Paste output here...\nExample:\nopenjdk 17.0.2 2022-01-18\nbrew list`
                : `Paste output here...\nExample:\njava version "1.8.0_201"\npython 3.9.5`
              }
              className={`w-full bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${embedded ? 'h-40' : 'h-64'}`}
            />
            
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              {isElectronApp && (
                <button
                  onClick={handleAutoScan}
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/50 flex justify-center items-center gap-2 text-sm"
                >
                  {loading ? 'Scanning...' : '🚀 Auto Scan'}
                </button>
              )}
              
              <button
                onClick={handleScan}
                disabled={loading || !input.trim()}
                className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm ${
                  loading || !input.trim()
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                }`}
              >
                🔍 Parse Log
              </button>
            </div>
          </div>

          {/* Quick Commands Helper */}
          {(!embedded || !isElectronApp) && (
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 h-fit">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                {platform === Platform.MAC ? 'Terminal Commands' : 'CMD / PowerShell'}
              </h3>
              <div className="space-y-2">
                {(platform === Platform.MAC ? macCommands : winCommands).map((item, idx) => (
                  <div key={idx} className="group cursor-pointer" onClick={() => navigator.clipboard.writeText(item.cmd)}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-blue-400">{item.label}</span>
                      <span className="text-[10px] text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                    </div>
                    <div className="bg-slate-800 p-1.5 rounded border border-slate-700 text-[10px] font-mono text-slate-400 group-hover:border-blue-500/50 group-hover:text-slate-200 transition-colors truncate">
                      {item.cmd}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;