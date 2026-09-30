import type { User } from '@repo/types'
import type { QueryResult, QueryResultRow } from 'pg'
import pool from './pool'
import { mapPgError } from '../error/dbError'

export const query = async <T extends QueryResultRow>(
   text: string,
   params?: unknown[],
): Promise<QueryResult<T>> => {
   try {
      return await pool.query<T>(text, params)
   } catch (error: unknown) {
      throw mapPgError(error)
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
   return await query<User>(
      `
         SELECT * FROM users 
         WHERE user_id = $1 
      `,
      [id],
   )
}

// --- Messages ----------------------------------------------------------------

export interface MessageFields {
   message_id: string
   title: string
   message: string
   created_at: Date
   is_anonymous: boolean
   author_id: string | null
   author_name: string | null
   author_avatar: string | null
}

export interface AddMessageFields {
   user_id: string
   title: string
   message: string
   is_anonymous: boolean
}

export const addMessage = async (fields: AddMessageFields) => {
   return await query<MessageFields>(
      `
         INSERT INTO messages (user_id, title, message, is_anonymous)
         VALUES ($1, $2, $3, $4)
         RETURNING message_id
      `,
      [fields.user_id, fields.title, fields.message, fields.is_anonymous],
   )
}

/**
 * One page of the feed, newest first.
 *
 * Author visibility is enforced in SQL rather than stripped afterwards. A
 * normal viewer never receives identity columns, members see named posts, and
 * only administrators can reveal an explicitly anonymous post for moderation.
 */
export const getMessages = async (
   page: number,
   pageLimit: number,
   revealAuthor: boolean,
   revealAnonymousAuthor: boolean,
) => {
   return await query<MessageFields>(
      `
         SELECT
            m.message_id,
            m.title,
            m.message,
            m.created_at,
            m.is_anonymous,
            CASE WHEN $1::boolean AND (NOT m.is_anonymous OR $2::boolean) THEN u.user_id   END AS author_id,
            CASE WHEN $1::boolean AND (NOT m.is_anonymous OR $2::boolean) THEN u.username  END AS author_name,
            CASE WHEN $1::boolean AND (NOT m.is_anonymous OR $2::boolean) THEN u.avatar_url END AS author_avatar
         FROM messages m
         LEFT JOIN users u ON u.user_id = m.user_id
         ORDER BY m.created_at DESC, m.message_id DESC
         LIMIT $3 OFFSET $4
      `,
      [revealAuthor, revealAnonymousAuthor, pageLimit, (page - 1) * pageLimit],
   )
}

export const countMessages = async () => {
   const { rows } = await query<{ total: string }>(
      `
         SELECT COUNT(*)::text AS total
         FROM messages
      `,
   )

   return Number(rows[0]?.total ?? 0)
}

export const countMessagesByUser = async (userId: string) => {
   const { rows } = await query<{ total: string }>(
      `
         SELECT COUNT(*)::text AS total
         FROM messages
         WHERE user_id = $1
      `,
      [userId],
   )

   return Number(rows[0]?.total ?? 0)
}

export const deleteMessage = async (messageId: string) => {
   return await query(
      `
         DELETE FROM messages
         WHERE message_id = $1
      `,
      [messageId],
   )
}

// --- Profile mutations -------------------------------------------------------

export const updateUser = async (
   id: string,
   fields: Partial<Pick<User, 'username' | 'avatar_url' | 'password'>>,
) => {
   // Built from a fixed column list so the keys can never be user-controlled
   // input spliced into SQL text.
   const columns: string[] = []
   const values: unknown[] = []

   for (const [column, value] of Object.entries(fields)) {
      if (value === undefined) {
         continue
      }

      values.push(value)
      columns.push(`${column} = $${values.length}`)
   }

   if (!columns.length) {
      return await getUserById(id)
   }

   return await query<User>(
      `
         UPDATE users
         SET ${columns.join(', ')}
         WHERE user_id = $${values.length + 1}
         RETURNING *
      `,
      [...values, id],
   )
}

export const promoteToMember = async (id: string) => {
   return await query<User>(
      `
         UPDATE users
         SET is_member = TRUE
         WHERE user_id = $1
         RETURNING *
      `,
      [id],
   )
}
