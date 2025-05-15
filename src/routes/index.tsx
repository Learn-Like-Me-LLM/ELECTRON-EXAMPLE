import { createFileRoute } from '@tanstack/react-router'
import cx from 'classnames'

export const Route = createFileRoute('/')({
  component: Index
})

export function Index() {

  return (
    <div className={cx('flex flex-col items-center justify-center h-screen bg-blue-500')}>
      <h1>Welcome to Electron Example</h1>
      <p>CUSTOM_ENV_VAR: {window.env.CUSTOM_ENV_VAR}</p>
      <p>NODE_ENV: {window.env.NODE_ENV}</p>
    </div>
  )
}