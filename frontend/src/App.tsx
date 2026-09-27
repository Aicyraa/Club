import { useLoaderData, useNavigate } from 'react-router-dom'
import { useUserContext } from './context/UserContext'
import type { ApiReponse } from './types/type'
import { useState, useEffect } from 'react'
import api from '@services/setup'

function App() {
   const isAuthenticated = useLoaderData()
   const navigate = useNavigate()
   const { user } = useUserContext()

   const logout = async () => {
      const response = await api.get<ApiReponse>('/logout')
      navigate('/login')
      alert(response.data.message)
   }

   useEffect(() => {
      if (!isAuthenticated) {
         navigate('/login')
      }
   })

   return (
      <div className="App">
         <h1 className="text-4xl caret-amber-300">Welcome to the App, {user?.username}!</h1>
         <button type="button" onClick={logout}>
            Logout
         </button>
      </div>
   )
}

export default App
