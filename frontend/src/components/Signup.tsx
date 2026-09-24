import type { SignupFields } from '@custom-types/type'
import { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { Eye, EyeClosed } from 'lucide-react'
import { redirect } from 'react-router-dom'

const Signup = () => {
   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<SignupFields>({
      defaultValues: {
         email: '',
         username: '',
         password: '',
      },
   })

   const [showPassword, setShowPassword] = useState(false)

   const signup = async (data: SignupFields) => {
      try {
         axios.post<SignupFields>('/api/v1/signup', data)
         return redirect('/login')
      } catch (error: AxiosError | unknown) {
         if (axios.isAxiosError(error)) {
            console.log(error.response?.data)
         } else {
            console.log(error)
         }
      }
   }

   return (
      <>
         <form
            onSubmit={handleSubmit(signup)}
            className="flex border-2 border-black flex-col gap-4 p-4"
         >
            <div className="group">
               <label htmlFor="email"> Email </label>
               <input
                  {...register('email', { required: 'Invalid email!', minLength: 5 })}
                  placeholder="e.g John Doe"
                  className="border p-2 rounded-sm"
               />
               {errors.email && <span className="bg-red-600"> {errors.email.message} </span>}
            </div>

            <div className="group">
               <label htmlFor="username"> Username </label>
               <input
                  {...register('username', { required: 'Invalid username!', minLength: 3 })}
                  type="text"
                  name="username"
                  className="border p-2 rounded-sm"
               />
               {errors.username && (
                  <span className="bg-red-600"> {errors.username.message} </span>
               )}
            </div>

            <div className="group">
               <label htmlFor="password"> Password </label>
               <div className="password">
                  <input
                     {...register('password', { required: 'Invalid password!' })}
                     type={showPassword ? 'text' : 'password'}
                     className="border p-2 rounded-sm"
                  />
                  <span onClick={() => setShowPassword((value: boolean) => !value)}>
                     {showPassword ? <Eye /> : <EyeClosed />}
                  </span>
               </div>
               {errors.password && (
                  <span className="bg-red-600"> {errors.password.message} </span>
               )}
            </div>
            <button type="submit"> Sign Up! </button>
         </form>
      </>
   )
}

export default Signup
