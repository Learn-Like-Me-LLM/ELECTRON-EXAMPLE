import { app, ipcMain } from 'electron'
import log from 'electron-log/main'
import path from 'path'
import { APP_NAME, SESSION_ID, electronLogMessageFormat } from '../utils/constants'
import moment from 'moment'

// Initialize electron-log. This is optional but recommended if you also log from renderer processes.
// It allows renderers to use `import log from 'electron-log/renderer'`
log.initialize();

try {
  if (app) {
    const now = moment().utc()
    const year = now.year().toString()
    const month = (now.month() + 1).toString().padStart(2, '0')
    const day = now.date().toString().padStart(2, '0')

    log.transports.file.resolvePathFn = (variables: any, message: any) => {
      // Simplified logging for clarity
      console.log(
        `🔎 main/logger/index.ts resolvePathFn: processType='${message?.variables?.processType}', scope='${message?.variables?.scope}', defaultPath='${variables.defaultPath}'`
      );

      const datePath = `${year}-${month}-${day}`;
      const fileName = `${message?.variables?.processType || 'unknown'}.log`;

      if (message?.variables?.processType === 'utility') {
        return path.join(
          variables.userData,
          'logs',
          datePath,
          SESSION_ID,
          message?.variables?.scope || 'unknown-utility',
          fileName
        );
      } 

      return path.join(
        variables.userData,
        'logs',
        datePath,
        SESSION_ID,
        fileName
      );
    };

    log.transports.file.format = electronLogMessageFormat;
    // Optionally, set the level for file transport
    // log.transports.file.level = 'info'; 
  }
} catch (error) {
  console.error('🚨🚨 Failed to initialize logger file transport:', error)
}

log.transports.console.format = electronLogMessageFormat;
// Optionally, set the level for console transport
// log.transports.console.level = 'info';

log.scope.labelPadding = false;

// Example of a preprocess hook if needed, for now, it's not set.
// log.hooks.preprocess = (message: any): any => {
//   return message;
// };

export default log
