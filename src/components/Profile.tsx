import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { ChangeEvent, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import UserService from "../api/UserService";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../helpers/AuthAction";
import { Link } from "react-router-dom";
import { RootState } from "../helpers/Store";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CryptoJS from 'crypto-js';

export default function EditProfile() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const para = { id: useSelector((state: RootState) => state.auth.userId) };
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [isLoading, setLoading] = useState(true);
  //const {user} = useContext(UserContext) as UserContextType;
  const dispatch = useDispatch();

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

  const handleEditClick = () => {
    navigate("/profile/edit-profile");
  };

  const handleLogoutClick = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

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

  useEffect(()=>{
    if(data.firstName === ""){
      setLoading(true);
    }
      const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';
      const decryptedUserId = CryptoJS.AES.decrypt(para.id, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      if (decryptedUserId) {
        UserService.getUserById(decryptedUserId)
          .then((response) => {
            setData(response.data);
            setUserImage(response.data.userImage);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });
    }
  },[para]);




  return (
    <div
      className="gradientbg edit-spacing"
      style={{
        width: "100%",
        height: "100%", 
      }}
     
    >
      <Grid container justifyContent="center" alignItems="center">
        { isLoading?<>
        <Box height="100vh" mt={40}>
          <CircularProgress size="6rem" color="success" />
        </Box>
        </>
        :<>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
          marginTop="72px"
        >
          
        <Grid container direction="row" paddingTop="26px" marginBottom="2px" >
          <Box
              sx={{
                backgroundColor: "white",
                margin: { xs: "115px"  },
                borderRadius: "45px",
                boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
                marginLeft: {md: "200px"}
              }}
            >
              <Grid container justifyContent="center" alignItems="center" >
                <Grid
                  container
                  justifyContent="center"
                  alignItems="center"
                  direction="row"
                >
                  <Avatar
                    alt="Placeholder Image"
                    src={
                      userImage
                        ? `data:image/jpeg;base64,${userImage}`
                        : undefined
                    }
                    sx={{
                      width: 170,
                      height: 170,
                      backgroundColor: "white",
                      borderColor: "white",
                      borderWidth: "5px",
                      borderRadius: "50%",
                      position: "absolute",
                      top: 65,
                      marginTop: "50px"
                    }}
                  />
                  {/* <IconButton sx={{ backgroundColor: "#71C887" }}>
                    <AddAPhotoIcon sx={{ color: "white" }} />
                  </IconButton> */}
                </Grid>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid
                    container
                    direction="column"
                    sx={{ m: 8 }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{
                          justify: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {firstName + " " + lastName}
                      </Typography>
                    </Box>
                    <Box
                      className="editBtn"
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        // paddingLeft: "40px"
                      }}
                      onClick={handleEditClick}
                    >
                      <Button variant="contained" type="submit">
                        Edit Profile
                      </Button>
                    </Box>
                    <Box
                      className="editBtn"
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        // marginTop: "-20px",
                      }}
                    >
                      <Link
                        to="/profile/delete-profile"
                        style={{ textDecoration: "none" }}
                      >
                        <Button variant="contained" type="submit">
                          Delete Account
                        </Button>
                      </Link>
                    </Box>

                    <Box
                      className="editBtn"
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "60px",
                      }}
                    >
                      <Button
                        variant="contained"
                        type="submit"
                        onClick={handleLogoutClick}
                      >
                        Logout
                      </Button>
                    </Box>
                  </Grid>
                </Stack>
              </Grid>
            </Box>
            
          </Grid>

          <Grid container mr={"100px"}>
            <Grid container justifyContent="center" alignItems="center"   >
              <Box
                sx={{
                  backgroundColor: "white",
                  margin: { xs: "60px", },
                  padding: {
                    xs: "80px 30px 25px 25px",
                    md: "55px 35px 50px 35px",
                  },
                  borderRadius: "20px",
                  boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
                  
                }}

              >
                <Stack
                  direction="column"
                  divider={
                    <Divider
                      orientation="horizontal"
                      flexItem
                      sx={{
                        borderBottomWidth: "3px",
                        borderColor: "#374248",
                      }}
                    />
                  }
                  spacing={2}
                >
                  <Typography variant="h4" fontWeight="bold">
                    User Profile
                  </Typography>
                  <Container>
                    <Grid
                      container
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      sx={{ marginTop: "10px" }}
                    >
                      <Stack direction="row">
                        <TextField
                          id="outlined-read-only-input"
                          size="small"
                          name="firstName"
                          label="First Name"
                          variant="outlined"
                          value={firstName}
                          InputProps={{ readOnly: true }}
                          sx={{
                            marginBottom: { xs: 2, sm: 2, md: 3 },
                            marginRight: { md: 2 },
                            width: { xs: "100%", sm: "100%", md: "auto" },
                          }}
                        />
                        <TextField
                          id="outlined-read-only-input"
                          size="small"
                          name="lastName"
                          label="Last Name"
                          variant="outlined"
                          value={lastName}
                          InputProps={{ readOnly: true }}
                          sx={{
                            marginBottom: { xs: 2, sm: 2, md: 3 },
                            width: { xs: "100%", sm: "100%", md: "auto" },
                          }}
                        />
                      </Stack>
                    </Grid>
                    <Grid
                      container
                      direction="column"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <TextField
                        id="outlined-read-only-input"
                        size="small"
                        name="email"
                        label="Email"
                        variant="outlined"
                        value={email}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        sx={{ marginBottom: { xs: 2, sm: 2, md: 3 } }}
                      />
                      <TextField
                        id="outlined-read-only-input"
                        size="small"
                        name="address"
                        label="Address"
                        variant="outlined"
                        value={address}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        sx={{ marginBottom: { xs: 2, sm: 2, md: 3 } }}
                      />
                      <TextField
                        id="outlined-read-only-input"
                        size="small"
                        name="username"
                        label="Username"
                        variant="outlined"
                        value={username}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        sx={{ marginBottom: { xs: 2, sm: 2, md: 3 } }}
                      />
                      <TextField
                        id="outlined-read-only-input"
                        size="small"
                        name="businessName"
                        label="Business Name"
                        variant="outlined"
                        value={businessName}
                        InputProps={{ readOnly: true }}
                        fullWidth
                        sx={{ marginBottom: { xs: 2, sm: 2, md: 3 } }}
                      />
                      <FormControl fullWidth>
                        <InputLabel id="outlined-read-only-input" size="small">
                          Business Type
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          name="businessType"
                          value={businessType}
                          label="Business Type"
                          size="small"
                        >
                          <MenuItem value={"Food & Beverages"}>
                            Food & Beverages
                          </MenuItem>
                          <MenuItem value={"Retail"}>Retail</MenuItem>
                          <MenuItem value={"Manufacturing"}>
                            Manufacturing
                          </MenuItem>
                          <MenuItem value={"Service-based"}>
                            Service-based
                          </MenuItem>
                          <MenuItem value={"Others"}>Others</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Container>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Stack></> }
      </Grid>
      <Outlet />
    </div>
  );
}
