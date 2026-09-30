import { body, param } from 'express-validator'

const validPasswordLength = (value: string) => Buffer.byteLength(value, 'utf8') <= 72

const username = (field = 'username') =>
   body(field)
      .trim()
      .isString()
      .bail()
      .notEmpty()
      .withMessage('Username is empty.')
      .isLength({ min: 3, max: 32 })
      .withMessage('Username must be between 3 and 32 characters.')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username may only contain letters, numbers, underscores, and hyphens.')

const password = (field: string, label: string) =>
   body(field)
      .isString()
      .bail()
      .notEmpty()
      .withMessage(`${label} is empty.`)
      .isLength({ min: 6 })
      .withMessage(`${label} cannot be less than 6.`)
      .custom(validPasswordLength)
      .withMessage(`${label} cannot be longer than 72 bytes.`)

export const signinForm = [
   body('email')
      .trim()
      .isEmail()
      .withMessage('Email is invalid.')
      .isLength({ max: 254 })
      .withMessage('Email is too long.')
      .normalizeEmail(),
   username(),
   password('password', 'Password'),
]

export const loginForm = [username(), password('password', 'Password')]

// The message body field is called `message`, not `body` — `body` is the
// express-validator accessor this whole file is built from.
export const messageForm = [
   body('title')
      .trim()
      .isString()
      .notEmpty()
      .withMessage('Title is empty.')
      .isLength({ max: 120 })
      .withMessage('Title cannot be longer than 120.'),
   body('message')
      .trim()
      .isString()
      .notEmpty()
      .withMessage('Message is empty.')
      .isLength({ max: 5000 })
      .withMessage('Message cannot be longer than 5000.'),
   body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('is_anonymous must be a boolean.')
      .toBoolean(),
]

export const updateProfileForm = [
   username().optional(),
   body('avatar_url')
      .optional()
      .trim()
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Avatar must be a valid URL.'),
   body().custom((value) => {
      if (value?.username === undefined && value?.avatar_url === undefined) {
         throw new Error('Provide at least one profile field.')
      }

      return true
   }),
]

export const changePasswordForm = [
   password('currentPassword', 'Current password'),
   password('newPassword', 'New password'),
]

export const membershipForm = [
   body('code').trim().isString().notEmpty().withMessage('Membership code is empty.'),
]

export const messageIdParam = [
   param('id').isInt({ min: 1 }).withMessage('Message id must be a positive integer.'),
]
