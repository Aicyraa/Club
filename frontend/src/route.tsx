import { createBrowserRouter } from 'react-router-dom'
import type { ApiReponse } from './types/type.ts'
import api from '@services/setup.ts'
import App from './App.tsx'
import Signup from '@components/Signup.tsx'
import Login from '@components/Login.tsx'
import PageNotFound from './error/404.tsx'

const isAuthenticated = async (): Promise<boolean | undefined> => {
   try {
      const result = await api.get<ApiReponse>('/me')
      return result.data.success
   } catch (error: unknown) {
      if (error instanceof Error) {
         console.error(error)
         return false
      }
   }
}

export default createBrowserRouter([
   {
      path: '/',
      element: <App />,
      loader: isAuthenticated,
      errorElement: <PageNotFound />,
   },
   {
      path: '/signup',
      element: <Signup />,
   },
   {
      path: '/login',
      element: <Login />,
   },
])
