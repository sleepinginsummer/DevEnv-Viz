const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'dist-web/icon.png'), // Will try to load icon from build folder if exists
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple demos; use preload scripts for production security
      webSecurity: false // Allow loading local resources if needed
    },
    titleBarStyle: 'hiddenInset', // Mac-style seamless title bar
    backgroundColor: '#0f172a'
  });

  // In development, load from Vite dev server
  const isDev = !app.isPackaged;
  
  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // In production, load the built html file
    win.loadFile(path.join(__dirname, 'dist-web', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});