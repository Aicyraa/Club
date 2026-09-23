import type { LoginFields } from '@custom-types/type'
import { useForm } from 'react-hook-form'
import axios from 'axios'

const Login = () => {
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
         const response = await axios.post<LoginFields>('/api/v1/login', data)
         console.log(response.data)
      } catch (error) {
         console.error(error)
      }
   }

   return (
      <>
         <form onSubmit={handleSubmit(login)}>
            <div className="group">
               <label htmlFor="username"> Username </label>
               <input
                  type="text"
                  {...register('username', { required: 'Username is required', minLength: 5 })}
               />
               {errors.username && <span>{errors.username.message}</span>}
            </div>
            <div className="group">
               <label htmlFor="passwod"> Password </label>
               <input
                  type="text"
                  {...register('password', { required: 'Username is required', minLength: 5 })}
               />
               {errors.password && <span>{errors.password.message}</span>}
            </div>
            <button type="submit"> Login </button>
         </form>
      </>
   )
}

export default Login
