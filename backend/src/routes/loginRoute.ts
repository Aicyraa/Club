import { Router } from 'express'
import { formLimiter } from '@middlewares/rateLimiter'
import { loginForm } from '@middlewares/formValidator'
import { postLogin } from '@controllers/loginController'

export const login = Router()

login.post('/', formLimiter, loginForm, postLogin)