import { body } from 'express-validator'

export const signinForm = [
   body('firstname').escape().trim().isEmpty().withMessage('Firstname is empty.'),
   body('lastname').escape().trim().isEmpty().withMessage('Lastname is empty.'),
   body('password')
      .escape()
      .trim()
      .isEmpty()
      .withMessage('password is empty.')
      .isLength({ min: 6 })
      .withMessage('Password cannot be less than 6'),
]

export const loginForm = []
export const messageForm = []
