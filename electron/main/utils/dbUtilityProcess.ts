import { utilityProcess } from 'electron'
import path from 'path'
import { SESSION_ID } from './constants'

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
      NODE_ENV: process.env.NODE_ENV || 'development',
      SESSION_ID: SESSION_ID
    }
  })

  dbProcess.on('spawn', () => {
    console.log(`${logPrefix} Database utility process spawned`)
  })

  dbProcess.on('exit', (code) => {
    console.log(`${logPrefix} Database utility process exited with code: ${code}`)
  })

  dbProcess.on('error', (err) => {
    console.error(`${logPrefix} Database utility process error:`, err)
  })

  dbProcess.on('message', (e: Electron.MessageEvent) => {
    const messageData = e.data as DbOperationResult | { type: '__LOG__'; level: string; data: any[] };

    if (messageData && typeof messageData === 'object') {
      const operationResult = messageData as DbOperationResult;

      const pendingPromise = pendingOperations.get(operationResult.type);

      if (pendingPromise) {
        if (operationResult.success) {
          pendingPromise.resolve(operationResult);
        } else {
          pendingPromise.reject(new Error(operationResult.error || 'Unknown error from DB utility process'));
        }
        pendingOperations.delete(operationResult.type); // Clean up the stored promise for this completed operation
      } else {
        // This case means we received a message that is not a log,
        // and it doesn't correspond to any pending operation we initiated.
        console.warn(`${logPrefix} Received unexpected message from DB utility process (not a log, no pending operation):`, operationResult);
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
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    },

    async close(): Promise<void> {
      if (!dbProcess.kill()) {
        console.warn(`${logPrefix} Failed to kill database utility process`)
      }
    }
  }
} 