import { app, ipcMain } from 'electron'
import log from 'electron-log'
import path from 'path'
import { APP_NAME } from '../utils/constants'
import moment from 'moment'
import short from 'short-uuid'

/**
 * Logging Levels
 * error,
 * warn,
 * info,
 * verbose,
 * debug,
 * silly
 */

const SESSION_ID = short.generate()

const logFormat = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}][{processType}][{level}]{scope} {text}'

// Configure file transport only if we can access app
try {
  if (app) {
    const now = moment().utc().toDate()

    const day = now.getDate()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const dateStr = `${year}-${month}-${day}`

    log.transports.file.resolvePathFn = () =>
      path.join(app.getPath('appData'), APP_NAME, 'log', `${year}-${month}-${day}`, `${SESSION_ID}.log`)

    log.transports.file.fileName = dateStr + '.log'
    log.transports.file.format = logFormat
    log.transports.file.maxSize = 10 * 1024 * 1024
  }
} catch (error) {
  console.warn('Unable to configure file transport:', error)
}

// Configure console transport
log.transports.console.format = logFormat

// Listen for logs from renderer process
ipcMain.on('__ELECTRON_LOG__', (event, { level, data, variables }) => {
  if (log[level]) {
    log[level](...data, variables)
  }
})

export default log
