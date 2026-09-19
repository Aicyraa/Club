import { Router } from 'express'
import { postUser } from '../controllers/signupController'

const signup = Router()

signup.post('/signin', postUser)
