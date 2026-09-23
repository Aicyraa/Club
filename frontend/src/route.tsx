import { createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import Signup from '@components/Signup.tsx'
import Login from '@components/Login.tsx'

export default createBrowserRouter([
   {
      path: '/',
      element: <App />,
      errorElement: <div>404</div>,
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
