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

logger.info('👀👀👀 Loading environment configuration', {
  nodeEnv: process.env.NODE_ENV,
  isProd,
  envPaths,
  cwd: process.cwd(),
  resourcesPath: process.resourcesPath,
  appPath: path.dirname(app.getPath('exe')),
})

// Try loading env file from each possible location
let envLoaded = false
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    logger.info(`Loading environment from ${envPath}`)
    dotenv.config({ path: envPath })
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  logger.error('No environment file found in any of these locations:', envPaths)
  // Instead of exiting, set some default values
  process.env.NODE_ENV = isProd ? 'production' : 'development'
  // You might want to set other critical env vars here
}

logger.debug('Current environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  CUSTOM_ENV_VAR: process.env.CUSTOM_ENV_VAR
})

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

  // Debug renderer errors
  win.webContents.on('render-process-gone', (event, details) => {
    logger.error('Renderer process crashed:', details)
  })

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    logger.error('Failed to load:', { errorCode, errorDescription })
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    // Check if the index.html file exists
    const indexPath = path.join(process.env.DIST, 'index.html')
    logger.info(`Loading production file from: ${indexPath}`)
    
    if (fs.existsSync(indexPath)) {
      logger.info(`Index file exists at: ${indexPath}`)
      
      // List files in the dist directory for debugging
      try {
        const distFiles = fs.readdirSync(process.env.DIST)
        logger.info(`Files in dist directory:`, distFiles)
      } catch (err) {
        logger.error(`Error reading dist directory:`, err)
      }
      
      win.loadFile(indexPath)
      
      // Open DevTools in production for debugging
      if (process.env.NODE_ENV === 'production') {
        win.webContents.openDevTools()
      }
    } else {
      logger.error(`Index file not found at: ${indexPath}`)
      // Try to find where the file might be
      const appRoot = process.env.APP_ROOT
      logger.info(`Searching for index.html in app root: ${appRoot}`)
      
      // Recursive function to find index.html
      function findIndexHtml(dir: string, depth = 0): string[] {
        if (depth > 3) return [] // Limit search depth
        
        const results: string[] = []
        try {
          const files = fs.readdirSync(dir)
          for (const file of files) {
            const filePath = path.join(dir, file)
            const stat = fs.statSync(filePath)
            
            if (stat.isDirectory()) {
              results.push(...findIndexHtml(filePath, depth + 1))
            } else if (file === 'index.html') {
              results.push(filePath)
            }
          }
        } catch (err) {
          logger.error(`Error searching directory ${dir}:`, err)
        }
        
        return results
      }
      
      const possibleIndexFiles = findIndexHtml(appRoot)
      logger.info(`Possible index.html files found:`, possibleIndexFiles)
      
      if (possibleIndexFiles.length > 0) {
        logger.info(`Trying to load first found index.html: ${possibleIndexFiles[0]}`)
        win.loadFile(possibleIndexFiles[0])
      } else {
        // Create a simple error page
        const errorHtml = `
          <html>
            <body style="background: #f44336; color: white; font-family: sans-serif; padding: 20px;">
              <h1>Error: Could not find index.html</h1>
              <p>The application could not find the main HTML file.</p>
              <pre>Searched in: ${process.env.DIST}</pre>
            </body>
          </html>
        `
        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`)
      }
    }
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
