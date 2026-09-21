import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('bcryptjs', () => ({
   default: { compare: vi.fn() },
}))

vi.mock('@models/query', () => ({
   getUser: vi.fn(),
   getUserById: vi.fn(),
}))

import bcrypt from 'bcryptjs'
import { getUser, getUserById } from '@models/query'
import {
   localStrategy as LocalStrategy,
   serializeCb,
   deserializeCb,
} from '../../src/config/passport'

const user = {
   userid: '59fb9ce4-c6ea-4cfd-bd54-9cb09afbf84d',
   email: 'user@example.com',
   username: 'alice',
   avatarUrl: null,
   isMember: false,
   isAdmin: false,
   password: 'hashed-password',
}

const runStrategy = (username: string, password: string) =>
   new Promise<unknown[]>(resolve => {
      LocalStrategy._verify(username, password, (...args: unknown[]) => resolve(args))
   })

describe('LocalStrategy', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   it('authenticates a user with valid credentials', async () => {
      vi.mocked(getUser).mockResolvedValue({ rowCount: 1, rows: [user] } as never)
      vi.mocked(bcrypt.compare).mockResolvedValue(true)

      const done = await runStrategy('alice', 'secret123')

      expect(getUser).toHaveBeenCalledWith('alice')
      expect(bcrypt.compare).toHaveBeenCalledWith('secret123', user.password)
      expect(done).toEqual([null, user])
   })

   it('rejects an unknown username', async () => {
      vi.mocked(getUser).mockResolvedValue({ rowCount: 0, rows: [] } as never)

      const done = await runStrategy('ghost', 'secret123')

      expect(done).toEqual([null, false, { message: 'Invalid credentials.' }])
      expect(bcrypt.compare).not.toHaveBeenCalled()
   })

   it('rejects a wrong password', async () => {
      vi.mocked(getUser).mockResolvedValue({ rowCount: 1, rows: [user] } as never)
      vi.mocked(bcrypt.compare).mockResolvedValue(false)

      const done = await runStrategy('alice', 'wrongpass')

      expect(done).toEqual([null, false, { message: 'Invalid credentials.' }])
   })

   it('trims the username before querying', async () => {
      vi.mocked(getUser).mockResolvedValue({ rowCount: 1, rows: [user] } as never)
      vi.mocked(bcrypt.compare).mockResolvedValue(true)

      await runStrategy('  alice  ', 'secret123')

      expect(getUser).toHaveBeenCalledWith('alice')
   })

   it('forwards database errors to done', async () => {
      const dbError = new Error('Database query failed.')
      vi.mocked(getUser).mockRejectedValue(dbError)

      const done = await runStrategy('alice', 'secret123')

      expect(done).toEqual([dbError])
   })
})

describe('serializeCb', () => {
   it('serializes the user id into the session', async () => {
      let args: unknown[] = []
      await serializeCb(user, (...cb: unknown[]) => {
         args = cb
      })

      expect(args).toEqual([null, user.userid])
   })
})

describe('deserializeCb', () => {
   it('returns the user when the id exists', async () => {
      vi.mocked(getUserById).mockResolvedValue({ rowCount: 1, rows: [user] } as never)

      let args: unknown[] = []
      await deserializeCb(user.userid, (...cb: unknown[]) => {
         args = cb
      })

      expect(getUserById).toHaveBeenCalledWith(user.userid)
      expect(args).toEqual([null, user])
   })

   it('returns false when the id does not exist', async () => {
      vi.mocked(getUserById).mockResolvedValue({ rowCount: 0, rows: [] } as never)

      let args: unknown[] = []
      await deserializeCb('missing', (...cb: unknown[]) => {
         args = cb
      })

      expect(args).toEqual([null, false])
   })

   it('forwards database errors to done', async () => {
      const dbError = new Error('Database query failed.')
      vi.mocked(getUserById).mockRejectedValue(dbError)

      const args = await new Promise<unknown[]>(resolve => {
         deserializeCb(user.userid, (...cb: unknown[]) => resolve(cb))
      })

      expect(args).toEqual([dbError])
   })
})
