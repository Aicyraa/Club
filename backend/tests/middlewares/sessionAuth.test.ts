import type { NextFunction, Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'

import { destroySession, requireAuth } from '@middlewares/auth'

describe('requireAuth', () => {
   it('rejects an unauthenticated request', () => {
      const next = vi.fn()
      const req = { isAuthenticated: () => false } as unknown as Request

      requireAuth(req, {} as Response, next as unknown as NextFunction)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
   })
})

describe('destroySession', () => {
   it('logs out, destroys the session, and clears the named cookie', () => {
      const destroy = vi.fn((callback: (error?: unknown) => void) => callback())
      const req = {
         logOut: (callback: (error?: unknown) => void) => callback(),
         session: { destroy },
      } as unknown as Request
      const json = vi.fn()
      const status = vi.fn(() => ({ json }))
      const clearCookie = vi.fn()
      const res = { clearCookie, status } as unknown as Response
      const next = vi.fn()

      destroySession(req, res, next as unknown as NextFunction)

      expect(destroy).toHaveBeenCalledOnce()
      expect(clearCookie).toHaveBeenCalledWith(
         'club.sid',
         expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
      )
      expect(status).toHaveBeenCalledWith(200)
      expect(next).not.toHaveBeenCalled()
   })
})
