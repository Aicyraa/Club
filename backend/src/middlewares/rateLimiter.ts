import type { NextFunction, Request, Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import AppError from '@utils/appError'

const handler = (
   _req: Request,
   _res: Response,
   next: NextFunction,
   options: { message: unknown; statusCode: number },
) => {
   const message =
      typeof options.message === 'string'
         ? options.message
         : 'Too many requests, please try again later.'

   next(new AppError(message, options.statusCode))
}

export const generalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   limit: 300,
   standardHeaders: 'draft-8',
   legacyHeaders: false,
   message: 'Too many requests, please try again later.',
   handler,
})

export const loginLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   limit: 10,
   standardHeaders: 'draft-8',
   legacyHeaders: false,
   skipSuccessfulRequests: true,
   message: 'Too many failed login attempts, please try again later.',
   handler,
})

export const signupLimiter = rateLimit({
   windowMs: 60 * 60 * 1000,
   limit: 5,
   standardHeaders: 'draft-8',
   legacyHeaders: false,
   message: 'Too many accounts created from this address, please try again later.',
   handler,
})
