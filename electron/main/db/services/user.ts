import { asc, between, count, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../dbConnect'
import { users } from '../schema'
import { response } from '../../utils/response'

export class userServices {
  static async getUserById(id: number) {
    const info =  await db.select().from(users).where(eq(users.id, id))
    if(!info){
      return response.error({msg:'User does not exist'})
    }
    return response.ok({data:info?.[0]})
  }

  static async updateUserkById(id: number, data: any) {
    return await db.transaction(async tx => {
      const user = await tx.update(users).set(data).where(eq(users.id, id))
      if (!user) {
        tx.rollback()
        return response.error()
      }
      return response.ok()
    })
  }
  
  static async insertUser(data: any) {
    return await db.transaction(async tx => {
      const user = await tx.insert(users).values(data)
      if (!user) {
        tx.rollback()
        return response.error()
      }
      return response.ok()
    })
  }

  static async getUserList() {
    const list =  await db.select().from(users)
    return response.ok({data:list??[]})
  }

  static async deleteUserById(id: number) {
    return await db.transaction(async tx => {
      const user = await tx.delete(users).where(eq(users.id, id))
      if (!user) {
        tx.rollback()
        return response.error()
      }
      return response.ok()
    })
  }
}
