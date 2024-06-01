import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { NavbarLink } from './NavbarLink';
import { useNavigate } from 'react-router-dom';
import { logout } from '../helpers/AuthAction';
import { useDispatch } from 'react-redux';
import HomeIcon from '../images/home.png';
import TemplateIcon from '../images/template.png';
import FilesIcon from '../images/files.png';
import DatabasesIcon from '../images/databases.png';
import GroupIcon from '../images/groups.png';
import ContactIcon from '../images/contact.png';
import LogoutIcon from '../images/logout.png';

type NavbarListProps = {
  open: boolean;
  handleDrawerClose: () => void;
};

const NavbarList = ({ open,  handleDrawerClose }: NavbarListProps) => {
  const navlist: { text: string; icon: React.ReactNode; link: string; end: boolean }[] = [
    { text: "Home", icon: <img src={HomeIcon} alt="Home" style={{width: 25, height: 25}}/>, link: "/", end: true },
    { text: "Templates", icon: <img src={TemplateIcon} alt="Templates" style={{width: 25, height: 25}}/>, link: "/templates", end: true },
    { text: "Files", icon: <img src={FilesIcon} alt="Files" style={{width: 25, height: 25}}/>, link: "/files", end: true },
    { text: "Databases", icon: <img src={DatabasesIcon} alt="Databases" style={{width: 25, height: 25}}/>, link: "/databases", end: true },
    { text: "About Us", icon: <img src={GroupIcon} alt="About Us" style={{width: 25, height: 25}}/>, link: "/about-us", end: true },
    { text: "Contact Us", icon: <img src={ContactIcon} alt="Contact Us" style={{width: 25, height: 25}}/>, link: "/contact-us", end: true },
  ];
 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
    handleDrawerClose();
  };

  return (
    <div style={{ height: "100vh" }}>
      {/* Main List */}

      <List>
        {navlist.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block", marginBottom: "8px" }}>
            <NavbarLink
              to={item.link}
              text={item.text}
              icon={item.icon}
              open={open} // Assuming open is defined elsewhere
              end={item.end}
            />
          </ListItem>
        ))}
      </List>

      {/* Log out option */}
      <List>
        <div
          style={{ display: "flex", flexDirection: "column", height: "35vh" }}
        >
          <div style={{ marginTop: "auto" }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  color: "tertiary.contrastText",
                  minHeight: 30,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  "&.Mui-selected": { backgroundColor: "#ECECEC" },
                  "&.Mui-selected:hover": { backgroundColor: "#ECECEC" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                  <img src={LogoutIcon} alt="Files" style={{width: 25, height: 25}}/>
                </ListItemIcon>
                <div style={{ display: "flex", justifyContent: "left" }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{ padding: 0 }}
                      >
                        Log out
                      </Typography>
                    }
                  />
                </div>
              </ListItemButton>
            </ListItem>
          </div>
        </div>
      </List>
    </div>
  );
};

export default NavbarList;
