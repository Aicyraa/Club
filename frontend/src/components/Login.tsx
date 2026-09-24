import type { LoginFields, User } from '@custom-types/type'
import axios, { type AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useUserContext } from '@context/UserContext'
import InputError from '@error/InputError'
import { redirect } from 'react-router-dom'

const Login = () => {
   const { setUser } = useUserContext()

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<LoginFields>({
      defaultValues: {
         username: '',
         password: '',
      },
   })

   const login = async (data: LoginFields) => {
      try {
         const response = await axios.post<User>('/api/v1/login', data)
         setUser(response.data)
         redirect('/')
      } catch (error: AxiosError | unknown) {
         if (axios.isAxiosError(error)) {
            console.log(error.response?.data)
         } else {
            console.log('An unexpected error occurred:', error)
         }
      }
   }

   return (
      <>
         <div className="h-full flex justify-center items-center flex-col ">
            <h2 className="text-sky-950 text-4xl"> Login </h2>
            <form
               onSubmit={handleSubmit(login)}
               className="flex flex-col w-1xl h-1/3 bg-amber-50 shadow-2xl rounded-2xl p-4"
            >
               <div className="group">
                  <label htmlFor="username"> Username </label>
                  <input
                     type="text"
                     {...register('username', { required: 'Username is empty' })}
                     className="border"
                  />
                  {errors.username && (
                     <InputError message={errors.username.message as string} />
                  )}
               </div>
               <div className="group">
                  <label htmlFor="passwod"> Password </label>
                  <input
                     type="text"
                     {...register('password', {
                        required: 'Password is empty.',
                        minLength: { value: 6, message: 'Password cannot be less than 6.' },
                     })}
                     className="border"
                  />
                  {errors.username && (
                     <InputError message={errors.username.message as string} />
                  )}
               </div>
               <button type="submit" className="bg-sky-950 p-4 rounded-2xl w-full text">
                  {' '}
                  Login{' '}
               </button>
            </form>
         </div>
      </>
   )
}

export default Login
