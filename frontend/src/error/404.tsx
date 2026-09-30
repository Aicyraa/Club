import { Link } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const PageNotFound = () => {
   return (
      <div className="flex min-h-screen items-center justify-center p-4">
         <Card className="w-full max-w-sm text-center">
            <CardHeader>
               <TriangleAlert className="text-destructive mx-auto size-8" />
               <CardTitle>404</CardTitle>
               <CardDescription>Oops, this page could not be found.</CardDescription>
            </CardHeader>

            <CardFooter className="justify-center">
               <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
                  Back to home
               </Button>
            </CardFooter>
         </Card>
      </div>
   )
}

export default PageNotFound
