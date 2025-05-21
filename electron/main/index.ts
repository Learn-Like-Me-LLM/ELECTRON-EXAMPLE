import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs'
import os from 'node:os'
import logger from './logger'
import { dbInit } from './db/dbInit'
import dotenv from 'dotenv'

const logPrefix = `[MAIN PROCESS]`

// CONFIGURE: environment variables ###########################################
const isProd = app.isPackaged

// Get possible env file locations
const getEnvPaths = () => {
  if (isProd) {
    const paths = []
    // First try resources path
    if (process.resourcesPath) {
      paths.push(path.join(process.resourcesPath, '.env.production'))
    }
    // Then try app path
    const appPath = path.dirname(app.getPath('exe'))
    paths.push(path.join(appPath, '.env.production'))
    return paths
  }
  // Development mode - just use local path
  return [path.join(process.cwd(), '.env.development')]
}

const envPaths = getEnvPaths()

// Try loading env file from each possible location
let envLoaded = false
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  logger.error(`${logPrefix} No environment file found in any of these locations:`, envPaths)
  // Instead of exiting, set some default values
  process.env.NODE_ENV = isProd ? 'production' : 'development'
  // You might want to set other critical env vars here
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')
process.env.DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null

// DEFINE: preload
const preloadPath = path.join(__dirname, '../preload/index.js')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: true,
      contextIsolation: true,
    },
  })

  if (process.env.NODE_ENV !== 'production') {
    win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Debug renderer errors
  win.webContents.on('render-process-gone', (event, details) => {
    logger.error(`${logPrefix} Renderer process crashed:`, details)
  })

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    logger.error(`${logPrefix} Failed to load:`, { errorCode, errorDescription })
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    // Check if the index.html file exists
    const indexPath = path.join(process.env.DIST, 'index.html')
    
    if (fs.existsSync(indexPath)) {      
      win.loadFile(indexPath)
      
      // Open DevTools in production for debugging
      if (process.env.NODE_ENV === 'production') {
        win.webContents.openDevTools()
      }
    } else {
      logger.error(`${logPrefix} Index file not found at: ${indexPath}. This is the expected location for the production build.`)
      // Create a simple error page
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

app.whenReady().then(async () => {
  logger.info('🎉🎉 App is ready')
  
  try {
    // INITIALIZE: database
    logger.info('🔎🔎 Initializing database...')
    await dbInit()
    logger.info('🎉🎉 Database initialized successfully')
    
    // CREATE: window
    await createWindow()  
  } catch (error) {
    logger.error('🚨🚨 Failed to initialize application:', error)
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: true,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(path.join(process.env.DIST, 'index.html'), { hash: arg })
  }
})
