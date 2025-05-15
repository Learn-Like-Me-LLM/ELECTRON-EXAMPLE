import { createFileRoute, useRouter } from '@tanstack/react-router'
import cx from 'classnames'

export const Route = createFileRoute('/settings')({
  component: Settings
})

export function Settings() {
  const router = useRouter()
  return (
    <div className={cx('flex flex-col items-center w-full py-8 px-4 overflow-y-auto')}>
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      <div>
        <button 
          className={cx('border border-white p-2 rounded-md hover:bg-blue-600 text-white transition-colors')}
          onClick={() => router.navigate({ to: '/' })}
        >Home</button>
      </div>
    </div>
  )
}