import type { Request, Response, NextFunction } from 'express'
import type { RequestWithBody, User } from '@custom-types/type'

import passport from 'passport'
import { validationResult } from 'express-validator'
import AppError from '@error/appError'

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
      next(new AppError(errors.array as unknown as string, 400))
   }

   passport.authenticate('local', (err: unknown, user: Express.User | null) => {
      if (err) {
         return next(err)
      }

      if (!user) {
         next(new AppError('Invalid Credentials.', 401))
      }

      req.logIn(user as User, (loginErr: unknown) => {
         if (loginErr) {
            return next(loginErr)
         }

         const { password: _password, ...publicUser } = user as unknown as User
         return res.status(200).json({ success: true, status: 200, user: publicUser })
      })
   })(req, res, next)
}
