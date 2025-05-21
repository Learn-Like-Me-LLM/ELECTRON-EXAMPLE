import Database from 'better-sqlite3'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema'
import { getDatabasePath } from '../utils/database'
import { getDbConfig } from '../utils/constants'
import path from 'path'
export let db: BetterSQLite3Database<typeof schema>;
import log from '../logger/index'
const dbConnectLogger = log.scope('db/dbConnect.ts')

// CONNECT TO DATABASE ########################################################
export const dbConnect = async () => {
  try {
    const dbPath = getDatabasePath()

    // CREATE: database connection
    const sqlite = new Database(dbPath, {
      timeout: getDbConfig().timeout,
    })

    // ENABLE: foreign keys
    sqlite.pragma('foreign_keys = ON')

    // INITIALIZE: Drizzle
    db = drizzle(sqlite, { schema })

    // PRODUCTION MIGRATIONS ##################################################
    if (process.env.NODE_ENV === 'production') {
      try {
        // in production, migrations are in the app.asar.unpacked directory
        const migrationsDirectoryPath = process.env.NODE_ENV === 'production'
          ? path.join(process.resourcesPath, 'app.asar.unpacked/migrations')
          : path.join(__dirname, '../../../migrations')
        
        await migrate(db, { migrationsFolder: migrationsDirectoryPath })
      } catch (error) {
        throw error
      }
    }
    
    dbConnectLogger.info(`🎉🎉 Database connection and setup completed successfully`)
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`)
  }
}
