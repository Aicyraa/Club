import type { RequestError } from '@custom-types/type'
import type { Request, Response, NextFunction } from 'express'
import { DbError } from '../error/dbError'

export const errorHandler = (
   err: RequestError,
   _req: Request,
   res: Response,
   _next: NextFunction,
) => {
   const candidateStatus = Number(err.statusCode)
   const statusCode =
      Number.isInteger(candidateStatus) && candidateStatus >= 400 && candidateStatus <= 599
         ? candidateStatus
         : 500
   const isDev = process.env.ENVIRONMENT === 'DEV'

   // Expected client errors are not server failures and can be extremely
   // noisy (for example, bad login attempts). Keep stacks for development and
   // genuine 5xx diagnostics only.
   if (isDev || statusCode >= 500) {
      console.error(`
         Cause: ${err.message}
         Trace: ${err.stack}
      `)
   }

   const message =
      isDev || statusCode < 500
         ? err.message || 'Internal Server Error!'
         : 'Internal Server Error!'

   const body: Record<string, unknown> = {
      success: false,
      error: {
         statusCode,
         message,
      },
   }

   if (isDev && err instanceof DbError) {
      body.error = {
         ...(body.error as Record<string, unknown>),
         details: {
            code: err.code,
            constraint: err.constraint,
            table: err.table,
            column: err.column,
            detail: err.detail,
            hint: err.hint,
         },
      }
   }

   res.status(statusCode).json(body)
}
