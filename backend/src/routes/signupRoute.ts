import { Router } from 'express'
import { postUser } from '@/controllers/signupController'
import { signinForm } from '@/middlewares/formValidator'
import { formLimiter } from '@/middlewares/rateLimiter';

const signup = Router()

signup.post('/signin', formLimiter ,signinForm, postUser)
