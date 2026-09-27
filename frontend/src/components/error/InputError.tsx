import { TriangleAlert } from 'lucide-react'

type message = { message: string }

const InputError = ({ message }: message) => {
   return (
      <div
         className="
        flex
        p-1
        text-red-500
        bg-red-200
        border border-red-500
        items-center justify-center gap-2
      "
      >
         <TriangleAlert color="#EF4444" />
         <span> {message} </span>
      </div>
   )
}

export default InputError
