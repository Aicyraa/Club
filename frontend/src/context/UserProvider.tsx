import { useState } from 'react'

import { UserContext } from '@context/userContext'
import type { UserContextType } from '@context/userContext'
import type { Children } from '@custom-types/type'

/**
 * Split from the context object and its hook so this file exports only a
 * component — otherwise react-refresh/only-export-components rejects it.
 *
 * The app shell no longer reads from this context: the `/` route loader already
 * has the user, and a fetch-then-setState effect to mirror it into context is
 * both an extra render and a source of drift. This remains as the place the
 * login and signup forms record who just signed in.
 */
export const UserProvider = ({ children }: Children) => {
   const [user, setUser] = useState<UserContextType['user']>(null)

   return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}

export default UserProvider
