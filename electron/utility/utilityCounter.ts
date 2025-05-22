// electron/utility/utilityCounter.ts
import short from 'short-uuid';
import log from './lib/logger'; // Use the base electron-log import

// Get the instance-specific ID from the environment variable passed by the main process
const UTILITY_PROCESS_ID = process.env.UTILITY_PROCESS_ID;

// Create a scoped logger instance for this utility process using the instance-specific ID
const utilityProcessLogger = log.scope('utilityCounter');

// @ts-ignore: parentPort is available in Electron utility processes
if (!process.parentPort) {
  // Use the logger to report this error, ensuring it goes to a file if possible
  utilityProcessLogger.error('This script must be run as a utility process with a parentPort.');
  process.exit(1);
}

// @ts-ignore: parentPort is available in Electron utility processes
const parentPort = process.parentPort;

async function countAndReport() {
  utilityProcessLogger.info('Starting counter utility process',);
  const limit = 30;

  for (let i = 1; i <= limit; i++) {
    if (i % 5 === 0) {
      utilityProcessLogger.info(`Counter at ${i}`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second pause
  }

  return limit;
}

countAndReport()
  .then(finalCount => {
    utilityProcessLogger.info(`[DONE] Final count: ${finalCount}`);
    process.exit(0);
  })
  .catch(error => {
    // Ensure the error message includes the instance scope for clarity
    utilityProcessLogger.error(`[ERROR] ${error.message}`);
    process.exit(1);
  }); 