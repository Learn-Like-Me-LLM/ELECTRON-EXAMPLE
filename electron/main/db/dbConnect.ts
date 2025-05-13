import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { getDatabasePath } from '../utils/database'
import { getDbConfig } from '../utils/constants'
import { app } from 'electron'
import logger from '../logger'
import { createDbUtilityProcess } from '../utils/dbUtilityProcess'

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

  // Run migrations in production using the utility process
  if (process.env.NODE_ENV === 'production') {
    try {
      logger.info('Starting migration process in production mode')
      
      // Create a database utility process for running migrations
      const dbUtilityProcess = createDbUtilityProcess()
      
      // Run migrations in the utility process
      const result = await dbUtilityProcess.runMigrations()
      
      // Close the utility process when done
      await dbUtilityProcess.close()
      
      if (result.success) {
        logger.info('Migrations completed successfully via utility process')
      } else {
        logger.error('Migration failed:', result.error)
        throw new Error(`Failed to run migrations: ${result.error}`)
      }
    } catch (error) {
      logger.error('Failed to run migrations:', error)
      throw error
    }
  }
}
