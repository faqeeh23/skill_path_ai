import {BrowserRouter, Routes, Route} from "react-router"
import PublicLayout from "./layouts/PublicLayout.jsx"
import Home from "./pages/Home.jsx"
// import ExplorePaths from "./pages/ExplorePaths"
// import Login from "./pages/Login"
// import Register  from "./pages/Register"


export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route element={<PublicLayout/>}>
        <Route path ="/" element = {<Home/>}/>
        {/* <Route path ="/paths" element = {<ExplorePaths/>}/> */}
        {/* <Route path ="/login" element = {<Login/>}/>
        <Route path ="/register" element = {<Register/>}/> */}
      </Route>
    </Routes>
  </BrowserRouter>
}