import type { Express } from 'express'

import express from 'express'
import session from 'express-session'
import passport from 'passport'
import helmet from 'helmet'

import './config/passport'
import { unknownPage } from '@middlewares/404'
import { generalLimiter } from '@middlewares/rateLimiter'
import { errorHandler } from '@middlewares/errorHandler'
import { signup } from '@routes/signupRoute'
import { login } from '@routes/loginRoute'

const PORT = process.env.PORT
const SESSION_SECRET = process.env.SECRET || 'dev-secret'
const isDev = process.env.ENVIRONMENT === 'DEV'
const app: Express = express()

app.set('trust proxy', 1)

app.use(generalLimiter)
app.use(helmet())

app.use(
   session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
         maxAge: 1000 * 60 * 60 * 24,
         httpOnly: true,
         secure: !isDev,
         sameSite: 'lax',
      },
   }),
)
app.use(passport.session())

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

app.use('/signup', signup)
app.use('/login', login)

app.use(unknownPage)
app.use(errorHandler)

app.listen(PORT, () => {
   if (process.env.ENVIRONMENT === 'DEV') {
      console.log(`Backend: Server listening on port  ${PORT}`)
   }
})

export default passport
