export interface Messages {
   id: number
   author: string
   title: string
   message: string
   date: Date
}

export interface CustomError extends Error {
   status: number 
}