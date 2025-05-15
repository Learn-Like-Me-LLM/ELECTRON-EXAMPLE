const path = require('path')
const { drizzle } = require('drizzle-orm/better-sqlite3')
const { migrate } = require('drizzle-orm/better-sqlite3/migrator')
const Database = require('better-sqlite3')
const { existsSync, mkdirSync } = require('fs')
const { dirname } = require('path')

// Process parent port for communication back to the main process
// Use optional chaining to prevent errors if parentPort is undefined
let parentPort
try {
  parentPort = require('node:worker_threads')?.parentPort || require('electron')?.parentPort
} catch (err) {
  console.warn('Could not import parentPort, running in standalone mode')
}

// Setup logging
function log(...args) {
  console.log('[DB Utility Process]', ...args)
}

function error(...args) {
  console.error('[DB Utility Process]', ...args)
}

// Determine environment
const isDev = process.env.NODE_ENV !== 'production'

// Database path helpers
function getAppName() {
  return isDev ? 'hourglass_attention_tracker_dev' : 'hourglass_attention_tracker'
}

function getAppDataPath() {
  const platform = process.platform
  let appDataPath

  if (platform === 'win32') {
    appDataPath = process.env.APPDATA
  } else if (platform === 'darwin') {
    appDataPath = path.join(process.env.HOME, 'Library', 'Application Support')
  } else if (platform === 'linux') {
    appDataPath = path.join(process.env.HOME, '.config')
  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  return path.join(appDataPath, getAppName())
}

function getDatabaseName() {
  return isDev ? 'hourglass.dev.db' : 'hourglass.db'
}

function getDatabasePath() {
  const dataPath = getAppDataPath()
  // Ensure directory exists
  if (!existsSync(dataPath)) {
    mkdirSync(dataPath, { recursive: true })
  }
  return path.join(dataPath, getDatabaseName())
}

// Database utilities
function connectToDatabase() {
  const dbPath = getDatabasePath()
  log(`Connecting to database at: ${dbPath}`)
  
  try {
    const sqlite = new Database(dbPath, {
      timeout: 5000 // 5 seconds
    })
    
    // Enhanced schema loading logic
    let schema
    const isPackaged = process.env.NODE_ENV === 'production'
    const possibleSchemaPaths = [
      isPackaged && path.join(process.resourcesPath, 'app.asar.unpacked', 'dist/electron/main/db/schema'),
      isPackaged && path.join(process.resourcesPath, 'app.asar', 'dist/electron/main/db/schema'),
      path.join(__dirname, '../dist/electron/main/db/schema'),
      path.join(__dirname, './main/db/schema')
    ].filter(Boolean)

    let loadError
    for (const schemaPath of possibleSchemaPaths) {
      try {
        schema = require(schemaPath)
        log(`Successfully loaded schema from: ${schemaPath}`)
        break
      } catch (err) {
        loadError = err
        log(`Failed to load schema from ${schemaPath}:`, err.message)
      }
    }

    if (!schema) {
      throw new Error(`Failed to load schema from any location. Last error: ${loadError?.message}`)
    }
    
    const db = drizzle(sqlite, { schema })
    return { db, sqlite }
  } catch (err) {
    error('Failed to connect to database:', err)
    throw err
  }
}

// Operations
async function runMigrations() {
  try {
    log('Starting database migrations')
    const { db, sqlite } = connectToDatabase()
    
    // Determine migrations path with better production handling
    const isPackaged = process.env.NODE_ENV === 'production'
    let migrationsPath

    if (isPackaged) {
      // Try multiple possible locations for production
      const possiblePaths = [
        path.join(process.resourcesPath, 'app.asar.unpacked', 'migrations'),
        path.join(process.resourcesPath, 'app.asar', 'migrations'),
        path.join(__dirname, '../migrations')
      ]

      // Find the first path that exists
      migrationsPath = possiblePaths.find(p => {
        try {
          return existsSync(p)
        } catch (err) {
          return false
        }
      })

      if (!migrationsPath) {
        throw new Error(`Could not find migrations directory. Tried: ${possiblePaths.join(', ')}`)
      }
    } else {
      // Development path
      migrationsPath = path.join(__dirname, '../migrations')
    }
    
    log(`Running migrations from: ${migrationsPath}`)
    
    // Run migrations
    await migrate(db, { migrationsFolder: migrationsPath })
    
    // Close database connection
    sqlite.close()
    
    log('Migrations completed successfully')
    return {
      type: 'run-migrations',
      success: true,
      data: { migrationsPath }
    }
  } catch (err) {
    error('Migration failed:', err)
    return {
      type: 'run-migrations',
      success: false,
      error: err.message,
      stack: err.stack
    }
  }
}

async function generateSchema() {
  try {
    log('Generating migration schema is handled by drizzle-kit CLI')
    // This is generally handled by the drizzle-kit CLI and not directly in the app
    // We'd typically run a child process with drizzle-kit
    
    return {
      type: 'generate-schema',
      success: true,
      data: {
        message: 'Schema generation should be handled by drizzle-kit CLI via npm scripts'
      }
    }
  } catch (err) {
    error('Generate schema failed:', err)
    return {
      type: 'generate-schema',
      success: false,
      error: err.message
    }
  }
}

// Message handling - only set up if parentPort is defined
if (parentPort) {
  parentPort.on('message', async (message) => {
    log('Received message:', message)
    
    if (!message || typeof message !== 'object') {
      parentPort.postMessage({
        success: false,
        error: 'Invalid message format'
      })
      return
    }
    
    try {
      let response
      
      switch (message.type) {
        case 'run-migrations':
          response = await runMigrations()
          break
          
        case 'generate-schema':
          response = await generateSchema()
          break
          
        default:
          response = {
            success: false,
            error: `Unknown operation: ${message.type}`
          }
      }
      
      parentPort.postMessage(response)
    } catch (err) {
      error('Error handling message:', err)
      parentPort.postMessage({
        success: false,
        error: err.message || 'Unknown error in db utility process'
      })
    }
  })
  
  // Notify that we're ready
  log('DB utility process started with IPC channel')
} else {
  log('DB utility process started in standalone mode (no IPC channel)')
}

// Export functions for direct usage when not in utility process mode
module.exports = {
  runMigrations,
  generateSchema
} 