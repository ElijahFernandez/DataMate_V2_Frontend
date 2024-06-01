import { Drawer, DrawerHeader } from '../styles/NavbarStyles';
import NavbarList from './NavbarList';
import { Box, IconButton } from '@mui/material';
import Logo from '../images/datamate-logo.png';
import { Menu} from "@mui/icons-material";

type NavbarProps = {
    open: boolean,
    handleDrawerClose: () => void,
  }
  
  const Navbar = ({ open, handleDrawerClose }: NavbarProps) => {
    return (
        <Drawer variant="permanent" open={open} sx={{ "& .MuiPaper-root": { backgroundColor: "white" } }}>
        <DrawerHeader onClick={handleDrawerClose} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex'}}>
            <img src={Logo} alt="datamate logo" style={{ width: '120px', height: '32px', marginRight: '58px', marginTop: '10px'}} />
            <IconButton sx={{ color: "tertiary.contrastText", width:'20%'}}>
              <Menu />
            </IconButton>
          </Box>
        </DrawerHeader>
        <NavbarList open={open} handleDrawerClose={handleDrawerClose}/>
      </Drawer>
    );
  }
  

export default Navbar;