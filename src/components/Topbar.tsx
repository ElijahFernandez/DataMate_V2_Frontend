import {
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  Popover,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Logo from "../images/datamate-logo.png";
import WLogo from "../images/DMLogoWhiteNoBG.png";
import { AccountCircle, ExitToApp, Menu } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppBar } from "../styles/TopbarSytles";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import UserService from "../api/UserService";
import React from "react";
import { logout } from "../helpers/AuthAction";
import SettingsIcon from "@mui/icons-material/Settings";
import FeedbackIcon from "@mui/icons-material/Feedback";
import CryptoJS from 'crypto-js';

type TopbarProps = {
  open: boolean;
  handleDrawerOpen: () => void;
};

const Topbar = ({ open, handleDrawerOpen }: TopbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const dispatch = useDispatch();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  useEffect(() => {
    const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';
    const decryptedUserId = CryptoJS.AES.decrypt(userId, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

    if (decryptedUserId) {
      UserService.getUserById(decryptedUserId)
        .then(async (res) => {
          setUserImage(res.data.userImage);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [userId, setUserImage]);

  // useEffect(() => {
  //   console.log('Profile pic:',userImage);
  // }, [userImage]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAvatarClose = () => {
    setAnchorEl(null);
  };

  const handleMyProfileClick = () => {
    navigate("/profile");
    handleAvatarClose();
  };

  const handleLogoutClick = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    username: "",
    password: "",
    businessName: "",
    businessType: "",
  });

  const {
    firstName,
    lastName,
    email,
    address,
    username,
    password,
    businessName,
    businessType,
  } = data;

  useEffect(() => {
    const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';
    const decryptedUserId = CryptoJS.AES.decrypt(userId, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    if (decryptedUserId) {
      UserService.getUserById(decryptedUserId)
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId]);

  return (
    <AppBar
      position="fixed"
      open={open}
      sx={{ backgroundColor: "primary.contrastText", alignItem: "center" }}
    >
      <Toolbar
        sx={{
          backgroundColor:
            location.pathname === "/file" ||
            location.pathname === "/convert" ||
            location.pathname === "/database" ||
            location.pathname === "/file-logs" ||
            location.pathname === "/deleted-files" ||
            location.pathname === "/files"
              ? "#FFFFFF"
              : "",
        }}
      >
        <IconButton
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            width: "4%",
            color:
              location.pathname === "/file" ||
              location.pathname === "/convert" ||
              location.pathname === "/database" ||
              location.pathname === "/file-logs" ||
              location.pathname === "/deleted-files" ||
              location.pathname === "/files"
                ? "#000000"
                : "",
            marginRight: 1,
            ...(open && { display: "none" }),
          }}
        >
          <Menu />
        </IconButton>

        <Box sx={{ width: "100%" }}>
          <a href="/">
            <img
              src={
                location.pathname === "/file" ||
                location.pathname === "/convert" ||
                location.pathname === "/database" ||
                location.pathname === "/file-logs" ||
                location.pathname === "/deleted-files" ||
                location.pathname === "/files"
                  ? Logo //WLogo
                  : Logo
              }
              alt={"datamate logo"}
              style={{
                width: "100px",
                // height: "auto",
                maxHeight: "150px",
                paddingTop: "4px",
              }}
            />
          </a>
        </Box>

        <Box>
          <Tooltip title="Account">
            <IconButton
              sx={{
                color:
                  location.pathname === "/file" ||
                  location.pathname === "/convert" ||
                  location.pathname === "/database"
                    ? "#FFFFFF"
                    : "#000000",
              }}
              onClick={handleAvatarClick}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <div className="hover-style">
                <Avatar
                  sx={{
                    bgcolor: "#3DB1BA",
                    width: { xs: 30, sm: 37, md: 40 },
                    height: { xs: 30, sm: 37, md: 40 },
                  }}
                  alt="User"
                  src={
                    userImage
                      ? `data:image/jpeg;base64,${userImage}`
                      : undefined
                  }
                ></Avatar>
              </div>
            </IconButton>
          </Tooltip>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleAvatarClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Grid
                container
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
              >
                <Stack>
                  <IconButton onClick={handleMyProfileClick}>
                    <Grid container>
                      <Avatar
                        sx={{
                          bgcolor: "#3DB1BA",
                          mr: 2,
                          width: { xs: 19, sm: 29, md: 32 },
                          height: { xs: 19, sm: 29, md: 32 },
                        }}
                        alt="User"
                        src={
                          userImage
                            ? `data:image/jpeg;base64,${userImage}`
                            : undefined
                        }
                      ></Avatar>
                    </Grid>
                    <Typography
                      sx={{
                        fontSize: "15px",
                        whiteSpace: "nowrap",
                        fontWeight: "bold",
                      }}
                    >
                      {firstName + " " + lastName}
                    </Typography>
                  </IconButton>
                  <Divider orientation="horizontal" />
                </Stack>
                <List>
                  <ListItem>
                    <IconButton>
                      <SettingsIcon sx={{ fontSize: "21px" }} />
                      <Typography sx={{ ml: 2, fontSize: "15px" }}>
                        Settings
                      </Typography>
                    </IconButton>
                  </ListItem>
                  <ListItem>
                    <IconButton>
                      <FeedbackIcon sx={{ fontSize: "21px" }} />
                      <Typography sx={{ ml: 2, fontSize: "15px" }}>
                        Feedback
                      </Typography>
                    </IconButton>
                  </ListItem>
                  <ListItem>
                    <IconButton onClick={handleLogoutClick}>
                      <ExitToApp sx={{ fontSize: "21px" }} />
                      <Typography sx={{ ml: 2, fontSize: "15px" }}>
                        Logout
                      </Typography>
                    </IconButton>
                  </ListItem>
                </List>
              </Grid>
            </Box>
          </Popover>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
