import type { RequestWithBody, User } from '@custom-types/type'
import type { NextFunction, Request, Response } from 'express'

import AppError from '@utils/appError'
import { validationResult } from 'express-validator'
import passport from 'passport'
import ApiResponse from '@utils/ApiResponse'

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
      return next(new AppError(errors.array as unknown as string, 400))
   }

   passport.authenticate('local', (err: unknown, user: Express.User | null) => {
      if (err) {
         return next(err)
      }

      if (!user) {
         return next(new AppError('Invalid Credentials.', 401))
      }

      req.logIn(user as User, (loginErr: unknown) => {
         if (loginErr) {
            return next(loginErr)
         }

         const { password: _password, ...publicUser } = user as unknown as User
         return res.status(200).json(new ApiResponse('Logged In', 200, publicUser))
      })
   })(req, res, next)
}
