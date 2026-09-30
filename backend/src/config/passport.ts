import type { User } from '@repo/types'
import type { QueryResult } from 'pg'
import passport from 'passport'
import bcrypt from 'bcryptjs'
import { Strategy as LocalStrategyClass } from 'passport-local'
import { getUser, getUserById } from '@models/query'

export const localStrategy = new LocalStrategyClass(
   async (username: string, password: string, done) => {
      try {
         const result = (await getUser(username.trim())) as QueryResult<User>

         if (!result.rowCount) {
            return done(null, false, { message: 'Invalid credentials.' })
         }

         const user = result.rows[0]
         const match = await bcrypt.compare(password, user.password)

         if (!match) {
            return done(null, false, { message: 'Invalid credentials.' })
         }

         return done(null, user)
      } catch (err) {
         return done(err)
      }
   },
)

/**
 * Typed against `Express.User` (which is `PublicUser` in this repo) because that
 * is what @types/passport's serializeUser overload declares. Narrowing it to the
 * local `User` — which carries `password` — makes the callback unassignable and
 * the build fails.
 */
export const serializeCb = (user: Express.User, done: (err: unknown, id?: unknown) => void) => {
   done(null, user.user_id)
}

export const deserializeCb = async (
   id: string,
   done: (err: unknown, user?: User | false) => void,
) => {
   try {
      const { rows } = (await getUserById(id)) as QueryResult<User>
      if (!rows[0]) {
         return done(null, false)
      }
      done(null, rows[0])
   } catch (err) {
      done(err)
   }
}

passport.use(localStrategy)
passport.serializeUser(serializeCb)
passport.deserializeUser(deserializeCb)

export default passport