import type { SignupFields } from '@custom-type/type'
import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Eye, EyeClosed } from 'lucide-react'

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
   const [signUpStatus, setSignUpStatus] = useState({
      success: false,
      message: '',
      isLoading: false,
   })

   const save = async (data: SignupFields) => {
      try {
         setSignUpStatus(prev => ({ ...prev, isLoading: true }))
         const response = await axios.post<SignupFields>('/api/signup', data)
         return setSignUpStatus(prev => ({
            ...prev,
            isLoading: false,
            success: true,
            message: response.data.username,
         }))
      } catch (error) {
         setSignUpStatus(prev => ({
            ...prev,
            isLoading: false,
            success: false,
            message: 'Error message',
         }))
      }
   }

   return (
      <>
         {signUpStatus.isLoading ? <span className="text-2xl"> ...Loading </span> : ''}

         <form
            onSubmit={handleSubmit(save)}
            className="flex border-2 border-black flex-col gap-4 p-4"
         >
            <div className="group">
               <label htmlFor="email"> Email </label>
               <input
                  {...register('email', { required: 'Email is required!', minLength: 5 })}
                  placeholder="e.g John Doe"
                  className="border p-2 rounded-sm"
               />
               {errors.email && <span className="bg-red-600"> {errors.email.message} </span>}
            </div>

            <div className="group">
               <label htmlFor="username"> Username </label>
               <input
                  {...register('username', { required: true, minLength: 3 })}
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
                     {...register('email', { required: true })}
                     type={showPassword ? 'text' : 'password'}
                     className="border p-2 rounded-sm"
                  />
                  <span onClick={() => setShowPassword((value: boolean) => !value)}>
                     {showPassword ? <Eye /> : <EyeClosed />}
                  </span>
               </div>
               {errors.password && (
                  <span className="bg-red-600"> {errors.password.message } </span>
               )}
            </div>
            <button type="submit"> Sign Up! </button>
         </form>
      </>
   )
}

export default Signup
