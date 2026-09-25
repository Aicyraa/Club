import AppError from '@error/appError'
import type { Request, Response, NextFunction } from 'express'

// Accessing date
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
   if (!req.isAuthenticated()) {
      next(new AppError('Unauthorized.', 401))
   }
   next()
}

// Checking if user is authenticated from UI
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
   if (!req.isAuthenticated()) {
      next(new AppError('Unauthorized.', 401))
   }

   return res
      .status(200)
      .json({ status: 200, success: true, message: 'Authenticated.', user: req.user })
}
