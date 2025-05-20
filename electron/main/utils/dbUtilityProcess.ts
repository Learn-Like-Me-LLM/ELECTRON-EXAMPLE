import { utilityProcess } from 'electron'
import path from 'path'
import logger from '../logger'

const logPrefix = `[DB UTILITY PROCESS]`

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
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'electron/main/utils', 'db-utility-process.js')
    : path.join(__dirname, '../../db-utility-process.js')

  const dbProcess = utilityProcess.fork(utilityProcessPath, [], {
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  })

  dbProcess.on('spawn', () => {
    logger.info(`${logPrefix} Database utility process spawned`)
  })

  dbProcess.on('exit', (code) => {
    logger.info(`${logPrefix} Database utility process exited with code: ${code}`)
  })

  dbProcess.on('error', (err) => {
    logger.error(`${logPrefix} Database utility process error:`, err)
  })

  dbProcess.on('message', (e: Electron.MessageEvent) => {
    const messageData = e.data as DbOperationResult | { type: '__LOG__'; level: string; data: any[] };

    if (messageData && typeof messageData === 'object') {
      // Check if it's a log message from the utility process
      if (messageData.type === '__LOG__') {
        const logMessage = messageData as { type: '__LOG__'; level: string; data: any[] };
        if (logger[logMessage.level]) {
          logger[logMessage.level](`${logPrefix}`, ...logMessage.data);
        } else {
          logger.info(`${logPrefix} - Unknown Level`, ...logMessage.data);
        }
        return;
      }

      // If not a log message, assume it's a DbOperationResult
      // All messages that are not logs are expected to be DbOperationResult
      const operationResult = messageData as DbOperationResult;

      const pendingPromise = pendingOperations.get(operationResult.type);

      if (pendingPromise) {
        if (operationResult.success) {
          pendingPromise.resolve(operationResult);
        } else {
          logger.error(`${logPrefix} Operation ${operationResult.type} failed:`, {
            error: operationResult.error,
            stack: operationResult.stack,
            data: operationResult.data
          });
          pendingPromise.reject(new Error(operationResult.error || 'Unknown error from DB utility process'));
        }
        pendingOperations.delete(operationResult.type); // Clean up the stored promise for this completed operation
      } else {
        // This case means we received a message that is not a log,
        // and it doesn't correspond to any pending operation we initiated.
        logger.warn(`${logPrefix} Received unexpected message from DB utility process (not a log, no pending operation):`, operationResult);
      }
    }
  });

  // Helper function to handle sending operations to the utility process
  const pendingOperations = new Map<DbOperation, { resolve: (value: DbOperationResult) => void, reject: (reason?: any) => void }>();

  function sendOperation(operation: DbOperation): Promise<DbOperationResult> {
    return new Promise((resolve, reject) => {
      pendingOperations.set(operation, { resolve, reject });
      
      // The message handler is now global for the dbProcess instance (see above)
      // No need to set up a new one for each call if we handle logs and multiple responses.

      // Send the operation message
      try {
        dbProcess.postMessage({ 
          type: operation,
          env: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        logger.error(`${logPrefix} Failed to send operation ${operation} to utility process:`, err);
        pendingOperations.delete(operation); // Clean up if sending failed
        reject(err);
      }
    });
  }

  return {
    async runMigrations(): Promise<DbOperationResult> {
      try {
        return await sendOperation('run-migrations')
      } catch (error) {
        logger.error(`${logPrefix} Error running migrations:`, error)
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
        logger.error(`${logPrefix} Error generating schema:`, error)
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    },

    async close(): Promise<void> {
      if (!dbProcess.kill()) {
        logger.warn(`${logPrefix} Failed to kill database utility process`)
      }
    }
  }
} 