import { defineConfig } from 'drizzle-kit'
import { getDatabasePath } from './electron/main/utils/database'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

// Get the database path that works in both Electron and non-Electron environments
const databasePath = getDatabasePath()
console.log('🔍 drizzle.config.ts : DATABASE PATH', databasePath)

// Ensure the directory exists
const dbDir = dirname(databasePath)
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

export default defineConfig({
  dialect: 'sqlite',
  schema: './electron/main/db/schema/index.ts',
  out: './migrations',
  dbCredentials: {
    url: databasePath
  }
})
