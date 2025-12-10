import React, { useState, useEffect } from 'react';
import { isElectron, runCommand } from '../utils/platform';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface CommandModalProps {
  title: string;
  command: string;
  description: string;
  onClose: () => void;
  language?: Language; // Optional prop to support translations
}

const CommandModal: React.FC<CommandModalProps> = ({ title, command, description, onClose, language = 'en' }) => {
  const [canRun, setCanRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  
  // Fallback to English if language prop not passed (legacy support)
  const t = translations[language]?.commandModal || translations['en'].commandModal;

  useEffect(() => {
    setCanRun(isElectron());
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await runCommand(command);
      setOutput(result);
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full p-6 relative flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6">{description}</p>

        {/* Command Display */}
        <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto border border-slate-800 relative group shrink-0">
          <pre>{command}</pre>
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
          >
            {t.copy}
          </button>
        </div>

        {/* Execution Output */}
        {output && (
          <div className="mt-4 flex-1 overflow-hidden flex flex-col">
            <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{t.output}</h4>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 border border-slate-700 overflow-y-auto min-h-[100px] max-h-[200px] whitespace-pre-wrap">
              {output}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-700">
           <div>
             {canRun && command.includes('sudo') && (
               <span className="text-xs text-amber-500/80 hidden md:block">{t.errorHint}</span>
             )}
           </div>

           <div className="flex gap-3">
            {canRun && (
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                  isRunning ? 'bg-blue-800 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 shadow-lg'
                }`}
              >
                {isRunning ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    {t.running}
                  </>
                ) : (
                  <>
                    <span>⚡</span> {t.run}
                  </>
                )}
              </button>
            )}
            
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandModal;