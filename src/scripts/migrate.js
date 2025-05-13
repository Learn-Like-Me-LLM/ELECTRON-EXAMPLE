#!/usr/bin/env node

/**
 * Database migration script for Electron app
 * 
 * This script ensures database operations like migrations run in the Electron main process
 * environment where they can access required resources.
 * 
 * Commands:
 * - generate: Generate migration files based on schema changes
 * - run: Apply pending migrations to the database
 * - rebuild: Rebuild native dependencies for Electron
 * - setup: Complete setup process (compile TypeScript, generate schema, rebuild, run migrations)
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const electron = require('electron');

// Get command line arguments
const command = process.argv[2];
const args = process.argv.slice(3);

// Validate we're in the right directory
const isInRightDir = fs.existsSync(path.join(process.cwd(), 'electron-builder.yml')) &&
                     fs.existsSync(path.join(process.cwd(), 'drizzle.config.ts'));

if (!isInRightDir) {
  console.error('Error: This script must be run from the project root directory.');
  process.exit(1);
}

// Ensure the migrations directory exists
const migrationsDir = path.join(process.cwd(), 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
  fs.mkdirSync(path.join(migrationsDir, 'meta'), { recursive: true });
}

// Helper functions
function runDrizzleKit(drizzleCommand, options = []) {
  console.log(`Running drizzle-kit ${drizzleCommand}...`);
  
  try {
    const drizzleKitPath = path.join(process.cwd(), 'node_modules', '.bin', 'drizzle-kit');
    
    if (!fs.existsSync(drizzleKitPath)) {
      console.error('Error: drizzle-kit not found. Please run npm install.');
      process.exit(1);
    }
    
    // For schema generation, we need to run the CLI directly
    // This doesn't require an Electron context as it just analyzes TypeScript files
    
    // Build the command
    const fullCommand = `${drizzleKitPath} ${drizzleCommand} ${options.join(' ')}`;
    console.log(`Executing: ${fullCommand}`);
    
    // Execute the command synchronously
    execSync(fullCommand, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Error running drizzle-kit:', error.message);
    return false;
  }
}

function runInElectron(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running in Electron: ${scriptPath}`);
    
    // Spawn the Electron process
    const electronProcess = spawn(electron, [scriptPath], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    electronProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
    
    electronProcess.on('error', (err) => {
      reject(err);
    });
  });
}

async function runDbUtilityProcess() {
  try {
    // Create a small script to run the utility process
    const tempScriptPath = path.join(process.cwd(), 'temp-db-utility.js');
    
    const scriptContent = `
      const { app } = require('electron');
      const { createDbUtilityProcess } = require('./dist/electron/main/utils/dbUtilityProcess');
      
      app.whenReady().then(async () => {
        console.log('Electron is ready, creating DB utility process...');
        const dbUtilityProcess = createDbUtilityProcess();
        
        try {
          const result = await dbUtilityProcess.runMigrations();
          console.log('Migration result:', result);
          
          if (result.success) {
            console.log('Migrations completed successfully');
            app.exit(0);
          } else {
            console.error('Migration failed:', result.error);
            app.exit(1);
          }
        } catch (error) {
          console.error('Error running migrations:', error);
          app.exit(1);
        } finally {
          await dbUtilityProcess.close();
        }
      });
    `;
    
    // Write the script to a temporary file
    fs.writeFileSync(tempScriptPath, scriptContent);
    
    // Run the script with Electron
    await runInElectron(tempScriptPath);
    
    // Clean up the temporary script
    fs.unlinkSync(tempScriptPath);
  } catch (error) {
    console.error('Error running utility process:', error);
    process.exit(1);
  }
}

// Main command handler
async function run() {
  switch (command) {
    case 'generate':
      console.log('Generating migration files...');
      // Schema generation doesn't need Electron - run directly with drizzle-kit
      if (runDrizzleKit('generate')) {
        console.log('Migration files generated successfully');
      }
      break;
      
    case 'run':
      console.log('Running migrations...');
      try {
        await runDbUtilityProcess();
        console.log('Migrations applied successfully');
      } catch (error) {
        console.error('Failed to run migrations:', error);
        process.exit(1);
      }
      break;
      
    case 'rebuild':
      console.log('Rebuilding native dependencies...');
      try {
        execSync('npm rebuild better-sqlite3 --update-binary', { stdio: 'inherit' });
        console.log('Rebuild completed successfully');
      } catch (error) {
        console.error('Rebuild failed:', error);
        process.exit(1);
      }
      break;
      
    case 'setup':
      console.log('Setting up database environment...');
      try {
        // First compile TypeScript
        console.log('Compiling TypeScript...');
        // Don't use npm run tsc which is causing problems
        // Instead use tsc directly with explicit project file
        execSync('npx tsc --project tsconfig.migrate.json --outDir dist', { stdio: 'inherit' });
        
        // Generate schema - run directly with drizzle-kit
        console.log('Generating schema...');
        if (!runDrizzleKit('generate')) {
          throw new Error('Failed to generate schema');
        }
        
        // Rebuild native dependencies
        console.log('Rebuilding native dependencies...');
        execSync('npm rebuild better-sqlite3 --update-binary', { stdio: 'inherit' });
        
        // Run migrations
        console.log('Running migrations...');
        await runDbUtilityProcess();
        
        console.log('Database setup completed successfully');
      } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
      }
      break;
      
    default:
      console.log(`
Database Management Commands:
  - generate: Generate migration files based on schema changes
  - run: Apply pending migrations to the database
  - rebuild: Rebuild native dependencies for Electron
  - setup: Complete setup process (compile TypeScript, generate schema, rebuild, run migrations)

Usage: node scripts/migrate.js [command]
      `);
      break;
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
}); 