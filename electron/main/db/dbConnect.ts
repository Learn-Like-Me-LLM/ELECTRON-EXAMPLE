import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'
import { getDatabasePath } from '../utils/database'
import { getDbConfig } from '../utils/constants'
import { app } from 'electron'
import logger from '../logger'
import { createDbUtilityProcess } from '../utils/dbUtilityProcess'
import path from 'path'
export let db: BetterSQLite3Database<typeof schema>;

/** CONNECT TO DATABASE */
export const dbConnect = async () => {
  const dbPath = getDatabasePath()
  logger.info('dbConnect : DATABASE PATH', dbPath)

  // Create database connection
  const sqlite = new Database(dbPath, {
    timeout: getDbConfig().timeout
  })

  db = drizzle(sqlite, { schema })

  // PRODUCTION MIGRATIONS ####################################################
  if (process.env.NODE_ENV === 'production') {
    try {
      logger.info('Starting migration process in production mode')
      
      // In production, migrations are in the app.asar.unpacked directory
      const migrationsDirectoryPath = process.env.NODE_ENV === 'production'
        ? path.join(process.resourcesPath, 'app.asar.unpacked/migrations')
        : path.join(__dirname, '../../../migrations')
      
      logger.debug('MIGRATE', migrationsDirectoryPath)
      await migrate(db, { migrationsFolder: migrationsDirectoryPath })
    } catch (error) {
      logger.error('Failed to run migrations:', error)
      throw error
    }
  }
}
