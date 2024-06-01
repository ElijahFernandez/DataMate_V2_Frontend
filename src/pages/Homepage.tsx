import { useState } from "react";
import Home from "../components/Home"
import '../styles/SupportStyles.css'
import Topbar from "../components/Topbar";

type HomeProps = {
    toggleImport: () => void,
}
export default function Homepage() {
    const [open, setOpen] = useState(false);
    const toggleDrawerOpen = () => {
        setOpen(!open);
      };
    return(
        <>
            <Topbar open={open} handleDrawerOpen={toggleDrawerOpen} />
        </>
    )

}