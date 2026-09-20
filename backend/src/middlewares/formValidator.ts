import { body } from 'express-validator'

export const signinForm = [
   body('email').trim().isEmail().withMessage('Email is invalid.'),
   body('username').trim().escape().isString().notEmpty().withMessage('Lastname is empty.'),
   body('password')
      .trim()
      .isString()
      .notEmpty()
      .withMessage('Password is empty.')
      .isLength({ min: 6 })
      .withMessage('Password cannot be less than 6.'),
]

export const loginForm = []
export const messageForm = []
