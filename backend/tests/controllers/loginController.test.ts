import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request } from 'express'

vi.mock('passport', () => ({
   default: {
      authenticate: vi.fn(),
   },
}))

import passport from 'passport'
import { loginForm } from '../../src/middlewares/formValidator'
import { postLogin } from '../../src/controllers/loginController'

const validBody = { username: 'alice', password: 'secret123' }

const user = {
   userid: '59fb9ce4-c6ea-4cfd-bd54-9cb09afbf84d',
   email: 'user@example.com',
   username: 'alice',
   avatarUrl: null,
   isMember: false,
   isAdmin: false,
   password: 'hashed-password',
}

const authMock = passport.authenticate as unknown as ReturnType<typeof vi.fn>

let authCb: ((...args: unknown[]) => void) | undefined

const makeReq = async (body: Record<string, unknown>) => {
   const req = {
      body,
      logIn: vi.fn(),
   } as unknown as Request
   await Promise.all(loginForm.map((validator) => validator.run(req)))
   return req
}

const makeRes = () => {
   const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
   }
   return res
}

describe('postLogin', () => {
   beforeEach(() => {
      vi.clearAllMocks()
      authCb = undefined
      authMock.mockImplementation((_strategy: string, cb: (...args: unknown[]) => void) => {
         authCb = cb
         return () => {}
      })
   })

   it('returns 400 with validation errors for an invalid payload', async () => {
      const req = await makeReq({ username: '', password: '123' })
      const res = makeRes()
      const next = vi.fn()

      await postLogin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({ status: 400, success: false, errors: expect.any(Array) }),
      )
      expect(authMock).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
   })

   it('returns 401 with a generic message for bad credentials', async () => {
      const req = await makeReq(validBody)
      const res = makeRes()
      const next = vi.fn()

      await postLogin(req, res, next)
      authCb?.(null, false)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
         status: 401,
         success: false,
         message: 'Invalid credentials.',
      })
      expect((req as Request & { logIn: ReturnType<typeof vi.fn> }).logIn).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
   })

   it('logs the user in and returns the public user on success', async () => {
      const req = (await makeReq(validBody)) as Request & {
         logIn: ReturnType<typeof vi.fn>
      }
      req.logIn.mockImplementation((_user: unknown, cb: (err?: unknown) => void) => cb())
      const res = makeRes()
      const next = vi.fn()

      await postLogin(req, res, next)
      authCb?.(null, user)

      expect(req.logIn).toHaveBeenCalledWith(
         user,
         expect.any(Function),
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            status: 200,
            success: true,
            user: expect.not.objectContaining({ password: expect.anything() }),
         }),
      )
      expect(next).not.toHaveBeenCalled()
   })

   it('forwards authenticate errors to the error handler', async () => {
      const req = await makeReq(validBody)
      const res = makeRes()
      const next = vi.fn()

      const authError = new Error('Authentication failed.')
      await postLogin(req, res, next)
      authCb?.(authError)

      expect(next).toHaveBeenCalledWith(authError)
      expect(res.status).not.toHaveBeenCalled()
   })

   it('forwards req.logIn errors to the error handler', async () => {
      const sessionError = new Error('Session save failed.')
      const req = (await makeReq(validBody)) as Request & {
         logIn: ReturnType<typeof vi.fn>
      }
      req.logIn.mockImplementation((_user: unknown, cb: (err?: unknown) => void) =>
         cb(sessionError),
      )
      const res = makeRes()
      const next = vi.fn()

      await postLogin(req, res, next)
      authCb?.(null, user)

      expect(next).toHaveBeenCalledWith(sessionError)
      expect(res.status).not.toHaveBeenCalled()
   })
})