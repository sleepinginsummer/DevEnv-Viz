const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');

// Embedded Blue Gear Icon (Base64) for immediate dev feedback without external files
const ICON_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABGUUKwAAAEtElEQVR4Ae2bT2gcVRzHf29mNv+0iX9qbbW1FhFvPSh41IsvCgU9eCqeFBEvOQjiqQcR9iCiBw+eFBEv3jx4FEG8eFIEwYMiWltbW9vEpM3uZOZ3fTO7s7uzMztpY5v5vjDszO7OvPf7/H7v9/u93ST0aU+B+hS4t1OAKcAUYApwbyfwh3R/+vjIe2tK8rO25B1V8p621Jc1qS9p4l/SxB9V8d+p4r/T5O+q5L/WlORn08dH3v3D/j32gE8eH1muS31eE3+qLfmsLe3Z4QG08Z+r4n9Sxb/S4B9uyN+X+91z4wF88vjIclv8OU38mbbk3Ts9yV3w/138K6r4F1Txz6/L33e7Md0YwH0jIy+2pL6kiT/flrR7F6ZwV/138a+p4p9Tk7/y+1L/9W60dy2A+0dG3tCWfE6TfLEtadcuzOJu+6+J/1kV/6wa/8y6/P2tXe3uCoBPHh9Zrou/0JZ8oX1nJ7D1h6r4H1XxT67L31+362VbAHz6+Mh7denPaUve1747U9j+Y1X8D1T8E1tL/a0A+OTxkeV18Zc08efaOzeBnT9Vxb+kxt9cl7+/2K6HrQD41PGRd9alvqgt+WD77kxxy49V8c+r4p/YWAW0AuDTx0feXZf6qib+QvuuTPHOn6riX1Djv7+xCmglwF1S/2hLPr6r07v7iz+nin9mYxXQCoBPjI68qS7+qiZ+7+4v8e4v/Kkq/hlV/FPrq4BWAHz6+Mh761Jf08Sfae/OFG//iSr+eTX++fVVQCsA7h8ZeUNb8iVN/IX23Zni7T9TxT+nxn9vfRXQCoBPHB9Zrou/qok/2747U7z9Z6r4H6r476+vAloB8MmjI8t18dc08e+0d2eKt/9cFf+jGv/M+iqgFQB3S/1TTfxH2ndniresinxGjf/B+iqgFQCfOD6yXBf/gSb+4vbdmeLdV8U/r4p/en0V0AqAT4yOvKku/pYm/lR7d6Z4+89V8c+q4p9aXwW0AuDTo6Ovqov/VBN/vn13pnj7L1Txz6rx319fBbQC4JNHR5br4j/TxF9s784Ub/+FKv5HNf6Z9VVAKwD+H6l/VBP/YXvnJvDOn6vin1PjX9hYBbQC4FNHRl6pS31TE3++fVemeOdPVfEvqPG/31gFtALgU0dH3q5LfUOT/FL7rkzx9l+o4l9Q43+wsQpoBcDdR0Ze35b8S038x+27M8U7f6aKf16Nf2FjFbD1jch/u/j00ZHlOvkrmvib7Z2bwM6fquJ/VOMfX5e/r96qj20B+NTRkbfqUr+tib/c3r0J7PyJKv55Nf65dfl7c7ueti0A/o+PjLzUlvx7Tfyl9t14C9u/r4p/Xo1/el3+3rCrnTsC4JNHR5bXxd/QxH/SvjtTvP2Xqvgf1fjn1+XvL+1q544AuFvqpzTxn7fvzhTv/HlV/HNq/PP35O/tuzWbG98J+uTRkeU6+Rua+EvtnZvAzl+o4n9U4x9fl7+v7NbTro8BFzTxl9u7N4GdP1HF/6DG/2C3p/f/C/w/7t+5/50CTAGmAFOAe3cC/wL30lI5l+h/NwAAAABJRU5ErkJggg==';

function createWindow() {
  // Create native image from base64
  const icon = nativeImage.createFromDataURL(ICON_BASE64);

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: icon, // Use native image object
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
      webSecurity: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f172a'
  });

  // Explicitly set Dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.setIcon(icon);
  }

  const isDev = !app.isPackaged;
  
  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
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