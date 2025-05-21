import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_404')({
  component: NotFoundRoute,
})

function NotFoundRoute() {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
      <p>The requested page could not be found.</p>
      <div className="mt-4 p-2 bg-blue-700 rounded">
        <a href="/" className="text-white">Go to Home</a>
      </div>
      <div className="mt-8 p-4 bg-gray-800 rounded text-xs font-mono">
        <p>Debug Info:</p>
        <p>Current URL: {window.location.href}</p>
        <p>Environment: {window.env?.NODE_ENV}</p>
      </div>
    </div>
  )
}