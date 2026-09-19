import { RequestError } from '@/types';
import type { Request, Response, NextFunction } from 'express'

export const errorHandler = (err: RequestError, req: Request, res: Response, next: NextFunction) => {
   console.log(err.message)

   const message = err.message || 'Internal Server Error!'
   const statusCode = err.statusCode || 500

   res.status(statusCode).json({
      success: false,
      error: {
         statusCode,
         message,
      },
   })
}
