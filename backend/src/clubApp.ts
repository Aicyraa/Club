// Keep the Express app separate from Vercel's compiled entrypoint.
import type { Express } from 'express'

import express from 'express'
import session from 'express-session'
import passport from 'passport'
import helmet from 'helmet'
import cors from 'cors'
import connectPgSimple from 'connect-pg-simple'

import './config/passport'
import { unknownPage } from '@middlewares/404'
import { generalLimiter } from '@middlewares/rateLimiter'
import { errorHandler } from '@middlewares/errorHandler'
import { signup } from '@routes/signupRoute'
import { login } from '@routes/loginRoute'
import { logout } from '@routes/logoutRoute'
import { authenticate } from '@routes/authenticate'
import { messages } from '@routes/messageRoute'
import { profiles } from '@routes/profileRoute'
import pool from '@models/pool'

const environment = process.env.ENVIRONMENT
const sessionSecret = process.env.SECRET?.trim()
const corsOrigins = process.env.CORS_ORIGIN?.split(',')
   .map((origin) => origin.trim())
   .filter(Boolean)

if (environment !== 'DEV' && environment !== 'PROD') {
   throw new Error('ENVIRONMENT must be set to either DEV or PROD.')
}

if (!sessionSecret) {
   throw new Error('SECRET environment variable is not set.')
}

if (corsOrigins?.includes('*')) {
   throw new Error('CORS_ORIGIN cannot contain * when session credentials are enabled.')
}

if (environment === 'PROD' && Buffer.byteLength(sessionSecret) < 32) {
   throw new Error('SECRET must be at least 32 bytes in production.')
}

const isProduction = environment === 'PROD'
const app: Express = express()

// Sessions live in Postgres, not the default MemoryStore, which leaks and drops
// every session on restart. The existing pool is reused so the app still opens
// exactly one set of connections.
const PgStore = connectPgSimple(session)
export const sessionStore = new PgStore({
   pool,
   tableName: 'session',
   // Production deploys should apply sql/schema.sql with a database role that
   // can run DDL instead of granting table-creation privileges to the app.
   createTableIfMissing: !isProduction,
})

if (isProduction) {
   // Trust the first TLS-terminating reverse proxy so secure cookies are sent.
   app.set('trust proxy', 1)
}

if (corsOrigins?.length) {
   app.use(
      cors({
         origin: corsOrigins,
         credentials: true,
      }),
   )
}

app.use(generalLimiter)
app.use(helmet())

app.use(
   session({
      store: sessionStore,
      name: 'club.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
         maxAge: 1000 * 60 * 60 * 24,
         httpOnly: true,
         secure: isProduction,
         sameSite: 'lax',
      },
   }),
)

app.use(passport.initialize())
app.use(passport.session())

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

app.use('/api/v1/me', authenticate)
app.use('/api/v1/signup', signup)
app.use('/api/v1/login', login)
app.use('/api/v1/logout', logout)
app.use('/api/v1/messages', messages)
app.use('/api/v1/profiles', profiles)

app.use(unknownPage)
app.use(errorHandler)

export default app
