import {BrowserRouter, Routes, Route, Navigate} from "react-router"
import PublicLayout from "./layouts/PublicLayout.jsx"
import Home from "./pages/Home.jsx"
import ExplorePaths from "./pages/explore/ExplorePaths.jsx"
import "open-glass-ui/styles.css";

import Login from "./features/auth/pages/Login.jsx"
import Register from "./features/auth/pages/Register.jsx"
import ForgotPassword from "./features/auth/pages/ForgotPassword.jsx"
import ResetPassword from "./features/auth/pages/ResetPassword.jsx"
import VerifyEmail from "./features/auth/pages/VerifyEmail.jsx"
import Pricing from "./features/subscription/Pages/Pricing.jsx"
import Checkout from "./features/subscription/Pages/Checkout.jsx"


export default function App() {
  return( 
  <BrowserRouter>
    <Routes>
      <Route element={<PublicLayout/>}>
        <Route path ="/" element = {<Home/>}/>
        <Route path ="/paths" element = {<ExplorePaths/>}/>
        <Route path ="/login" element = {<Login/>}/>
        <Route path ="/register" element = {<Register/>}/>
        <Route path ="/forgot-password" element={<ForgotPassword/>}/>
        <Route path ="/reset-password" element={<ResetPassword/>}/>
        <Route path ="/verify-email" element={<VerifyEmail/>}/>
        <Route path ="/pricing" element={<Pricing/>}/>
        <Route path ="/checkout" element={<Checkout/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />}/> 
    </Routes>
  </BrowserRouter>
  )
}