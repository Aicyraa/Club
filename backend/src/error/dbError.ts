import AppError from '@error/appError'
import { DbErrorDetails } from '../types/type'

export class DbError extends AppError {
   code?: string
   constraint?: string
   detail?: string
   hint?: string
   table?: string
   column?: string
   schema?: string
   routine?: string

   constructor(message: string, statusCode: number, details: DbErrorDetails = {}) {
      super(message, statusCode)
      Object.assign(this, details)
   }
}

const PG_ERROR_MAP: Record<string, { statusCode: number; message: string }> = {
   '23505': {
      statusCode: 409,
      message: 'A record with this value already exists.',
   },
   '23503': { statusCode: 400, message: 'Referenced record does not exist.' },
   '23502': { statusCode: 400, message: 'A required field is missing.' },
   '23514': {
      statusCode: 400,
      message: 'Value violates a database constraint.',
   },
   '22P02': { statusCode: 400, message: 'Invalid value format provided.' },
   '57P03': { statusCode: 503, message: 'Database is temporarily unavailable.' },
   '08006': { statusCode: 503, message: 'Database connection is unavailable.' },
   '53300': { statusCode: 503, message: 'Too many database connections.' },
}

const INTERNAL_CODES = new Set(['42P01', '42P02', '42601'])

export const mapPgError = (error: unknown): DbError => {
   const pgError = error as Partial<DbErrorDetails> & {
      message?: string
      code?: string
   }

   if (typeof pgError?.code === 'string') {
      const mapped = PG_ERROR_MAP[pgError.code]
      if (mapped) {
         return new DbError(mapped.message, mapped.statusCode, {
            code: pgError.code,
            constraint: pgError.constraint,
            detail: pgError.detail,
            hint: pgError.hint,
            table: pgError.table,
            column: pgError.column,
            schema: pgError.schema,
            routine: pgError.routine,
         })
      }

      if (INTERNAL_CODES.has(pgError.code)) {
         return new DbError('Database query failed.', 500, {
            code: pgError.code,
            detail: pgError.detail,
            table: pgError.table,
            column: pgError.column,
            routine: pgError.routine,
         })
      }
   }

   const message = pgError.message || (error instanceof Error ? error.message : '')
   return new DbError(message || 'Database query failed.', 500, {
      code: pgError.code,
      detail: pgError.detail,
      hint: pgError.hint,
      table: pgError.table,
      column: pgError.column,
   })
}
