export interface User {
   id: string
   email: string
   username: string
}

export interface SignupFields {
   email: string
   username: string
   password: string
}

export type LoginFields = Omit<SignupFields, 'email'>
