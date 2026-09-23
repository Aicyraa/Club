import type { Request, Response, NextFunction } from 'express'
import type { RequestWithBody, User } from '@custom-types/type'

import passport from 'passport'
import { validationResult } from 'express-validator'

interface LoginBody {
   username: string
   password: string
}

export const postLogin = (
   req: RequestWithBody<LoginBody>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, success: false, errors: errors.array() })
   }

   passport.authenticate('local', (err: unknown, user: Express.User | null) => {
      if (err) {
         return next(err)
      }

      if (!user) {
         return res
            .status(401)
            .json({ status: 401, success: false, message: 'Invalid credentials.' })
      }

      req.logIn(user, (loginErr: unknown) => {
         if (loginErr) {
            return next(loginErr)
         }

         const { password: _password, ...publicUser } = user as unknown as User
         return res.status(200).json({ status: 200, success: true, user: publicUser })
      })
   })(req, res, next)
}
