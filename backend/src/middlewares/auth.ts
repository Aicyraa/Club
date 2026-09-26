import ResponseJson from '@utils/responseJson'
import AppError from '../utils/appError'
import type { Request, Response, NextFunction } from 'express'

// Accessing date
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
   if (!req.isAuthenticated()) {
      return next(new AppError('Unauthorized.', 401))
   }
   next()
}

// Checking if user is authenticated from UI
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
   if (!req.isAuthenticated()) {
      return next(new AppError('Unauthorized.', 401))
   }

   return res.status(200).json(new ResponseJson('Authenticated', 200, req.user))
}

export const destroySession = (req: Request, res: Response, next: NextFunction) => {
   req.logOut(err => {
      if (err) {
         return next(new Error(err))
      }

      req.session.destroy(err => {
         if (err) {
            return next(new Error(err))
         }

         res.clearCookie('connect.sid')
         res.status(200).json(new ResponseJson('Log Out Success', 200))
      })
   })
}
