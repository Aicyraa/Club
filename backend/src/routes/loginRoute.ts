import { Router } from 'express'
import { loginLimiter } from '@middlewares/rateLimiter'
import { loginForm } from '@middlewares/formValidator'
import { postLogin } from '@controllers/loginController'

export const login = Router()

login.post('/', loginLimiter, loginForm, postLogin)
