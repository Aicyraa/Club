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

const port = Number(process.env.PORT)
const environment = process.env.ENVIRONMENT
const sessionSecret = process.env.SECRET?.trim()
const corsOrigins = process.env.CORS_ORIGIN?.split(',')
   .map((origin) => origin.trim())
   .filter(Boolean)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
   throw new Error('PORT must be an integer between 1 and 65535.')
}

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
const sessionStore = new PgStore({
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

let server: ReturnType<typeof app.listen> | undefined
let isShuttingDown = false

const start = async () => {
   if (isProduction) {
      // Fail the deployment before it starts accepting traffic if the session
      // migration was skipped or has the wrong shape.
      await pool.query('SELECT sid, sess, expire FROM session LIMIT 0')
   } else {
      await pool.query('SELECT 1')
   }

   server = app.listen(port, () => {
      if (!isProduction) {
         console.log(`Backend: Server listening on port ${port}`)
      }
   })
}

const shutdown = async (signal: NodeJS.Signals) => {
   if (isShuttingDown) return
   isShuttingDown = true

   if (!isProduction) console.log(`Backend: Received ${signal}, shutting down`)

   const forceCloseTimer = setTimeout(() => server?.closeAllConnections(), 10_000)
   forceCloseTimer.unref()

   try {
      if (server) {
         await new Promise<void>((resolve, reject) => {
            server?.close((error) => (error ? reject(error) : resolve()))
         })
      }

      await sessionStore.close()
      await pool.end()
   } catch (error) {
      console.error('Backend: Graceful shutdown failed', error)
      process.exitCode = 1
   } finally {
      clearTimeout(forceCloseTimer)
   }
}

process.once('SIGTERM', () => void shutdown('SIGTERM'))
process.once('SIGINT', () => void shutdown('SIGINT'))

void start().catch(async (error: unknown) => {
   console.error('Backend: Startup failed', error)
   process.exitCode = 1
   await sessionStore.close()
   await pool.end()
})

export default passport
