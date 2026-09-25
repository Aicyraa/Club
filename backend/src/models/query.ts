import type { QueryResultRow, QueryResult } from 'pg'
import type { User, Message } from '@custom-types/type'
import { DatabaseError } from 'pg'
import pool from './pool'
import AppError from '@error/appError'

export const query = async <T extends QueryResultRow>(
   text: string,
   params?: unknown[],
): Promise<QueryResult<T>> => {
   try {
      return await pool.query<T>(text, params)
   } catch (error: unknown ) {
      const errorDB = error as DatabaseError
      throw new AppError(errorDB.message, errorDB.code as unknown as number)
   }
}

export const addUser = async (user: User) => {
   return await query(
      `
         INSERT INTO users (email, username, password)
         VALUES ($1, $2, $3)
      `,
      [user.email, user.username, user.password],
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
         WHERE userid = $1 
      `,
      [id],
   )
}
