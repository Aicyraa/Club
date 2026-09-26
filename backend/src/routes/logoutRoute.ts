import { Router } from 'express'
import { destroySession } from '@middlewares/auth'

export const logout = Router()

logout.get('/', destroySession)