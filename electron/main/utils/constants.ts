import short from 'short-uuid'

let electronApp: any = null;

export const APP_NAME = 'electron_example'

export const SESSION_ID = short.generate()

export const electronLogMessageFormat = '{h}:{i}:{s} [{processType}{scope}] [{level}] > {text}';

export function getDbName() {
  try {
    // V2
    return electronApp?.isPackaged ? 'electron_example.db' : 'electron_example.dev.db'

    // V1
    // if (!electronApp) {
    //   throw new Error('Not in Electron context');
    // }
    
    // return electronApp.isPackaged ? 'electron_example.db' : 'electron_example.dev.db'
  } catch (error) {
    // Fallback for when app is not initialized or not in Electron context
    return process.env.NODE_ENV === 'production' ? 'electron_example.db' : 'electron_example.dev.db'
  }
}

export function getDbConfig() {
  return {
    name: getDbName(),
    timeout: 5000,
    appName: APP_NAME
  }
}