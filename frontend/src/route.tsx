import { createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import Signup from "@components/Signup.tsx";

export default createBrowserRouter([
   {
      path: "/",
      element: <App />,
      errorElement: <div>404</div>
   },
   {
      path: "/signup",
      element: <Signup />
   }
])