export type Children = { children: React.ReactNode }

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


export interface SignupFields {
   email: string
   username: string
   password: string
}

export type LoginFields = Omit<SignupFields, 'email'>


export interface ApiReponse<T = undefined > {
   success: boolean
   message: string
   statusCode: number
   data?: T
} 