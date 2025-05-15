/**
 * Renderer process logger
 * Uses IPC to send logs to the main process for unified logging
 */

// Define log levels
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Check if we're in a renderer process with access to window
const isRenderer = typeof window !== 'undefined' && window?.process?.type === 'renderer';

// Create logger object
const logger = {
  error: (...args: any[]) => logWithLevel('error', args),
  warn: (...args: any[]) => logWithLevel('warn', args),
  info: (...args: any[]) => logWithLevel('info', args),
  debug: (...args: any[]) => logWithLevel('debug', args),
};

// Helper function to log with specific level
function logWithLevel(level: LogLevel, args: any[]) {
  // Always log to console
  console[level](`[RENDERER][${level.toUpperCase()}]`, ...args);
  
  // If in renderer process and we have access to the preload API, send to main process
  if (isRenderer && window.electronAPI) {
    try {
      // Send log to main process via IPC
      window.electronAPI.sendLog(level, args);
    } catch (error) {
      console.error('Failed to send log to main process:', error);
    }
  }
}

export default logger;