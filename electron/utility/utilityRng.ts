// electron/utility/utilityRNG.ts
import short from 'short-uuid';
import log from './lib/logger';

// Get the instance-specific ID from the environment variable passed by the main process
const UTILITY_PROCESS_ID = process.env.UTILITY_PROCESS_ID;

// Create a scoped logger instance for this utility process using the instance-specific ID
const utilityProcessLogger = log.scope('utilityRng');

// @ts-ignore: parentPort is available in Electron utility processes
if (!process.parentPort) {
  utilityProcessLogger.error('This script must be run as a utility process with a parentPort.');
  process.exit(1);
}

// @ts-ignore: parentPort is available in Electron utility processes
const parentPort = process.parentPort;

async function rng(): Promise<number> {
  utilityProcessLogger.info('Starting RNG utility process',);
  const timeout = 5000;
  
  return new Promise((resolve, reject) => {
    // Set up a timeout to ensure the process doesn't hang
    const timeoutId = setTimeout(() => {
      reject(new Error(`RNG operation timed out after ${timeout}ms`));
    }, timeout);

    try {
      // Generate a random number between 1 and 100 (inclusive)
      const randomNumber = Math.floor(Math.random() * 100) + 1;
      
      // Simulate some async work (optional - you can remove this if not needed)
      setTimeout(() => {
        clearTimeout(timeoutId);
        resolve(randomNumber);
      }, 100); // Small delay to simulate processing
      
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

rng()
  .then(finalCount => {
    utilityProcessLogger.info(`[DONE] Utility process ${UTILITY_PROCESS_ID} completed successfully with value: ${finalCount}`)
    process.exit(0);
  })
  .catch(error => {
    utilityProcessLogger.error(`[ERROR] Error in utility process ${UTILITY_PROCESS_ID}: ${error.message}`, error.stack)
    process.exit(1);
  });