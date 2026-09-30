import { Router } from 'express'
import { postUser } from '@controllers/signupController'
import { signinForm } from '@middlewares/formValidator'
import { signupLimiter } from '@middlewares/rateLimiter'

export const signup = Router()

signup.post('/', signupLimiter, signinForm, postUser)
