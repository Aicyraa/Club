import type { QueryResultRow, QueryResult } from 'pg'
import type { User, Message } from '../types'
import pool from './pool'
import AppError from '../error/appError'

export const query = async <T extends QueryResultRow>(
   text: string,
   params?: unknown[],
): Promise<QueryResult<T>> => {
   try {
      return await pool.query<T>(text, params)
   } catch {
      throw new AppError('Database query failed.', 500)
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
