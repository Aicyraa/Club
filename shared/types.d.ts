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

export interface Message {
   id: number
   title: string
   message: string
   createdAt: Date
   author: string
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
