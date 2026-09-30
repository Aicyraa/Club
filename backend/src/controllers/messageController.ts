import type { Message, MessageAuthor, Paginated } from '@repo/types'
import type { NextFunction, Request, Response } from 'express'
import type { RequestWithBody } from '@custom-types/type'

import { addMessage, countMessages, deleteMessage, getMessages } from '@models/query'
import type { AddMessageFields, MessageFields } from '@models/query'
import { getRole } from '@middlewares/messageMiddleware'
import AppError from '@utils/appError'
import { matchedData, validationResult } from 'express-validator'
import ApiResponse from '@utils/ApiResponse'

const DEFAULT_PAGE_LIMIT = 10
const MAX_PAGE_LIMIT = 50

const parseInteger = (raw: unknown) => Number(String(raw ?? ''))

const parsePagination = (rawPage: unknown, rawLimit: unknown) => {
   const parsedPage = parseInteger(rawPage)
   const parsedLimit = parseInteger(rawLimit)

   const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
   const pageLimit =
      Number.isInteger(parsedLimit) && parsedLimit > 0
         ? Math.min(parsedLimit, MAX_PAGE_LIMIT)
         : DEFAULT_PAGE_LIMIT

   return { page, pageLimit }
}

const toAuthor = (row: MessageFields): MessageAuthor | null => {
   if (!row.author_id || !row.author_name) {
      return null
   }

   return {
      user_id: row.author_id,
      username: row.author_name,
      avatar_url: row.author_avatar,
   }
}

export const getAllMessages = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const role = getRole(req.user)
      const { page, pageLimit } = parsePagination(req.query.page, req.query.pageLimit)

      const [result, total] = await Promise.all([
         getMessages(page, pageLimit, role !== 'normal', role === 'admin'),
         countMessages(),
      ])

      const items: Message[] = result.rows.map((row) => ({
         message_id: Number(row.message_id),
         title: row.title,
         message: row.message,
         created_at: row.created_at.toISOString(),
         is_anonymous: row.is_anonymous,
         author: toAuthor(row),
         can_delete: role === 'admin',
      }))

      const payload: Paginated<Message> = {
         items,
         total,
         page,
         pageLimit,
         totalPages: Math.max(1, Math.ceil(total / pageLimit)),
      }

      return res.status(200).json(new ApiResponse('Messages fetched', 200, payload))
   } catch (error: unknown) {
      next(error)
   }
}

export const postMessage = async (
   req: RequestWithBody<AddMessageFields>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0]?.msg as string, 400))
   }

   const data = matchedData(req) as AddMessageFields
   const user = req.user

   if (!user) {
      return next(new AppError('Unauthorized.', 401))
   }

   try {
      const result = await addMessage({
         user_id: user.user_id,
         title: data.title,
         message: data.message,
         is_anonymous: Boolean(data.is_anonymous),
      })

      return res
         .status(201)
         .json(new ApiResponse('Message created', 201, { message_id: result.rows[0]?.message_id }))
   } catch (error: unknown) {
      next(error)
   }
}

export const removeMessage = async (req: Request, res: Response, next: NextFunction) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0]?.msg as string, 400))
   }

   const { id } = req.params as { id: string }

   try {
      const { rowCount } = await deleteMessage(id)

      if (!rowCount) {
         return next(new AppError('Message not found.', 404))
      }

      return res.status(200).json(new ApiResponse('Message deleted', 200))
   } catch (error: unknown) {
      next(error)
   }
}
