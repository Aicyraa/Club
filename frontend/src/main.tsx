import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import UserProvider from '@context/UserProvider'
import route from './route.tsx'

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <UserProvider>
         <RouterProvider router={route} />
      </UserProvider>
   </StrictMode>
)
