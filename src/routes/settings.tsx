import { createFileRoute } from '@tanstack/react-router'
import cx from 'classnames'

export const Route = createFileRoute('/settings')({
  component: Settings
})

export function Settings() {

  return (
    <div className={cx('flex flex-col items-center justify-center h-screen bg-blue-500')}>
      <h1>Settings</h1>
    </div>
  )
}