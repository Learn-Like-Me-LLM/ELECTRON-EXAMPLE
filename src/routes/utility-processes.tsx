import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import cx from 'classnames'
import log from 'electron-log/renderer'

const utilityProcessLogger = log.scope('utility-processes')

export const Route = createFileRoute('/utility-processes')({
  component: Settings
})

export function Settings() {
  utilityProcessLogger.info('Rendering Utility Processes')
  const [error, setError] = useState<string | null>(null)
  const [isCounterRunning, setIsCounterRunning] = useState<boolean>(false)
  const [isRngRunning, setIsRngRunning] = useState<boolean>(false)

  const router = useRouter()
  return (
    <div className={cx('flex flex-col items-center w-full py-8 px-4 overflow-y-auto')}>
      <h1 className="text-2xl font-bold text-white text-center">Triggering Utility Process(es)</h1>
      
      <div className={cx('flex flex-col', 'gap-2')}>
        <button 
          className={cx('border border-white p-2 m-2 rounded-md hover:bg-blue-600 text-white transition-colors')}
          onClick={() => router.navigate({ to: '/' })}
        >Home</button>

        <div className={cx('flex', 'gap-2')}>
          <button 
            className={cx(
              'border border-green-500 text-green-400 p-2 m-2 rounded-md hover:bg-green-600 hover:text-white transition-colors',
              { 'opacity-50 cursor-not-allowed': isCounterRunning }
            )}
            onClick={async () => {
              setIsCounterRunning(true)
              setError(null)
              try {
                const result = await window.electronAPI.launchCounterUtility()
                if (result.success) {
                  // Optionally, provide user feedback here, e.g., a toast notification
                } else {
                  setError(`Failed to launch counter: ${result.message}`)
                }
              } catch (err) {
                setError('An unexpected error occurred while launching the counter.')
              } finally {
                setIsCounterRunning(false)
              }
            }}
            disabled={isCounterRunning}
          >
            {isCounterRunning ? 'Counter Running...' : 'Launch Counter Utility'}
          </button>

          <button 
            className={cx(
              'border border-green-500 text-green-400 p-2 m-2 rounded-md hover:bg-green-600 hover:text-white transition-colors',
              { 'opacity-50 cursor-not-allowed': isRngRunning }
            )}
            onClick={async () => {
              setIsRngRunning(true)
              setError(null)
              try {
                const result = await window.electronAPI.launchRngUtility()
                if (result.success) {
                  // Optionally, provide user feedback here, e.g., a toast notification
                } else {
                  setError(`Failed to launch rng: ${result.message}`)
                }
              } catch (err) {
                setError('An unexpected error occurred while launching the RNG utility.')
              } finally {
                setIsRngRunning(false)
              }
            }}
            disabled={isRngRunning}
          >
            {isRngRunning ? 'RNG Running...' : 'Launch RNG Utility'}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  )
}