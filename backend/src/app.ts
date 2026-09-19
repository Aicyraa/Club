import type { Express, Request, Response, NextFunction } from 'express'
import type { CustomError } from './types'
import express from 'express'
import { generalLimiter } from './middlewares/rateLimiter'
import { errorHandler } from './middlewares/errorHandler'

const PORT = process.env.PORT
const app: Express = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(generalLimiter)

app.use((req: Request, res: Response, next: NextFunction) => {
   const error = new Error('Page Not Found') as CustomError;
   error.status = 404;
   next(error); 
})

app.use(errorHandler)

app.listen(PORT, () => {
   if (process.env.ENVIRONMENT === 'DEV') {
      console.log(`Backend: Server listening on port  ${PORT}`)
   }
})
