import AppError from '@utils/appError'

interface PgErrorDetails {
   code?: string
   constraint?: string
   table?: string
   column?: string
   detail?: string
   hint?: string
}

export class DbError extends AppError {
   code?: string
   constraint?: string
   table?: string
   column?: string
   detail?: string
   hint?: string

   constructor(message: string, statusCode: number, details: PgErrorDetails = {}) {
      super(message, statusCode)
      this.name = 'DbError'
      Object.assign(this, details)
   }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
   typeof value === 'object' && value !== null

const optionalString = (value: unknown) => (typeof value === 'string' ? value : undefined)

/**
 * Converts PostgreSQL SQLSTATE errors into valid, intentionally public HTTP
 * errors. Raw driver messages are retained only for unknown server errors;
 * the production error handler masks those 5xx messages from clients.
 */
export const mapPgError = (error: unknown): DbError => {
   const source = isObject(error) ? error : {}
   const details: PgErrorDetails = {
      code: optionalString(source.code),
      constraint: optionalString(source.constraint),
      table: optionalString(source.table),
      column: optionalString(source.column),
      detail: optionalString(source.detail),
      hint: optionalString(source.hint),
   }

   switch (details.code) {
      case '23505':
         return new DbError('A record with this value already exists.', 409, details)
      case '23503':
         return new DbError('This record is still referenced by another resource.', 409, details)
      case '23502':
         return new DbError('A required field is missing.', 400, details)
      case '23514':
      case '22P02':
         return new DbError('Value violates a database constraint.', 400, details)
      case '53300':
      case '57P01':
      case '57P02':
      case '57P03':
         return new DbError('Database is temporarily unavailable.', 503, details)
   }

   if (details.code?.startsWith('08')) {
      return new DbError('Database is temporarily unavailable.', 503, details)
   }

   const message = error instanceof Error ? error.message : optionalString(source.message)
   return new DbError(message || 'Database query failed.', 500, details)
}
