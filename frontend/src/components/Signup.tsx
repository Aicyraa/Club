import type { ApiResponse, SignupFields } from '@repo/types'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AtSign, Eye, EyeOff, LockKeyhole, UserPlus } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { getApiErrorMessage } from '@services/setup'
import api from '@services/setup'

/** Mirrors the backend, which seeds avatar_url from dicebear on signup. */
const dicebear = (username: string) =>
   `https://api.dicebear.com/10.x/lorelei/svg?seed=user-${username}`

const Signup = () => {
   const navigate = useNavigate()
   const [showPassword, setShowPassword] = useState(false)
   const [serverError, setServerError] = useState<string | null>(null)

   const {
      register,
      handleSubmit,
      control,
      formState: { errors, isSubmitting },
   } = useForm<SignupFields>({
      defaultValues: {
         email: '',
         username: '',
         password: '',
      },
   })

   // useWatch rather than watch(): watch() returns a new function every render
   // and opts this component out of React Compiler memoization.
   const [usernameDraft] = useWatch({ control, name: 'username' })

   // Preview of the avatar the backend will assign on signup.
   const previewName = (usernameDraft ?? '').trim()

   const signup = async (data: SignupFields) => {
      setServerError(null)

      try {
         await api.post<ApiResponse>('/signup', data)
         navigate('/login')
      } catch (error: unknown) {
         setServerError(getApiErrorMessage(error, 'Unable to create your account.'))
      }
   }

   return (
      <AuthShell>
         <Card>
            <CardHeader>
               <div className="bg-primary text-primary-foreground mb-2 grid size-10 place-items-center rounded-xl">
                  <UserPlus className="size-5" />
               </div>
               <CardTitle>Create your account</CardTitle>
               <CardDescription>
                  Join Club to get access to members-only options.
               </CardDescription>
            </CardHeader>

            <CardContent>
               <div className="mb-5 flex items-center gap-3">
                  <Avatar className="size-12">
                     {previewName && <AvatarImage src={dicebear(previewName)} />}
                     <AvatarFallback>{(previewName || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground text-sm">
                     {previewName
                        ? 'This is the avatar you will get.'
                        : 'Type a username to preview your avatar.'}
                  </p>
               </div>

               <form
                  onSubmit={handleSubmit(signup)}
                  className="flex flex-col gap-5"
               >
                  {serverError && (
                     <Alert variant="destructive">
                        <AlertDescription>{serverError}</AlertDescription>
                     </Alert>
                  )}

                  <FieldGroup>
                     <Field data-invalid={!!errors.email}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <InputGroup>
                           <InputGroupAddon align="inline-start">
                              <AtSign className="text-muted-foreground size-4" />
                           </InputGroupAddon>
                           <InputGroupInput
                              id="email"
                              type="email"
                              autoComplete="email"
                              placeholder="john.doe@example.com"
                              aria-invalid={!!errors.email}
                              {...register('email', {
                                 required: 'Email is empty.',
                                 pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Email is invalid.',
                                 },
                              })}
                           />
                        </InputGroup>
                        <FieldError errors={[{ message: errors.email?.message as string }]} />
                     </Field>

                     <Field data-invalid={!!errors.username}>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <InputGroup>
                           <InputGroupAddon align="inline-start">
                              <UserPlus className="text-muted-foreground size-4" />
                           </InputGroupAddon>
                           <InputGroupInput
                              id="username"
                              autoComplete="username"
                              placeholder="your-username"
                              aria-invalid={!!errors.username}
                              {...register('username', {
                                 required: 'Username is empty.',
                                 minLength: {
                                    value: 3,
                                    message: 'Username cannot be less than 3.',
                                 },
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
                              autoComplete="new-password"
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
                     {isSubmitting ? 'Creating account' : 'Sign up'}
                  </Button>
               </form>
            </CardContent>

            <CardFooter className="flex-col gap-3">
               <div className="flex w-full items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-xs">already a member?</span>
                  <Separator className="flex-1" />
               </div>
               <Button
                  variant="outline"
                  className="w-full"
                  nativeButton={false}
                  render={<Link to="/login" />}
               >
                  Log in instead
               </Button>
            </CardFooter>
         </Card>
      </AuthShell>
   )
}

export default Signup
