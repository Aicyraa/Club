import type { RequestError } from '@custom-types'
import { DbError } from '@error/dbError'
import type { Request, Response, NextFunction } from 'express'

export const errorHandler = (
   err: RequestError,
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   console.error(err)

   const statusCode = err.statusCode || 500
   const isDev = process.env.ENVIRONMENT === 'DEV'
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

   if (err instanceof DbError && isDev) {
      body.error = {
         ...(body.error as object),
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
