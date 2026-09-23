export interface SignupFields {
   email: string
   username: string
   password: string
}

export type LoginFields = Omit<SignupFields, 'email'> 
