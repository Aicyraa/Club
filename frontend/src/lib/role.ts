import type { Role } from '@repo/types'

/**
 * Mirrors the server's `getRole`: admin wins over member, so a user carrying
 * both flags is treated as an admin here exactly as they are there.
 *
 * A plain function rather than a hook because the role is derived from data the
 * route loader already has — there is nothing to subscribe to.
 *
 * Client-side this is only ever cosmetic. The server re-checks every one of
 * these rules in `requireMember` / `requireAdmin`.
 */
export const getRole = (user: Pick<{ is_member: boolean; is_admin: boolean }, 'is_member' | 'is_admin'>): Role => {
   if (user.is_admin) {
      return 'admin'
   }

   if (user.is_member) {
      return 'member'
   }

   return 'normal'
}
