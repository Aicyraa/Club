import ApiResponse from '@utils/ApiResponse'
import AppError from '../utils/appError'
import type { Request, Response, NextFunction } from 'express'
import type { User } from '@repo/types'

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
   if (!req.isAuthenticated()) {
      return next(new AppError('Unauthorized.', 401))
   }
   next()
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
   if (!req.isAuthenticated()) {
      return next(new AppError('Unauthorized.', 401))
   }

   const { password: _password, ...user } = req.user as User
   return res.status(200).json(new ApiResponse('Authenticated', 200, user))
}

export const destroySession = (req: Request, res: Response, next: NextFunction) => {
   req.logOut((err) => {
      if (err) {
         return next(err)
      }

      req.session.destroy((err) => {
         if (err) {
            return next(err)
         }

         res.clearCookie('club.sid', {
            httpOnly: true,
            secure: process.env.ENVIRONMENT === 'PROD',
            sameSite: 'lax',
         })
         res.status(200).json(new ApiResponse('Log Out Success', 200))
      })
   })
}
