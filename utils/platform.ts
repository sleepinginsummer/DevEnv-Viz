import { Platform } from '../types';

export const isElectron = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf(' electron/') > -1;
};

export const detectOS = (): Platform => {
  if (typeof navigator === 'undefined') return Platform.MAC;
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return Platform.WINDOWS;
  return Platform.MAC;
};

export const runCommand = async (cmd: string): Promise<string> => {
  if (!isElectron()) {
    // SIMULATION MODE FOR WEB PREVIEW
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`[Web Simulation] Command executed successfully:\n$ ${cmd}\n\n(In the desktop app, this would execute locally.)`);
      }, 1000);
    });
  }
  
  // Dynamic import to avoid breaking Vite in web mode
  try {
    // Fix: Property 'require' does not exist on type 'Window & typeof globalThis'
    const { exec } = (window as any).require('child_process');
    const os = detectOS();
    
    // On macOS/Linux, wrap in a login shell to ensure PATH is loaded from .zshrc/.bash_profile
    // On Windows, use default shell
    const finalCmd = os === Platform.MAC 
      ? `/bin/zsh -l -c "${cmd.replace(/"/g, '\\"')}"`
      : cmd;

    return new Promise((resolve, reject) => {
      exec(finalCmd, (error: any, stdout: string, stderr: string) => {
        if (error) {
          // Some commands output version info to stderr (like java -version), which is not an error.
          // If we have stderr but no error code/signal implies it might be just info, 
          // BUT exec returns 'error' object if the command exits with non-zero.
          
          // If we have useful info in stderr, return it.
          if (stderr && !stdout) {
             // Heuristic: if it says "command not found", it's a real error.
             if (stderr.toLowerCase().includes('not found') || stderr.toLowerCase().includes('error')) {
               resolve(`Error: ${stderr}`);
             } else {
               // Otherwise, treat stderr as output (common for version commands)
               resolve(stderr);
             }
             return;
          }
          
          resolve(`Execution Error (Code ${error.code}):\n${stderr || error.message}`);
          return;
        }
        resolve(stdout || stderr || "Success (No Output)");
      });
    });
  } catch (e: any) {
    console.error("Electron require failed", e);
    return `System Interface Error: ${e.message}`;
  }
};