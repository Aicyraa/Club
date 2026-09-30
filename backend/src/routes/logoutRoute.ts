import { Router } from 'express'
import { destroySession, requireAuth } from '@middlewares/auth'

export const logout = Router()

logout.post('/', requireAuth, destroySession)
