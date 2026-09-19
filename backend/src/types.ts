
export interface Message {
   id: number
   author: string
   title: string
   message: string
   date: Date
}

export interface User {
   id: number,
   firstname: string
   lastname: string
   password: string
   membershipStatus: 'member' | null  
}

export interface CustomError extends Error {
   status: number 
}