import { Platform } from '../types';

export const isElectron = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf(' electron/') > -1;
};

export const runCommand = async (cmd: string): Promise<string> => {
  if (!isElectron()) {
    throw new Error("Web mode: Cannot execute system commands.");
  }
  
  // Dynamic import to avoid breaking Vite in web mode
  // In Electron with nodeIntegration: true, window.require is available
  try {
    const { exec } = window.require('child_process');
    return new Promise((resolve, reject) => {
      exec(cmd, (error: any, stdout: string, stderr: string) => {
        if (error) {
          // Some commands output version to stderr (like java -version)
          if (stderr && !stdout && !error.message.includes('Command failed')) {
             resolve(stderr);
             return;
          }
          // For explicit execution, we want to know it failed
          resolve(`Error Code: ${error.code}\n${stderr || error.message}`);
          return;
        }
        resolve(stdout || stderr || "Success (No Output)");
      });
    });
  } catch (e: any) {
    console.error("Electron require failed", e);
    return `Execution System Error: ${e.message}`;
  }
};

export const detectOS = (): Platform => {
  if (typeof navigator === 'undefined') return Platform.MAC;
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return Platform.WINDOWS;
  return Platform.MAC;
};