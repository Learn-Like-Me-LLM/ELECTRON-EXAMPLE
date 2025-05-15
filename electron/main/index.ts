import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs'
import os from 'node:os'
import logger from './logger'
import { dbInit } from './db/dbInit'
import dotenv from 'dotenv'

// CONFIGURE: environment variables ###########################################
const isProd = app.isPackaged
const envPath = isProd
  ? path.join(process.cwd(), '.env.production')  // Start with local path
  : path.join(process.cwd(), '.env.development')

logger.info('👀👀👀 Loading environment configuration', {
  nodeEnv: process.env.NODE_ENV,
  envPath,
  cwd: process.cwd(),
  files: fs.readdirSync(process.cwd(), { withFileTypes: true })
})

if (fs.existsSync(envPath)) {
  logger.info(`Loading environment from ${envPath}`)
  dotenv.config({ path: envPath })
  logger.debug('👀👀👀 ENV VARIABLES : electron/main/env.ts', process.env.CUSTOM_ENV_VAR, process.env.NODE_ENV)
} else {
  // In production, try the resources path as fallback
  if (isProd && process.resourcesPath) {
    const prodEnvPath = path.join(process.resourcesPath, '.env.production')
    if (fs.existsSync(prodEnvPath)) {
      logger.info(`Loading production environment from ${prodEnvPath}`)
      dotenv.config({ path: prodEnvPath })
    }
  }
  logger.error(`Environment file not found at ${envPath}`)
  process.exit(1)
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

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.whenReady().then(async () => {
  logger.info('🎉🎉 App is ready')
  logger.debug('ENV VARIABLES : electron/main/index.ts : app.whenReady(...)', process.env.CUSTOM_ENV_VAR, process.env.NODE_ENV)
  
  try {
    // INITIALIZE: database
    logger.info('🔎🔎 Initializing database...')
    await dbInit()
    logger.info('🎉🎉 Database initialized successfully')
    
    // CREATE: window
    await createWindow()  
  } catch (error) {
    logger.error('Failed to initialize application:', error)
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
      preload,
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
