import { createFileRoute, useRouter } from '@tanstack/react-router'
import cx from 'classnames'

export const Route = createFileRoute('/')({
  component: Index
})

export function Index() {
  const router = useRouter()
  return (
    <div className={cx('flex flex-col items-center justify-center h-screen bg-blue-500')}>
      <h1>Welcome to Electron Example</h1>

      <div>
        <button 
          className={cx('border border-white p-2 rounded-md hover:bg-blue-600 text-white transition-colors')}
          onClick={() => router.navigate({ to: '/settings' })}
        >Settings</button>
        
      </div>
      <p>CUSTOM_ENV_VAR: {window.env.CUSTOM_ENV_VAR}</p>
      <p>NODE_ENV: {window.env.NODE_ENV}</p>
    </div>
  )
}