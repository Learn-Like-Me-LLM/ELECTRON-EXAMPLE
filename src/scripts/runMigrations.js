#!/usr/bin/env node

/**
 * Simple migration runner script
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Validate we're in the right directory
const isInRightDir = fs.existsSync(path.join(process.cwd(), 'drizzle.config.ts'));

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

// Run drizzle-kit directly
try {
  console.log('Running drizzle migrations...');
  const drizzleKitPath = path.join(process.cwd(), 'node_modules', '.bin', 'drizzle-kit');
  
  if (!fs.existsSync(drizzleKitPath)) {
    console.error('Error: drizzle-kit not found. Please run npm install.');
    process.exit(1);
  }
  
  // First try to generate migrations if needed
  try {
    console.log('Generating migration files...');
    execSync(`${drizzleKitPath} generate`, { stdio: 'inherit' });
  } catch (genError) {
    console.warn('Warning: Could not generate migration files:', genError.message);
  }
  
  // Then push the schema changes to the database
  console.log('Pushing schema changes to database...');
  execSync(`${drizzleKitPath} push`, { stdio: 'inherit' });
  console.log('Migrations completed successfully');
} catch (error) {
  console.error('Error running migrations:', error);
  process.exit(1);
} 