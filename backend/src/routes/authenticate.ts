import { Router } from 'express'
import { isAuthenticated } from '@middlewares/auth'

export const authenticate = Router()

authenticate.post('/me', isAuthenticated)
