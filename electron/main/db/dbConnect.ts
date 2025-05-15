import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { sql } from 'drizzle-orm'
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
  try {
    const dbPath = getDatabasePath()
    logger.info('[DB] Connecting to database at path:', dbPath)
    logger.info('[DB] Database config:', getDbConfig())

    // Create database connection
    const sqlite = new Database(dbPath, {
      timeout: getDbConfig().timeout,
      verbose: (message) => {
        logger.debug(`[SQLite] ${message}`)
      }
    })

    // Enable foreign keys
    sqlite.pragma('foreign_keys = ON')
    
    // Log database information
    const dbInfo = {
      version: sqlite.pragma('user_version', { simple: true }),
      journalMode: sqlite.pragma('journal_mode', { simple: true }),
      syncMode: sqlite.pragma('synchronous', { simple: true }),
      pageSize: sqlite.pragma('page_size', { simple: true }),
      cacheSize: sqlite.pragma('cache_size', { simple: true }),
      encoding: sqlite.pragma('encoding', { simple: true }),
    }
    logger.info('[DB] Database information:', dbInfo)

    // Initialize drizzle
    logger.info('[DB] Initializing Drizzle ORM')
    db = drizzle(sqlite, { schema })
    
    // Test database connection
    try {
      // Use a simple raw query to test the connection
      const testQuery = sqlite.prepare('SELECT 1 AS test').get()
      logger.info('[DB] Database connection test successful:', testQuery)
    } catch (testError) {
      logger.error('[DB] Database connection test failed:', testError)
      throw new Error(`Database connection test failed: ${testError.message}`)
    }

    // PRODUCTION MIGRATIONS ####################################################
    if (process.env.NODE_ENV === 'production') {
      try {
        logger.info('[DB] Starting migration process in production mode')
        
        // In production, migrations are in the app.asar.unpacked directory
        const migrationsDirectoryPath = process.env.NODE_ENV === 'production'
          ? path.join(process.resourcesPath, 'app.asar.unpacked/migrations')
          : path.join(__dirname, '../../../migrations')
        
        logger.info('[DB] Migrations directory path:', migrationsDirectoryPath)
        await migrate(db, { migrationsFolder: migrationsDirectoryPath })
        logger.info('[DB] Migrations completed successfully')
      } catch (error) {
        logger.error('[DB] Failed to run migrations:', error)
        throw error
      }
    }
    
    logger.info('[DB] Database connection and setup completed successfully')
  } catch (error) {
    logger.error('[DB] Error during database connection:', error)
    throw new Error(`Database connection failed: ${error.message}`)
  }
}
