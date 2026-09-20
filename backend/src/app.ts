import type { Express } from 'express'
import type { Session } from 'express-session'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import helmet from 'helmet'
import { unknownPage } from '@middlewares/404'
import { generalLimiter } from '@middlewares/rateLimiter'
import { errorHandler } from '@middlewares/errorHandler'
import { signup } from '@routes/signupRoute'

const PORT = process.env.PORT
const app: Express = express()

app.use(session({ secret: 'cats', resave: false, saveUninitialized: false }))
app.use(passport.session())
app.use(helmet())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(generalLimiter)

app.use('/signup', signup)

app.use(unknownPage)
app.use(errorHandler)

app.listen(PORT, () => {
   if (process.env.ENVIRONMENT === 'DEV') {
      console.log(`Backend: Server listening on port  ${PORT}`)
   }
})
