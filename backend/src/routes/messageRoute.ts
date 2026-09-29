import { requireAuth } from '@middlewares/auth'
import { checkUserStatus } from '@middlewares/messageMiddleware'
import { Router } from 'express'

export const messages = Router()

messages.get('', requireAuth, checkUserStatus, )
messages.get('/member', requireAuth, )
messages.get('/admin', requireAuth, )
