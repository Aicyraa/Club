import { rateLimit } from 'express-rate-limit'

export const generalLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 200,
   standardHeaders: true,
   legacyHeaders: false,
   message: 'Too many requests, please try again later.',
})

export const formLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 30,
   standardHeaders: true,
   legacyHeaders: false,
   message: 'Too many form submissions, please try again later.',
})
