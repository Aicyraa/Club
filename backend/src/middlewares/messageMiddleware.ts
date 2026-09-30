import type { Role } from '@repo/types'
import type { NextFunction, Request, Response } from 'express'

import AppError from '@utils/appError'

/**
 * Derives a role from the session user.
 *
 * Admin is checked before member on purpose: a user can carry both flags, and
 * admin must always win so that `requireAdmin` never rejects a real admin.
 */
export const getRole = (user?: Express.User): Role => {
   if (user?.is_admin) {
      return 'admin'
   }

   if (user?.is_member) {
      return 'member'
   }

   return 'normal'
}

export const hasRole = (user: Express.User | undefined, ...allowed: Role[]): boolean => {
   return allowed.includes(getRole(user))
}

/**
 * Requires a `normal` user — a member or admin who calls this is a client bug,
 * not a privilege escalation, so it short-circuits instead of erroring.
 */
export const rejectPrivileged = (req: Request, _res: Response, next: NextFunction) => {
   if (hasRole(req.user, 'member', 'admin')) {
      return next(new AppError('This action is only available to normal members.', 403))
   }

   next()
}

export const requireMember = (req: Request, _res: Response, next: NextFunction) => {
   if (!hasRole(req.user, 'member', 'admin')) {
      return next(new AppError('Members only.', 403))
   }

   next()
}

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
   if (!hasRole(req.user, 'admin')) {
      return next(new AppError('Admins only.', 403))
   }

   next()
}
