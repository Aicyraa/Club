export interface SignupFields {
   email: string
   username: string
   password: string
}

export type LoginFiels = Omit<SignupFields, 'email'> 
