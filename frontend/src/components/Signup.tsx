import type { SignupFields } from '@custom-types/type'
import axios, { AxiosError } from 'axios'
import { Eye, EyeClosed } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
         <form onSubmit={handleSubmit(signup)}>
            <div>
               <label htmlFor="email"> Email </label>
               <input
                  {...register('email', { required: 'Invalid email!', minLength: 5 })}
                  placeholder="e.g John Doe"
                  className="border"
               />
               {errors.email && <span> {errors.email.message} </span>}
            </div>

            <div>
               <label htmlFor="username"> Username </label>
               <input
                  {...register('username', { required: 'Invalid username!', minLength: 3 })}
                  type="text"
                  name="username"
                  className="border"
               />
               {errors.username && <span> {errors.username.message} </span>}
            </div>

            <div className="group">
               <label htmlFor="password"> Password </label>
               <div className="password flex">
                  <input
                     {...register('password', { required: 'Invalid password!' })}
                     type={showPassword ? 'text' : 'password'}
                     className="border"
                  />
                  <span onClick={() => setShowPassword((value: boolean) => !value)}>
                     {showPassword ? <Eye /> : <EyeClosed />}
                  </span>
               </div>
               {errors.password && <span> {errors.password.message} </span>}
            </div>
            <button type="submit" className="bg-blue-200 pr-4 pl-4 pt-2 pb-2 rounded-10">
               Sign Up!
            </button>
         </form>
      </>
   )
}

export default Signup
