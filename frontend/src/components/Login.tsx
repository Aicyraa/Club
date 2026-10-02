import type { ApiResponse, LoginFields, PublicUser } from '@repo/types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
   InputGroup,
   InputGroupAddon,
   InputGroupButton,
   InputGroupInput,
} from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import AuthShell from '@components/AuthShell'
import { useUserContext } from '@context/userContext'
import { getApiErrorMessage } from '@services/setup'
import api from '@services/setup'

const Login = () => {
   const navigate = useNavigate()
   const { setUser } = useUserContext()
   const [showPassword, setShowPassword] = useState(false)
   const [serverError, setServerError] = useState<string | null>(null)

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<LoginFields>({
      defaultValues: {
         username: '',
         password: '',
      },
   })

   const login = async (data: LoginFields) => {
      setServerError(null)

      try {
         const response = await api.post<ApiResponse<PublicUser>>('/login', data)

         if (response.data.success) {
            setUser(response.data.data ?? null)
            navigate('/')
         }
      } catch (error: unknown) {
         setServerError(getApiErrorMessage(error, 'Unable to log in. Please try again.'))
      }
   }

   return (
      <AuthShell>
         <Card className="overflow-hidden rounded-2xl shadow-lg shadow-foreground/5">
            <CardHeader className="gap-3 p-6 sm:p-8">
               <div className="bg-primary text-primary-foreground mb-1 grid size-11 place-items-center rounded-xl">
                  <LogIn className="size-5" />
               </div>
               <CardTitle>Welcome back</CardTitle>
               <CardDescription>Pick up where your community left off.</CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6 sm:px-8">
               <form
                  onSubmit={handleSubmit(login)}
                  className="flex flex-col gap-6"
               >
                  {serverError && (
                     <Alert variant="destructive">
                        <AlertDescription>{serverError}</AlertDescription>
                     </Alert>
                  )}

                  <FieldGroup>
                     <Field data-invalid={!!errors.username}>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <InputGroup>
                           <InputGroupAddon align="inline-start">
                              <UserRound className="text-muted-foreground size-4" />
                           </InputGroupAddon>
                           <InputGroupInput
                              id="username"
                              autoComplete="username"
                              placeholder="your-username"
                              aria-invalid={!!errors.username}
                              {...register('username', {
                                 required: 'Username is empty.',
                              })}
                           />
                        </InputGroup>
                        <FieldError errors={[{ message: errors.username?.message as string }]} />
                     </Field>

                     <Field data-invalid={!!errors.password}>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <InputGroup>
                           <InputGroupAddon align="inline-start">
                              <LockKeyhole className="text-muted-foreground size-4" />
                           </InputGroupAddon>
                           <InputGroupInput
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="current-password"
                              aria-invalid={!!errors.password}
                              {...register('password', {
                                 required: 'Password is empty.',
                                 minLength: {
                                    value: 6,
                                    message: 'Password cannot be less than 6.',
                                 },
                              })}
                           />
                           <InputGroupAddon align="inline-end">
                              <InputGroupButton
                                 aria-label={showPassword ? 'Hide password' : 'Show password'}
                                 aria-pressed={showPassword}
                                 onClick={() => setShowPassword((value: boolean) => !value)}
                              >
                                 {showPassword ? <EyeOff /> : <Eye />}
                              </InputGroupButton>
                           </InputGroupAddon>
                        </InputGroup>
                        <FieldError errors={[{ message: errors.password?.message as string }]} />
                     </Field>
                  </FieldGroup>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                     {isSubmitting && <Spinner data-icon="inline-start" />}
                     {isSubmitting ? 'Logging in' : 'Log in'}
                  </Button>
               </form>
            </CardContent>

            <CardFooter className="bg-muted/50 flex-col gap-4 border-t px-6 py-5 sm:px-8">
               <div className="flex w-full items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-xs">New to the Club?</span>
                  <Separator className="flex-1" />
               </div>
               <Button
                  variant="outline"
                  className="w-full"
                  nativeButton={false}
                  render={<Link to="/signup" />}
               >
                  Create an account
               </Button>
            </CardFooter>
         </Card>
      </AuthShell>
   )
}

export default Login
