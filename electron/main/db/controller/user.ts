import { userServices } from '../services/user'
import { ipcMain } from 'electron'
import log from '../../logger'

ipcMain.handle('db/user/getList', async (event, arg) => {
  log.info('[IPC] Received db/user/getList request')
  try {
    const result = await userServices.getUserList()
    log.info('[IPC] db/user/getList response:', result)
    return result
  } catch (error) {
    log.error('[IPC] Error in db/user/getList:', error)
    return { code: 500, msg: `Error getting user list: ${error.message}` }
  }
})

ipcMain.handle('db/user/addOrUpdate', async (event, arg) => {
  log.info('[IPC] Received db/user/addOrUpdate request with data:', arg)
  try {
    const data = arg
    let res
    
    if (data.id) {
      log.info(`[IPC] Updating existing user with ID: ${data.id}`)
      res = await userServices.updateUserById(data.id, data)
    } else {
      log.info('[IPC] Creating new user:', data)
      const newData = { ...data }
      delete newData.id
      res = await userServices.insertUser(newData)
    }
    
    log.info('[IPC] db/user/addOrUpdate response:', res)
    return res
  } catch (error) {
    log.error('[IPC] Error in db/user/addOrUpdate:', error)
    return { code: 500, msg: `Error adding/updating user: ${error.message}` }
  }
})

ipcMain.handle('db/user/getInfoById', async (event, { id }) => {
  log.info(`[IPC] Received db/user/getInfoById request for ID: ${id}`)
  try {
    const result = await userServices.getUserById(id)
    log.info('[IPC] db/user/getInfoById response:', result)
    return result
  } catch (error) {
    log.error(`[IPC] Error in db/user/getInfoById for ID ${id}:`, error)
    return { code: 500, msg: `Error getting user info: ${error.message}` }
  }
})

ipcMain.handle('db/user/deleteById', async (event, { id }) => {
  log.info(`[IPC] Received db/user/deleteById request for ID: ${id}`)
  try {
    const result = await userServices.deleteUserById(id)
    log.info('[IPC] db/user/deleteById response:', result)
    return result
  } catch (error) {
    log.error(`[IPC] Error in db/user/deleteById for ID ${id}:`, error)
    return { code: 500, msg: `Error deleting user: ${error.message}` }
  }
})
