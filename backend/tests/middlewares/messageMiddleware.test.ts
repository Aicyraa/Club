import type { NextFunction, Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'

import AppError from '@utils/appError'
import { getRole, hasRole, rejectPrivileged, requireAdmin, requireMember } from '@middlewares/messageMiddleware'

const buildUser = (overrides: Partial<Express.User> = {}): Express.User =>
   ({
      user_id: 'u1',
      email: 'a@b.com',
      username: 'tester',
      avatar_url: null,
      is_member: false,
      is_admin: false,
      ...overrides,
   }) as Express.User

const run = (middleware: (req: Request, res: Response, next: NextFunction) => void, user?: Express.User) => {
   const next = vi.fn()
   const req = { user } as unknown as Request
   const res = {} as Response

   middleware(req, res, next)

   return next
}

describe('getRole', () => {
   it('treats a user with no flags as normal', () => {
      expect(getRole(buildUser())).toBe('normal')
   })

   it('treats a member as member', () => {
      expect(getRole(buildUser({ is_member: true }))).toBe('member')
   })

   it('treats an admin as admin', () => {
      expect(getRole(buildUser({ is_admin: true }))).toBe('admin')
   })

   it('lets admin win when a user carries both flags', () => {
      expect(getRole(buildUser({ is_member: true, is_admin: true }))).toBe('admin')
   })

   it('falls back to normal for a missing user', () => {
      expect(getRole(undefined)).toBe('normal')
   })
})

describe('hasRole', () => {
   it('matches when the role is in the allowed list', () => {
      expect(hasRole(buildUser({ is_member: true }), 'member', 'admin')).toBe(true)
   })

   it('does not match when it is not', () => {
      expect(hasRole(buildUser(), 'member', 'admin')).toBe(false)
   })
})

describe('requireMember', () => {
   it('passes a member through', () => {
      const next = run(requireMember, buildUser({ is_member: true }))
      expect(next).toHaveBeenCalledWith()
   })

   it('passes an admin through, since admin outranks member', () => {
      const next = run(requireMember, buildUser({ is_admin: true }))
      expect(next).toHaveBeenCalledWith()
   })

   it('rejects a normal user with 403', () => {
      const next = run(requireMember, buildUser())

      expect(next).toHaveBeenCalledTimes(1)
      const error = next.mock.calls[0][0] as AppError
      expect(error).toBeInstanceOf(AppError)
      expect(error.statusCode).toBe(403)
   })
})

describe('requireAdmin', () => {
   it('passes an admin through', () => {
      expect(run(requireAdmin, buildUser({ is_admin: true }))).toHaveBeenCalledWith()
   })

   it('rejects a member, who is not an admin even though they outrank normal', () => {
      const next = run(requireAdmin, buildUser({ is_member: true }))

      expect(next).toHaveBeenCalledTimes(1)
      expect((next.mock.calls[0][0] as AppError).statusCode).toBe(403)
   })
})

describe('rejectPrivileged', () => {
   it('passes a normal user through so they can redeem a membership code', () => {
      expect(run(rejectPrivileged, buildUser())).toHaveBeenCalledWith()
   })

   it('rejects a member, for whom redeeming would be a no-op', () => {
      const next = run(rejectPrivileged, buildUser({ is_member: true }))

      expect(next).toHaveBeenCalledTimes(1)
      expect((next.mock.calls[0][0] as AppError).statusCode).toBe(403)
   })
})
