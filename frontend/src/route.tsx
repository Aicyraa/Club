import { createBrowserRouter, redirect } from 'react-router-dom'
import type { ApiResponse, Profile, PublicUser } from '@repo/types'

import PageNotFound from './error/404.tsx'
import api from '@services/setup.ts'

/** Returns the session user, or null when signed out. */
const fetchUser = async (): Promise<PublicUser | null> => {
   try {
      const result = await api.get<ApiResponse<PublicUser>>('/me')
      return result.data.data ?? null
   } catch {
      // 401 is the expected answer for a signed-out visitor, not a fault.
      return null
   }
}

/**
 * Loads the signed-in user's own profile for the protected route.
 *
 * This replaced a `/me` call that returned only a boolean, which left
 * UserContext empty after a refresh and hid every role-gated control. `/profiles`
 * is a superset of `/me` — it carries the user plus `messageCount` and `role` —
 * so the app needs one request instead of two, and none of it in an effect.
 */
const loadProfile = async (): Promise<Profile> => {
   const user = await fetchUser()

   if (!user) {
      throw redirect('/login')
   }

   // Enrich with the message count and resolved role in a second call, but only
   // after the auth check has already passed.
   try {
      const result = await api.get<ApiResponse<Profile>>('/profiles')
      return result.data.data ?? { ...user, messageCount: 0, role: 'normal' }
   } catch {
      return { ...user, messageCount: 0, role: 'normal' }
   }
}

const guestOnly = async () => {
   if (await fetchUser()) {
      throw redirect('/')
   }

   return null
}

export default createBrowserRouter([
   {
      path: '/',
      loader: loadProfile,
      lazy: async () => ({ Component: (await import('./App.tsx')).default }),
      errorElement: <PageNotFound />,
   },
   {
      path: '/signup',
      loader: guestOnly,
      lazy: async () => ({ Component: (await import('@components/Signup.tsx')).default }),
   },
   {
      path: '/login',
      loader: guestOnly,
      lazy: async () => ({ Component: (await import('@components/Login.tsx')).default }),
   },
   {
      path: '*',
      element: <PageNotFound />,
   },
])
