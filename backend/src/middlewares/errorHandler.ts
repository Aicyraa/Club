import type { RequestError } from '@custom-types/type'
import type { Request, Response, NextFunction } from 'express'

export const errorHandler = (
   err: RequestError,
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   console.error(`
      Cause: ${err.message}
      Trace: ${err.stack}
   `)

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

   res.status(statusCode).json(body)
}
