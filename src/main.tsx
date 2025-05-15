import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter, createMemoryHistory, createBrowserHistory } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './styles.css'
import logger from './lib/logger'

// Create a simple error display component
function ErrorDisplay({ error }: { error: Error | string }) {
  const errorMessage = error instanceof Error ? error.message : error
  const errorStack = error instanceof Error ? error.stack : ''
  
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'monospace',
      color: 'white',
      backgroundColor: '#ff0000',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto',
      zIndex: 9999
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Application Error</h1>
      <div style={{ marginBottom: '20px' }}>
        <strong>Message:</strong> {errorMessage}
      </div>
      {errorStack && (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          <strong>Stack:</strong> {errorStack}
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <strong>Environment:</strong> {window.env?.NODE_ENV || 'unknown'}
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>URL:</strong> {window.location.href}
      </div>
    </div>
  )
}

// Log environment and route information
logger.info('Renderer process starting', {
  nodeEnv: window.env?.NODE_ENV,
  isProd: window.env?.NODE_ENV === 'production',
  location: window.location.href
})

try {
  logger.info('Creating router')
  
  // Log route tree for debugging
  try {
    logger.info('Route tree:', {
      routes: routeTree.id || 'unknown',
      rootChildren: Object.keys(routeTree.children || {}).join(', ') || 'none'
    })
  } catch (e) {
    logger.error('Failed to log route tree:', e)
  }
  
  // Create router with configuration for Electron
  const router = createRouter({ 
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    // Use consistent basepath for production and development
    basepath: '/',
    // Use memory history for both production and development in Electron
    history: createMemoryHistory()
  })

  const rootElement = document.getElementById('app')
  if (!rootElement) {
    throw new Error('Root element #app not found')
  }
  
  logger.info('Creating root and rendering app')
  const root = createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
  
  logger.info('App rendered successfully')
} catch (error) {
  logger.error('Failed to initialize renderer:', error)
  
  // Display error on screen for debugging
  const rootElement = document.getElementById('app')
  if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<ErrorDisplay error={error as Error} />)
  } else {
    document.body.innerHTML = `<div style="color: red; padding: 20px;">
      Router initialization error: ${error instanceof Error ? error.message : String(error)}
    </div>`
  }
}
