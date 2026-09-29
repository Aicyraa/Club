import type { User } from '@repo/types'
import AppError from '@utils/appError'
import type { QueryResult, QueryResultRow } from 'pg'
import { DatabaseError } from 'pg'
import pool from './pool'

export const query = async <T extends QueryResultRow>(
   text: string,
   params?: unknown[],
): Promise<QueryResult<T>> => {
   try {
      return await pool.query<T>(text, params)
   } catch (error: unknown) {
      const errorDB = error as DatabaseError
      throw new AppError(errorDB.message, errorDB.code as unknown as number)
   }
}

export const addUser = async (user: User) => {
   return await query(
      `
         INSERT INTO users (email, username, password, avatar_url)
         VALUES ($1, $2, $3, $4)
      `,
      [user.email, user.username, user.password, user.avatar_url],
   )
}

export const getUser = async (username: string) => {
   return await query(
      `
         SELECT * FROM users 
         WHERE username = $1 
      `,
      [username],
   )
}

export const getUserById = async (id: string) => {
   return await query(
      `
         SELECT * FROM users 
         WHERE user_id = $1 
      `,
      [id],
   )
}
