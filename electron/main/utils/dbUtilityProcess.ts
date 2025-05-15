import { utilityProcess } from 'electron'
import path from 'path'
import logger from '../logger'

interface DbOperationResult {
  success: boolean
  error?: string
  stack?: string
  data?: any
  type?: DbOperation
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
        
        if (response && typeof response === 'object') {
          // Clean up the listener to avoid memory leaks
          dbProcess.removeListener('message', messageHandler)
          
          if ('type' in response && response.type === operation) {
            if (response.success) {
              logger.info(`Operation ${operation} completed successfully`, response.data || {})
              resolve(response)
            } else {
              logger.error(`Operation ${operation} failed:`, {
                error: response.error,
                stack: response.stack,
                data: response.data
              })
              reject(new Error(response.error || 'Unknown error'))
            }
          } else {
            logger.warn(`Received unexpected response type for operation ${operation}:`, response)
            resolve(response) // Still resolve as it might be a valid response
          }
        }
      }
      
      // Listen for response
      dbProcess.on('message', messageHandler)
      
      // Send the operation message
      try {
        dbProcess.postMessage({ 
          type: operation,
          env: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        })
        logger.info(`Sent operation ${operation} to utility process`)
      } catch (err) {
        logger.error(`Failed to send operation ${operation} to utility process:`, err)
        dbProcess.removeListener('message', messageHandler)
        reject(err)
      }
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        dbProcess.removeListener('message', messageHandler)
        const timeoutError = new Error(`Operation ${operation} timed out after 30 seconds`)
        logger.error(timeoutError)
        reject(timeoutError)
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