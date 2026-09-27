import type { ApiResponse, LoginFields, PublicUser } from '@repo/types'
import { useForm } from 'react-hook-form'
import { useUserContext } from '@context/UserContext'
import InputError from '@error/InputError'
import api from '@services/setup'
import { useLoaderData, useNavigate } from 'react-router-dom'

const Login = () => {
   const navigate = useNavigate()
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
         const response = await api.post<ApiResponse<PublicUser>>('/login', data)
         console.log(response.data.success, response.data.statusCode);
         
         if (response.data.success && response.data.statusCode === 200) {
            setUser(response.data.data as PublicUser)
            navigate('/')
         }
      } catch (error: unknown) {
         console.log(error)
      }
   }

   return (
      <>
         <div>
            <h2> Login Page </h2>
            <hr />
            <form onSubmit={handleSubmit(login)}>
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
               <div>
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
               <button type="submit" className="bg-blue-200 pr-4 pl-4 pt-2 pb-2 rounded-10">
                  Login
               </button>
            </form>
         </div>
      </>
   )
}

export default Login
