export interface User {
   user_id: string
   email: string
   username: string
   avatar_url: string | null
   is_member: boolean
   is_admin: boolean
   password: string
}

export type PublicUser = Omit<User, 'password'>

export type Role = 'normal' | 'member' | 'admin'

/**
 * The subset of a user that is safe to expose alongside a message. The backend
 * nulls every field for `normal` viewers, so `author: null` on a Message means
 * "render this as Anonymous" — never "we forgot to join".
 */
export interface MessageAuthor {
   user_id: string
   username: string
   avatar_url: string | null
}

export interface Message {
   message_id: number
   title: string
   message: string
   /** ISO 8601 string. It arrives as JSON, so it is not a `Date`. */
   created_at: string
   is_anonymous: boolean
   /** Null when the viewer is `normal`, or when the author is hidden. */
   author: MessageAuthor | null
   can_delete: boolean
}

export interface Paginated<T> {
   items: T[]
   total: number
   page: number
   pageLimit: number
   totalPages: number
}

export interface Profile extends PublicUser {
   messageCount: number
   role: Role
}

export interface SignupFields {
   email: string
   username: string
   password: string
}

export type LoginFields = Omit<SignupFields, 'email'>

export interface ApiResponse<T = undefined> {
   success: boolean
   message: string
   statusCode: number
   data?: T
}
