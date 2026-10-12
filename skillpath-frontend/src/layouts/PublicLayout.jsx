import { Outlet } from "react-router"
import Navbar from "../components/layaout/Navbar"
import Footer from "../components/layaout/Footer"

export default function PublicLayout() {
    return (
        <div className="app-shell">
            <Navbar/>
            <main className="app-main">
                <Outlet/>
            </main>
            <Footer/>
        </div>
    )
}