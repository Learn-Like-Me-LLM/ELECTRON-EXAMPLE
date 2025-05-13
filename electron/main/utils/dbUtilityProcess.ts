import { utilityProcess } from 'electron'
import path from 'path'
import logger from '../logger'

interface DbOperationResult {
  success: boolean
  error?: string
  data?: any
}

type DbOperation = 'run-migrations' | 'generate-schema'

/**
 * Creates and manages a utility process for database operations
 */
export function createDbUtilityProcess() {
  const isPackaged = process.env.NODE_ENV === 'production'
  const utilityProcessPath = isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'electron', 'db-utility-process.js')
    : path.join(__dirname, '../../db-utility-process.js')

  logger.info('Creating DB utility process at path:', utilityProcessPath)

  const dbProcess = utilityProcess.fork(utilityProcessPath, [], {
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  })

  dbProcess.on('spawn', () => {
    logger.info('Database utility process spawned')
  })

  dbProcess.on('exit', (code) => {
    logger.info(`Database utility process exited with code: ${code}`)
  })

  dbProcess.on('error', (err) => {
    logger.error('Database utility process error:', err)
  })

  // Helper function to handle sending operations to the utility process
  function sendOperation(operation: DbOperation): Promise<DbOperationResult> {
    return new Promise((resolve, reject) => {
      // Set up a message handler for this request
      const messageHandler = (e: Electron.MessageEvent) => {
        const response = e.data as DbOperationResult
        
        if (response && typeof response === 'object' && 'type' in response && response.type === operation) {
          // Clean up the listener to avoid memory leaks
          dbProcess.removeListener('message', messageHandler)
          
          if (response.success) {
            resolve(response)
          } else {
            reject(new Error(response.error || 'Unknown error'))
          }
        }
      }
      
      // Listen for response
      dbProcess.on('message', messageHandler)
      
      // Send the operation message
      dbProcess.postMessage({ type: operation })
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        dbProcess.removeListener('message', messageHandler)
        reject(new Error(`Operation ${operation} timed out after 30 seconds`))
      }, 30000)
    })
  }

  return {
    async runMigrations(): Promise<DbOperationResult> {
      try {
        return await sendOperation('run-migrations')
      } catch (error) {
        logger.error('Error running migrations:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    },

    async generateSchema(): Promise<DbOperationResult> {
      try {
        return await sendOperation('generate-schema')
      } catch (error) {
        logger.error('Error generating schema:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    },

    async close(): Promise<void> {
      if (!dbProcess.kill()) {
        logger.warn('Failed to kill database utility process')
      }
    }
  }
} 