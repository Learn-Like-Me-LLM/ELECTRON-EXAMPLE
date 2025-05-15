import { asc, between, count, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '../dbConnect'
import { users } from '../schema'
import { response } from '../../utils/response'
import log from '../../logger'

export class userServices {
  static async getUserById(id: number) {
    log.info(`[DB] Getting user by ID: ${id}`)
    try {
      const info = await db.select().from(users).where(eq(users.id, id))
      log.info(`[DB] User query result:`, info)
      if(!info || info.length === 0){
        log.warn(`[DB] User with ID ${id} not found`)
        return response.error({msg:'User does not exist'})
      }
      return response.ok({data:info[0]})
    } catch (error) {
      log.error(`[DB] Error getting user by ID ${id}:`, error)
      return response.error({msg: `Error getting user: ${error.message}`})
    }
  }

  static async updateUserById(id: number, data: any) {
    log.info(`[DB] Updating user with ID ${id}:`, data)
    try {
      const result = db.transaction(() => {
        return db.update(users)
          .set(data)
          .where(eq(users.id, id))
          .run();
      });
      
      if (!result || result.changes === 0) {
        log.warn(`[DB] No rows affected when updating user ${id}`);
        return response.error({msg: 'User update failed - no rows affected'});
      }
      
      log.info(`[DB] User ${id} updated successfully`);
      return response.ok();
    } catch (error) {
      log.error(`[DB] Error in updateUserById for ID ${id}:`, error);
      return response.error({msg: `Error updating user: ${error.message}`});
    }
  }
  
  static async insertUser(data: any) {
    log.info(`[DB] Inserting new user:`, data)
    try {
      // Prepare the data with timestamps
      const now = new Date();
      const insertData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const result = db.transaction(() => {
        return db.insert(users)
          .values(insertData)
          .run();
      });
      
      if (!result || !result.lastInsertRowid) {
        log.warn(`[DB] Insert failed`);
        return response.error({msg: 'User insert failed'});
      }
      
      log.info(`[DB] User inserted successfully with ID: ${result.lastInsertRowid}`);
      return response.ok({data: {id: result.lastInsertRowid}});
    } catch (error) {
      log.error(`[DB] Error in insertUser:`, error);
      return response.error({msg: `Error inserting user: ${error.message}`});
    }
  }

  static async getUserList() {
    log.info(`[DB] Getting user list`)
    try {
      const list = await db.select().from(users)
      log.info(`[DB] Retrieved ${list?.length || 0} users`)
      return response.ok({data: list || []})
    } catch (error) {
      log.error(`[DB] Error getting user list:`, error)
      return response.error({msg: `Error getting user list: ${error.message}`})
    }
  }

  static async deleteUserById(id: number) {
    log.info(`[DB] Deleting user with ID ${id}`)
    try {
      const result = db.transaction(() => {
        return db.delete(users)
          .where(eq(users.id, id))
          .run();
      });
      
      if (!result || result.changes === 0) {
        log.warn(`[DB] No rows affected when deleting user ${id}`);
        return response.error({msg: 'User deletion failed - no rows affected'});
      }
      
      log.info(`[DB] User ${id} deleted successfully`);
      return response.ok();
    } catch (error) {
      log.error(`[DB] Error in deleteUserById for ID ${id}:`, error);
      return response.error({msg: `Error deleting user: ${error.message}`});
    }
  }
}
