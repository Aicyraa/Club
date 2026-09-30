import type { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@models/query', () => ({
   addMessage: vi.fn(),
   countMessages: vi.fn(),
   deleteMessage: vi.fn(),
   getMessages: vi.fn(),
}))

import { countMessages, getMessages } from '@models/query'
import { getAllMessages } from '@controllers/messageController'

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

const row = (overrides: Record<string, unknown> = {}) => ({
   message_id: '1',
   title: 'Hello',
   message: 'World',
   created_at: new Date('2026-01-01T00:00:00.000Z'),
   is_anonymous: false,
   author_id: 'u2',
   author_name: 'ada',
   author_avatar: null,
   ...overrides,
})

const run = async (user: Express.User, query: Record<string, unknown> = {}) => {
   const json = vi.fn()
   const status = vi.fn(() => ({ json }))
   const next = vi.fn()

   await getAllMessages(
      { user, query } as unknown as Request,
      { status } as unknown as Response,
      next as unknown as NextFunction,
   )

   return { json, status, next }
}

describe('getAllMessages', () => {
   beforeEach(() => {
      vi.clearAllMocks()
      vi.mocked(getMessages).mockResolvedValue({ rows: [row()], rowCount: 1 } as never)
      // countMessages unwraps the COUNT(*) row and returns a plain number, not
      // a QueryResult.
      vi.mocked(countMessages).mockResolvedValue(1)
   })

   it('asks the model to hide the author for a normal viewer', async () => {
      await run(buildUser())

      expect(getMessages).toHaveBeenCalledWith(1, 10, false, false)
   })

   it('asks the model to reveal the author for a member', async () => {
      await run(buildUser({ is_member: true }))

      expect(getMessages).toHaveBeenCalledWith(1, 10, true, false)
   })

   it('asks the model to reveal the author for an admin', async () => {
      await run(buildUser({ is_admin: true }))

      expect(getMessages).toHaveBeenCalledWith(1, 10, true, true)
   })

   it('stamps can_delete only for an admin', async () => {
      const member = await run(buildUser({ is_member: true }))
      const admin = await run(buildUser({ is_admin: true }))

      const memberItem = member.json.mock.calls[0][0].data.items[0]
      const adminItem = admin.json.mock.calls[0][0].data.items[0]

      expect(memberItem.can_delete).toBe(false)
      expect(adminItem.can_delete).toBe(true)
   })

   it('clamps a page limit above the maximum', async () => {
      await run(buildUser(), { pageLimit: '9999' })

      expect(getMessages).toHaveBeenCalledWith(1, 50, false, false)
   })

   it('falls back to page 1 and the default limit for garbage input', async () => {
      await run(buildUser(), { page: 'abc', pageLimit: '-4' })

      expect(getMessages).toHaveBeenCalledWith(1, 10, false, false)
   })

   it('computes totalPages from the total, not the page size', async () => {
      vi.mocked(countMessages).mockResolvedValue(25)

      const { json } = await run(buildUser(), { pageLimit: '10' })

      expect(json.mock.calls[0][0].data).toMatchObject({ total: 25, page: 1, pageLimit: 10, totalPages: 3 })
   })

   it('reports at least one page when there are no messages, avoiding a divide by zero', async () => {
      vi.mocked(getMessages).mockResolvedValue({ rows: [], rowCount: 0 } as never)
      vi.mocked(countMessages).mockResolvedValue(0)

      const { json } = await run(buildUser())

      expect(json.mock.calls[0][0].data.totalPages).toBe(1)
   })

   it('surfaces a database failure through next rather than responding', async () => {
      vi.mocked(getMessages).mockRejectedValue(new Error('boom'))

      const { status, next } = await run(buildUser())

      expect(status).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(expect.any(Error))
   })
})
