import type { Profile, PublicUser, User } from '@repo/types'
import type { NextFunction, Request, Response } from 'express'
import type { RequestWithBody } from '@custom-types/type'

import { countMessagesByUser, getUserById, promoteToMember, updateUser } from '@models/query'
import { getRole } from '@middlewares/messageMiddleware'
import AppError from '@utils/appError'
import { matchedData, validationResult } from 'express-validator'
import ApiResponse from '@utils/ApiResponse'
import { timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'

/** Strips the password hash before anything leaves the server. */
const toPublic = (user: User): PublicUser => {
   const { password: _password, ...publicUser } = user
   return publicUser
}

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
   const user = req.user

   if (!user) {
      return next(new AppError('Unauthorized.', 401))
   }

   try {
      const messageCount = await countMessagesByUser(user.user_id)

      const profile: Profile = {
         ...toPublic(user as User),
         messageCount,
         role: getRole(user),
      }

      return res.status(200).json(new ApiResponse('Profile fetched', 200, profile))
   } catch (error: unknown) {
      next(error)
   }
}

export const updateProfile = async (
   req: RequestWithBody<Partial<Pick<PublicUser, 'username' | 'avatar_url'>>>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0]?.msg as string, 400))
   }

   const user = req.user

   if (!user) {
      return next(new AppError('Unauthorized.', 401))
   }

   try {
      const data = matchedData(req) as Partial<Pick<PublicUser, 'username' | 'avatar_url'>>
      const result = await updateUser(user.user_id, data)

      if (!result.rows[0]) {
         return next(new AppError('Profile not found.', 404))
      }

      return res
         .status(200)
         .json(new ApiResponse('Profile updated', 200, toPublic(result.rows[0])))
   } catch (error: unknown) {
      next(error)
   }
}

export const changePassword = async (
   req: RequestWithBody<{ currentPassword: string; newPassword: string }>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0]?.msg as string, 400))
   }

   const user = req.user

   if (!user) {
      return next(new AppError('Unauthorized.', 401))
   }

   const { currentPassword, newPassword } = matchedData(req) as {
      currentPassword: string
      newPassword: string
   }

   try {
      // The session user is deserialized without the password column being
      // trustworthy, so re-read the row before comparing.
      const result = await getUserById(user.user_id)
      const stored = result.rows[0] as User | undefined

      if (!stored) {
         return next(new AppError('Profile not found.', 404))
      }

      const match = await bcrypt.compare(currentPassword, stored.password)

      if (!match) {
         return next(new AppError('Current password is incorrect.', 401))
      }

      const hashed = await bcrypt.hash(newPassword, 10)
      await updateUser(user.user_id, { password: hashed })

      // Rotate the session id so a cookie captured before the change is dead.
      // Regenerating alone would drop the passport session too, so the user is
      // immediately re-authenticated onto the fresh id.
      return req.session.regenerate((regenerateErr: unknown) => {
         if (regenerateErr) {
            return next(new Error(String(regenerateErr)))
         }

         return req.logIn(user as User, (loginErr: unknown) => {
            if (loginErr) {
               return next(new Error(String(loginErr)))
            }

            return res.status(200).json(new ApiResponse('Password changed', 200))
         })
      })
   } catch (error: unknown) {
      next(error)
   }
}

export const upgradeMembership = async (
   req: RequestWithBody<{ code: string }>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0]?.msg as string, 400))
   }

   const user = req.user

   if (!user) {
      return next(new AppError('Unauthorized.', 401))
   }

   const secret = process.env.MEMBERSHIP_SECRET

   if (!secret) {
      return next(new AppError('Membership is not configured on this server.', 503))
   }

   const { code } = matchedData(req) as { code: string }

   // Constant-time compare so the code cannot be recovered by timing the
   // endpoint. timingSafeEqual throws on a length mismatch, so check that
   // first and report the same error either way.
   const codeBuffer = Buffer.from(code)
   const secretBuffer = Buffer.from(secret)
   const valid = codeBuffer.length === secretBuffer.length && timingSafeEqual(codeBuffer, secretBuffer)

   if (!valid) {
      return next(new AppError('Invalid membership code.', 403))
   }

   try {
      const result = await promoteToMember(user.user_id)

      if (!result.rows[0]) {
         return next(new AppError('Profile not found.', 404))
      }

      // No session invalidation needed: serializeUser stores only user_id and
      // deserializeUser re-reads the row on every request, so the upgraded flag
      // is live on the client's very next call.
      return res
         .status(200)
         .json(new ApiResponse('Welcome to the club.', 200, toPublic(result.rows[0])))
   } catch (error: unknown) {
      next(error)
   }
}
