import { app, BrowserWindow, shell, ipcMain, utilityProcess } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs'
import os from 'node:os'
import { dbInit } from './db/dbInit'
import dotenv from 'dotenv'
import log from './logger/index'
import { SESSION_ID } from './utils/constants'
import short from 'short-uuid'

const mainLogger = log.scope('main/index.ts')

// CONFIGURE: environment variables ###########################################
const isProd = app.isPackaged
const envPath = isProd ? `.env.production` : `.env.development`

// Attempts to load an environment file from the paths determined by getEnvPaths.
// It stops at the first valid .env file found.
let envLoaded = false

try {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    envLoaded = true
  }
} catch (err) {
  mainLogger.error(`No environment file found at:`, envPath)
  process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Sets up essential environment variables for paths used throughout the application.
// APP_ROOT: The root directory of the application.
// DIST: The directory containing the bundled front-end code for the renderer process.
// VITE_PUBLIC: The directory for static public assets. In development, this points to 'public',
//              and in production, it points to the 'dist' directory.
process.env.APP_ROOT = path.join(__dirname, '../..')
process.env.DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : process.env.DIST


let win: BrowserWindow | null = null

// Defines the path to the preload script.
// The preload script runs in a privileged environment and can bridge the gap
// between the sandboxed renderer process and the Node.js environment of the main process.
const preloadPath = path.join(__dirname, '../preload/index.js')

// Helper function to parse log lines from utility process stdout - REMOVED

// Creates the main application window.
async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      // Specifies the preload script to be loaded before other scripts in the renderer process.
      preload: preloadPath,
      // Enables Node.js integration in the renderer process.
      // IMPORTANT: This should be used with caution, especially if loading remote content,
      // as it can pose security risks. just disabling it.
      nodeIntegration: false,
      // Enables context isolation, which creates a separate JavaScript context for the preload script.
      // This is a security measure that helps prevent the preload script from leaking privileged APIs
      // to the renderer process's untrusted web content. It is highly recommended to keep this true.
      contextIsolation: true,
    },
  })

  // Opens the Developer Tools in development mode for easier debugging.
  if (process.env.NODE_ENV !== 'production') {
    win.webContents.openDevTools()
  }

  // Configures how new windows are opened.
  // This handler ensures that external links (starting with "https:")
  // are opened in the system's default web browser instead of a new Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Handles the event where the renderer process crashes.
  // Logs the error for debugging purposes.
  win.webContents.on('render-process-gone', (event, details) => {
    mainLogger.error(`Renderer process crashed:`, details)
  })

  // Handles the event where the window fails to load content.
  // Logs the error for debugging purposes.
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    mainLogger.error(`Failed to load:`, { errorCode, errorDescription })
  })

  // Loads the content for the window.
  // If a Vite development server URL is available (development mode), it loads that URL.
  // Otherwise (production mode), it attempts to load the local index.html file from the 'dist' directory.
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    // Checks if the main HTML file (index.html) exists in the expected production build directory.
    const indexPath = path.join(process.env.DIST, 'index.html')
    
    if (fs.existsSync(indexPath)) {      
      win.loadFile(indexPath)
    } else {
      mainLogger.error(`Index file not found at: ${indexPath}. This is the expected location for the production build.`)
      // If index.html is not found, display a user-friendly error page.
      const errorHtml = `
        <html>
          <body style="background: #f44336; color: white; font-family: sans-serif; padding: 20px; text-align: center;">
            <h1>Application Error</h1>
            <p>Could not load the application's main page (index.html).</p>
            <p>The file was not found in the expected directory:</p>
            <p><code>${process.env.DIST}</code></p>
            <p>Please ensure the application has been built correctly and all necessary files are present.</p>
          </body>
        </html>
      `
      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`)
    }
  }
}

// This block executes when the Electron application is ready.
// It's the primary place to initialize application components like the database and create the main window.
app.whenReady().then(async () => {
  mainLogger.info('🎉🎉 App is ready')
  try {
    // Initializes the database. This could involve setting up connections,
    // running migrations, or other database-related tasks.
    mainLogger.info('🔎🔎 Initializing database...')
    await dbInit()
    mainLogger.info('🎉🎉 Database initialized successfully')
    
    // Creates the main application window after the database is initialized.
    await createWindow()  
  } catch (error) {
    mainLogger.error('🚨🚨 Failed to initialize application:', error)
    app.quit()
  }
})

// Handles the 'activate' event, which is typically triggered when the application's
// icon is clicked in the dock (macOS) and there are no windows open.
// It creates a new window if none exist.
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// Handles the 'window-all-closed' event, which is triggered when all application windows are closed.
// It quits the application, except on macOS where applications typically stay active
// even without open windows.
app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

// Handles the 'second-instance' event, which is triggered when a user tries to open
// a second instance of the application while one is already running.
// It focuses the existing main window instead of creating a new one.
app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

// Sets up an IPC (Inter-Process Communication) handler for the 'open-win' channel.
// This allows the renderer process to request the main process to open a new window.
// The 'arg' parameter can be used to pass data (e.g., a URL or route) to the new window.
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      // Enabling Node.js integration and disabling context isolation for child windows
      // carries the same security considerations as for the main window.
      // Evaluate if these are strictly necessary for the child window's functionality.
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(path.join(process.env.DIST, 'index.html'), { hash: arg })
  }
})

ipcMain.handle('launch-counter-utility', async () => {
  mainLogger.info(`Received request to launch counter utility process.`)
  try {
    launchCounterUtilityProcess()
    return { success: true, message: 'Counter utility process launched.' }
  } catch (error) {
    return { success: false, message: 'Failed to launch counter utility process.', error: error.message }
  }
})

function launchCounterUtilityProcess() {
  const utilityCounterPath = path.join(__dirname, 'utilityCounter.js')
  mainLogger.info(`Launching counter utility process from: ${utilityCounterPath}`)

  const execArguments = process.env.VSCODE_DEBUG === 'true' ? ['--inspect-brk=9230'] : [];
  mainLogger.info(`Utility process execArgv: ${JSON.stringify(execArguments)}`);

  const child = utilityProcess.fork(utilityCounterPath, [], {
    stdio: 'pipe', // Keep as pipe to allow message passing, but stdout/stderr listeners will be removed
    execArgv: execArguments,
    env: {
      ...process.env,
      SESSION_ID: SESSION_ID,
      UTILITY_PROCESS_ID: short.generate()
    }
  })

  // REMOVED stdout listener

  // REMOVED stderr listener, but will keep general error logging for the process itself
  child.stderr?.on('data', (data) => {
    // This will now only capture truly unformatted stderr output if the utility's logger fails or isn't used
    mainLogger.error(`[UtilityCounter RAW STDERR]: ${data.toString().trim()}`);
  })

  child.on('message', (message) => {
    mainLogger.info('WE GOT A MESSAGE FROM THE CHILD UTILITY PROCESS?', message)
    mainLogger.info('FUCK I AM NOW HERE - 1')

    if (message.type === 'count') {
     mainLogger.info(
        { utilityId: message.utilityId },
        `[${message.utilityId}] Utility process count: ${message.value}`
      );
    } else if (message.type === 'done') {
     mainLogger.info(
        { utilityId: message.utilityId },
        `[${message.utilityId}] Utility process finished counting. Final count: ${message.value}`
      );
    } else if (message.type === 'error') {
      mainLogger.error(
        { utilityId: message.utilityId },
        `[${message.utilityId}] Utility process error: ${message.value}`
      );
    }
  })

  child.on('exit', (code) => {
    if (code !== 0) {
      mainLogger.error(`Counter utility process exited with code ${code}`);
    } else {
      mainLogger.info(`Counter utility process exited successfully.`);
    }
  })
}

ipcMain.handle('launch-rng-utility', async () => {
  mainLogger.info(`Received request to launch RNG utility process.`)
  try {
    launchRngUtilityProcess()
    return { success: true, message: 'RNG utility process launched.' }
  } catch (error) {
    mainLogger.error(`Failed to launch RNG utility process:`, error)
    return { success: false, message: 'Failed to launch RNG utility process.', error: error.message }
  }
})

function launchRngUtilityProcess() {
  const utilityRngPath = path.join(__dirname, 'utilityRng.js')
  mainLogger.info(`Launching RNG utility process from: ${utilityRngPath}`)

  const execArguments = process.env.VSCODE_DEBUG === 'true' ? ['--inspect-brk=9230'] : [];
  mainLogger.info(`RNG Utility process execArgv: ${JSON.stringify(execArguments)}`);

  const child = utilityProcess.fork(utilityRngPath, [], {
    stdio: 'pipe', // Keep as pipe to allow message passing, but stdout/stderr listeners will be removed
    execArgv: execArguments,
    env: {
      ...process.env,
      SESSION_ID: SESSION_ID,
      UTILITY_PROCESS_ID: short.generate()
    }
  })

  // REMOVED stdout listener

  // REMOVED stderr listener, but will keep general error logging for the process itself
  child.stderr?.on('data', (data) => {
    // This will now only capture truly unformatted stderr output if the utility's logger fails or isn't used
    mainLogger.error(`[UtilityRng RAW STDERR]: ${data.toString().trim()}`);
  })

  child.on('message', (message) => {
    // Simplified message handling for RNG, adjust as needed
    if (message.type === 'done') {
      mainLogger.info(
        { utilityId: message.utilityId },
        `[${message.utilityId}] RNG Utility process finished. Random number: ${message.value}`
      );
    } else if (message.type === 'error') {
      mainLogger.error(
        { utilityId: message.utilityId },
        `[${message.utilityId}] RNG Utility process error: ${message.value}`
      );
    }
  })

  child.on('exit', (code) => {
    if (code !== 0) {
      mainLogger.error(`RNG utility process exited with code ${code}`);
    } else {
      mainLogger.info(`RNG utility process exited successfully.`);
    }
  })
}
