import type { Request, Response, NextFunction } from 'express'

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
   if (!req.isAuthenticated()) {
      return res.status(401).json({ status: 401, success: false, message: 'Unauthorized.' })
   }
   next()
}