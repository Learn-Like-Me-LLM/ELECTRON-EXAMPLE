import { userServices } from '../services/user'
import { ipcMain } from 'electron'

ipcMain.handle('db/user/getList', async (event, arg) => {
  return await userServices.getUserList()
})

ipcMain.handle('db/user/addOrUpdate', async (event, arg) => {
  const data = arg
  let res
  if (data.id) {
    res = await userServices.updateUserById(data.id, data)
  } else {
    const newData = { ...data }
    delete newData.id
    res = await userServices.insertUser(newData)
  }
  return res
})

ipcMain.handle('db/user/getInfoById', async (event, { id }) => {
  return await userServices.getUserkById(id)
})

ipcMain.handle('db/user/deleteById', async (event, { id }) => {
  return await userServices.deleteUserById(id)
})
