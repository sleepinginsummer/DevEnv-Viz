import React, { useState } from 'react';
import { runCommand } from '../utils/platform';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface CommandModalProps {
  title: string;
  command: string;
  description: string;
  onClose: () => void;
  language?: Language;
  isDestructive?: boolean;
}

const CommandModal: React.FC<CommandModalProps> = ({ title, command, description, onClose, language = 'en', isDestructive = false }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const t = translations[language]?.commandModal || translations['en'].commandModal;

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
  };

  const initiateRun = () => {
    if (isDestructive) {
      setShowConfirm(true);
    } else {
      executeCommand();
    }
  };

  const executeCommand = async () => {
    setShowConfirm(false);
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
        
        {!showConfirm ? (
          <>
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
                {command.includes('sudo') && (
                  <span className="text-xs text-amber-500/80 hidden md:block">{t.errorHint}</span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={initiateRun}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                    isRunning 
                      ? 'bg-blue-800 cursor-wait' 
                      : isDestructive 
                        ? 'bg-red-600 hover:bg-red-500 shadow-lg' 
                        : 'bg-blue-600 hover:bg-blue-500 shadow-lg'
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
                
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Confirmation View
          <div className="text-center py-6">
             <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">{t.confirmTitle}</h3>
             <p className="text-slate-400 mb-8">{t.confirmText}</p>
             <div className="flex justify-center gap-4">
               <button 
                 onClick={() => setShowConfirm(false)}
                 className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
               >
                 {t.confirmNo}
               </button>
               <button 
                 onClick={executeCommand}
                 className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg"
               >
                 {t.confirmYes}
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandModal;