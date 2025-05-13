let electronApp: any = null;
let electronLogger: any = null;

// Safely try to import Electron modules
try {
  const electron = require('electron');
  electronApp = electron.app;
  
  // Only import logger if in Electron context
  electronLogger = require('../logger').default;
} catch (error) {
  console.log('Running in non-Electron environment, using fallbacks for app and logger');
}

// Simple logger fallback for non-Electron environments
const logger = electronLogger || {
  debug: (...args: any[]) => console.log('[Debug]', ...args),
  info: (...args: any[]) => console.log('[Info]', ...args),
  warn: (...args: any[]) => console.log('[Warn]', ...args),
  error: (...args: any[]) => console.error('[Error]', ...args)
};

export const APP_NAME = 'electron_example'

export function getDbName() {
  try {
    if (!electronApp) {
      throw new Error('Not in Electron context');
    }
    
    logger.debug('App Environment Debug:', {
      isPackaged: electronApp.isPackaged,
      resourcePath: electronApp.getAppPath(),
      execPath: electronApp.getPath('exe'),
      NODE_ENV: process.env.NODE_ENV
    });
    
    return electronApp.isPackaged ? 'hourglass.db' : 'hourglass.dev.db'
  } catch (error) {
    // Fallback for when app is not initialized or not in Electron context
    return process.env.NODE_ENV === 'production' ? 'hourglass.db' : 'hourglass.dev.db'
  }
}

export function getDbConfig() {
  return {
    name: getDbName(),
    timeout: 5000,
    appName: APP_NAME
  }
}