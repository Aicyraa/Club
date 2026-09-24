import { TriangleAlert } from 'lucide-react'

type message = { message: string }

const InputError = ({ message }: message) => {
   return (
      <div className="flex items-center gap-2 justify-center text-red-500">
         <TriangleAlert color="#EF4444" />
         <span> {message} </span>
      </div>
   )
}

export default InputError
