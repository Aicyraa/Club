import AppError from '@error/appError'

export interface User {
   id: number
   email: string
   username: string
   avatarUrl: string | null
   isMember: boolean
   isAdmin: boolean
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

export interface DbErrorDetails {
   code?: string
   constraint?: string
   detail?: string
   hint?: string
   table?: string
   column?: string
   schema?: string
   routine?: string
}

export interface RequestError extends AppError {
   message: string
   statusCode: number
   status: string
   isOperational: boolean
}

// --- Inherits from Express.Request and adds optional body, params, and query properties with generic types B, P, and Q respectively. This allows for type-safe access to request data in Express route handlers. --- 

interface Request<B, P, Q> extends Express.Request {
   body?: B
   params?: P
   query?: Q
}

export type RequestWithBody<B> = Request<B, Record<string, unknown>, Record<string, unknown>>
export type RequestWithParams<P> = Request<Record<string, unknown>, P, Record<string, unknown>>       