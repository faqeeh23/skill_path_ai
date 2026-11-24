import { Outlet } from "react-router"
import Navbar from "../components/layaout/Navbar"
import Footer from "../components/layaout/Footer"

export default function PublicLayout() {
    return (
        <div className="app-shell">
            <a className="skip-link" href="#main-content">Skip to content</a>
            <Navbar/>
            <main className="app-main" id="main-content" tabIndex={-1}>
                <Outlet/>
            </main>
            <Footer/>
        </div>
    )
}