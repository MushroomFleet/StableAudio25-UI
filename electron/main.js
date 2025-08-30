import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import findFreePort from 'find-free-port';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object
let mainWindow;
let serverProcess;
let serverPort = 5000;

const isDev = process.argv.includes('--dev');
const isPackaged = app.isPackaged;

// Get the correct paths for different environments
function getServerPath() {
  if (isDev) {
    // Development mode - use the Electron server
    return path.join(__dirname, 'server/src/server.js');
  } else if (isPackaged) {
    // Packaged app - server is in resources
    return path.join(process.resourcesPath, 'server/src/server.js');
  } else {
    // Running from SA25-desktop folder
    return path.join(__dirname, 'server/src/server.js');
  }
}

function getDistPath() {
  if (isDev) {
    // In dev mode, build the client first or serve from dist
    return path.join(__dirname, '../dist');
  } else {
    return path.join(__dirname, '../dist');
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Allow loading from localhost
      allowRunningInsecureContent: true, // Allow HTTP content
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../resources/icon.png'),
    show: false, // Don't show until ready
    titleBarStyle: 'default'
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on the window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Load the app
  const startUrl = `http://localhost:${serverPort}`;
  
  // Wait a bit for server to start, then load the page
  setTimeout(() => {
    mainWindow.loadURL(startUrl).catch(err => {
      console.error('Failed to load URL:', err);
      // If loading fails, try to load a local error page or show a dialog
      dialog.showErrorBox('Failed to Start', 'Could not start the application server.');
    });
  }, 2000);

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

async function startServer() {
  try {
    // Find a free port
    const [freePort] = await findFreePort(5000, 5010);
    serverPort = freePort;
    
    const serverPath = getServerPath();
    console.log('Starting server from:', serverPath);
    console.log('Server port:', serverPort);
    
    // Set environment variables
    const env = {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      PORT: serverPort.toString(),
      ELECTRON_APP: 'true'
    };

    // Copy .env file if it exists
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n').filter(line => line.includes('='));
      envVars.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          env[key.trim()] = value.trim();
        }
      });
    }

    // Start the server process
    serverProcess = spawn('node', [serverPath], {
      env,
      stdio: isDev ? 'inherit' : 'pipe',
      cwd: path.dirname(serverPath), // Set working directory to server directory
      shell: true // Use shell to ensure proper process spawning
    });

    serverProcess.on('error', (err) => {
      console.error('Server process error:', err);
      dialog.showErrorBox('Server Error', 'Failed to start the application server.');
    });

    serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code ${code}`);
    });

    // Give the server time to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error('Failed to start server:', error);
    dialog.showErrorBox('Startup Error', 'Failed to start the application server.');
  }
}

// App event handlers
app.whenReady().then(async () => {
  await startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Kill server process
  if (serverProcess) {
    serverProcess.kill();
  }
  
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Clean up server process
  if (serverProcess) {
    serverProcess.kill();
  }
});

// IPC handlers
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    serverPort: serverPort
  };
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('download-file', async (event, { url, filename }) => {
  try {
    // Show save dialog to let user choose location
    const saveResult = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Audio File',
      defaultPath: filename,
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (saveResult.canceled) {
      return { success: false, canceled: true };
    }

    // Get the full URL for the file
    const fullUrl = `http://localhost:${serverPort}${url}`;
    
    // Use the downloadURL method
    await mainWindow.webContents.session.downloadURL(fullUrl);
    
    return { success: true, path: saveResult.filePath };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error: error.message };
  }
});

// Handle app protocol for deep linking (optional future feature)
app.setAsDefaultProtocolClient('sa25-desktop');
