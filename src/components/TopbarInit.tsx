import * as React from "react";
import AppBar from "@mui/material/AppBar";
import { Box, Toolbar, Button, Stack, IconButton, Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../images/datamate-logo.png";
import { NavLink, useLocation } from "react-router-dom";
import { Grid } from "@mui/material";

export default function TopbarInit() {
  const location = useLocation();
  const navItems: { text: string; link: string }[] = [
    { text: "About Us", link: "/about-us" },
    { text: "Contact Us", link: "/contact-us" },
    { text: "Register", link: "/registration" },
    { text: "Login", link: "/login" },
  ];

  const [isHovered, setIsHovered] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        component="nav"
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <a href="/">
              <img src={Logo} alt={"datamate-logo"} style={{ width: '130px', height: 'auto', paddingTop: "4px" }} />
            </a>

            <Stack direction="row" spacing={2} sx={{ display: { xs: "none", sm: "flex" } }}>
              {navItems.map((listItem, index) => (
                <NavLink key={index} to={listItem.link}>
                  <div className='hover-style' onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                    <Button
                      color="inherit"
                      sx={{
                        color:
                          location.pathname === listItem.link
                            ? "#17A2A6"
                            : "#374248",
                        whiteSpace: "nowrap",
                        textTransform: "none",
                        fontWeight: "bold",
                      }}
                    >
                      {listItem.text}
                    </Button>
                  </div>
                </NavLink>
              ))}
            </Stack>

            {/* hamburger menu for xs */}
            <IconButton
              sx={{ display: { xs: "flex", sm: "none" } }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <Stack
          direction="column-reverse"
          spacing={2}
          sx={{ width: 200, padding: 2 }}
        >
          {navItems.map((listItem, index) => (
            <NavLink key={index} to={listItem.link}>
              <Button
                color="inherit"
                sx={{
                  color:
                    location.pathname === listItem.link
                      ? "#17A2A6"
                      : "#374248",
                  whiteSpace: "nowrap",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                onClick={handleDrawerToggle}
              >
                {listItem.text}
              </Button>
            </NavLink>
          ))}
        </Stack>
      </Drawer>
    </Box>
  );
}
