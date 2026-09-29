import { Request, Response, NextFunction } from 'express'

export const checkUserStatus = (req: Request, res: Response, next: NextFunction) => {
   const user = req.user

   if (user?.is_admin) {
      next('/admin')
   }

   console.log('test')

   if (user?.is_member) {
      next('/member')
   }

   next()
}
