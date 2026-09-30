import { Router } from 'express'

import { requireAuth } from '@middlewares/auth'
import { requireAdmin } from '@middlewares/messageMiddleware'
import { messageForm, messageIdParam } from '@middlewares/formValidator'
import { getAllMessages, postMessage, removeMessage } from '@controllers/messageController'

export const messages = Router()

/**
 * One endpoint, three views. The role comes from the session, not the URL — a
 * `/member` and `/admin` variant would only give the client a way to ask for
 * the wrong one, and the guard would still have to run either way.
 */
messages.get('/', requireAuth, getAllMessages)
messages.post('/', requireAuth, messageForm, postMessage)
messages.delete('/:id', requireAuth, requireAdmin, messageIdParam, removeMessage)
