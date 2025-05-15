import { createFileRoute } from '@tanstack/react-router'
import logger from '../lib/logger'

export const Route = createFileRoute('/fallback')({
  component: FallbackRoute,
})

function FallbackRoute() {
  logger.info('Rendering fallback route')
  
  return (
    <div className="flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Fallback Page</h1>
      <p>This is a fallback page for when routes aren't working correctly.</p>
      <div className="mt-4 p-2 bg-blue-700 rounded">
        <a href="/" className="text-white">Try to go Home</a>
      </div>
      <div className="mt-8 p-4 bg-gray-800 rounded text-xs font-mono">
        <p>Debug Info:</p>
        <p>Current URL: {window.location.href}</p>
        <p>Environment: {window.env?.NODE_ENV}</p>
      </div>
    </div>
  )
}