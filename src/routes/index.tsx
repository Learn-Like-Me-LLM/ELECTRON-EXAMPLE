import { createFileRoute, useRouter } from '@tanstack/react-router'
import cx from 'classnames'
import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { User, NewUser, IPCResponse } from '../lib/types'
import logger from '../lib/logger'

const logPrefix = `[RENDER > homepage]`

export const Route = createFileRoute('/')({
  component: Index
})

export function Index() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Fetch users
  const { data: usersResponse, isLoading, error: fetchError } = useQuery<IPCResponse<User[]>>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await window.ipcRenderer.invoke('db/user/getList')
        return response
      } catch (err) {
        logger.error(`${logPrefix} Error fetching user list:`, err)
        throw err
      }
    }
  })
  
  // Log any fetch errors
  useEffect(() => {
    if (fetchError) {
      logger.error(`${logPrefix} Query error fetching users:`, fetchError)
      setError('Failed to load users. Check the logs for details.')
    }
  }, [fetchError])
  
  const users = usersResponse?.data || []
  
  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData: NewUser) => {
      try {
        const response = await window.ipcRenderer.invoke('db/user/addOrUpdate', userData)
        
        // Check for error response
        if (response.code !== 200) {
          logger.error(`${logPrefix} Error adding user:`, response)
          throw new Error(response.msg || 'Failed to add user')
        }
        
        return response
      } catch (err) {
        logger.error(`${logPrefix} Error in addUserMutation:`, err)
        throw err
      }
    },
    onSuccess: () => {
      // Reset form
      setUsername('')
      setEmail('')
      setError(null)
      // Refetch users
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err: Error) => {
      logger.error(`${logPrefix} Mutation error adding user:`, err)
      setError(`Failed to add user: ${err.message}`)
    }
  })
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      try {
        const response = await window.ipcRenderer.invoke('db/user/deleteById', { id: userId })
        
        // Check for error response
        if (response.code !== 200) {
          logger.error(`${logPrefix} Error deleting user:`, response)
          throw new Error(response.msg || 'Failed to delete user')
        }
        
        return response
      } catch (err) {
        logger.error(`${logPrefix} Error in deleteUserMutation:`, err)
        throw err
      }
    },
    onSuccess: () => {
      // Refetch users
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err: Error) => {
      logger.error(`${logPrefix} Mutation error deleting user:`, err)
      setError(`Failed to delete user: ${err.message}`)
    }
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (username && email) {
      addUserMutation.mutate({ username, email })
    } else {
      setError('Username and email are required')
      logger.warn(`${logPrefix} Form validation failed - missing fields`)
    }
  }
  
  return (
    <div className={cx('flex flex-col items-center w-full py-8 px-4 overflow-y-auto')}>
      <h1 className="text-2xl font-bold text-white">Welcome to Electron Example</h1>
      
      <div>
        <button 
          className={cx('border border-white p-2 m-2 rounded-md hover:bg-blue-600 text-white transition-colors')}
          onClick={() => router.navigate({ to: '/settings' })}
        >Settings</button>
      </div>

      {/* User Form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        
        {/* Error message */}
        {(error || addUserMutation.error) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || (addUserMutation.error as Error)?.message || 'An error occurred'}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={addUserMutation.isPending}
            className={cx(
              'w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors',
              { 'opacity-50 cursor-not-allowed': addUserMutation.isPending }
            )}
          >
            {addUserMutation.isPending ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>
      
      {/* User List */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">User List</h2>
        {isLoading || deleteUserMutation.isPending ? (
          <p>Loading users...</p>
        ) : users.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {users.map((user: User) => (
              <li key={user.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => deleteUserMutation.mutate(user.id)}
                  disabled={deleteUserMutation.isPending}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete user"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No users found. Add your first user above!</p>
        )}
      </div>
      
      <div className="mt-4 text-white text-sm">
        <p>CUSTOM_ENV_VAR: {window.env.CUSTOM_ENV_VAR}</p>
        <p>NODE_ENV: {window.env.NODE_ENV}</p>
      </div>
    </div>
  )
}