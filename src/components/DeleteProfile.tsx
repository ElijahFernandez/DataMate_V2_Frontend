import React, { ChangeEvent, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import { useNavigate, useParams } from "react-router-dom";
import UserService from "../api/UserService";
import { useDispatch } from "react-redux";
import { logout } from "../helpers/AuthAction";
import { Grid } from "@mui/material";
import CryptoJS from 'crypto-js';

const DeleteProfile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [pass, setPass] = useState<string | undefined>(undefined);
  const [passwordInput, setPasswordInput] = useState("");
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

  useEffect(() => {
    const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';
    const decryptedUserId = CryptoJS.AES.decrypt(userId, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    if (decryptedUserId) {
      UserService.getUserById(decryptedUserId)
        .then((response) => {
          setData(response.data);
          setUserImage(response.data.userImage);
          setPass(response.data.password);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId]);

  const handlePasswordShow = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "password" && value.trim() === "") {
      setData({ ...data, [name]: "" });
      setPasswordInput("");
      setPasswordError(null);
    } else {
      setData({ ...data, [name]: value });

      if (name === "password") {
        setPasswordInput(value);
      }
    }
  };

  const validatePassword = () => {
    console.log("Input Password:", passwordInput);

    if (passwordInput.trim() === "") {
      setPasswordError(null);
      return false;
    }
    if (passwordInput !== pass) {
      setPasswordError("Incorrect password");
      return false;
    }

    setPasswordError(null);
    return true;
  };

  const deleteAccount = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';
    const decryptedUserId = CryptoJS.AES.decrypt(userId, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    if (!decryptedUserId) {
      console.error("User ID is undefined");
      return;
    }
    if (!validatePassword()) {
      return;
    }
    try {
      await UserService.deleteUser(decryptedUserId);
      await dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleCancelClick = () => {
    navigate("/profile");
  };

  return (
    <section
      className="gradientbg"
      style={{
        // position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Grid
        container
        component="form"
        onSubmit={deleteAccount}
        justifyContent="center"
        alignItems="center"
        sx={{ width: "100%", mt: 8 }}
      >
        <Box
          // width={{ xl: "50%", sm: "85%", xs: "95%", lg: "50%" }}
          // height={{ xl: 500, sm: 550, xs: 650, lg: 500 }}
          // marginX="auto"
          // marginTop="200px"
          borderRadius="50px"
          sx={{
            backgroundColor: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            textAlign: "center",
            mt: 15,
            mx: { xs: 5 },
          }}
        >
          <Avatar
            alt="Placeholder Image"
            src={userImage ? `data:image/jpeg;base64,${userImage}` : undefined}
            sx={{
              width: 150,
              height: 150,
              backgroundColor: "#fff",
              borderRadius: "50%",
              position: "absolute",
              top: -75,
            }}
          />

          <Stack
            // marginTop={{ xs: 0, sm: 4, md: 5, lg: 5, xl: 5 }}
            m={8}
            // paddingX="20px"
          >
            <Typography
              variant="h4"
              color="black"
              fontWeight="bold"
              marginBottom="50px"
              textAlign="center"
              sx={{ mt: 3 }}
            >
              Delete Account
            </Typography>
            <Typography
              variant="body1"
              textAlign="left"
              // marginLeft={{ xs: 3, sm: 3, md: 0, lg: 0, xl: 0 }}
              marginBottom="10px"
              color="black"
            >
              We are sorry to hear that you want to delete your account.
            </Typography>
            <TextField
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              value={passwordInput} // Use passwordInput instead of password
              label="Password"
              name="password"
              id="filled-password-input"
              required
              autoComplete="current-password"
              variant="outlined"
              error={passwordError !== null}
              helperText={passwordError}
              sx={{
                marginBottom: "50px",
                marginLeft: {
                  xs: 3,
                  sm: 3,
                  md: 0,
                  lg: 0,
                  xl: 0,
                },
                "& .MuiInputLabel-root": {
                  color: "black",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "black",
                  },
                  "&:hover fieldset": {
                    borderColor: "black",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {" "}
                    <IconButton onClick={handlePasswordShow}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>{" "}
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="body2"
              textAlign="left"
              marginBottom="20px"
              color="black"
              marginLeft={{ xs: 3, sm: 3, md: 0, lg: 0, xl: 0 }}
            >
              If you choose to continue, your account details, and other related
              data will also be deleted.
            </Typography>
            <Typography
              variant="body2"
              textAlign="left"
              marginBottom="10px"
              color="black"
              marginLeft={{ xs: 3, sm: 3, md: 0, lg: 0, xl: 0 }}
            >
              Do you still want to delete your account?
            </Typography>
          </Stack>
          <Box
            // marginTop={{
            //   xs: "50px",
            //   sm: "20px",
            //   md: "20px",
            //   lg: "20px",
            //   xl: "20px",
            // }}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              marginRight: "15%",
              mb: 3,
            }}
          >
            <Button
              variant="contained"
              type="submit"
              sx={{
                width: "130px",
                height: "40px",
                borderRadius: "50px",
                color: "white",
                backgroundColor: "#CCCCCC",
                boxShadow: "0px 4px 4px 0px #00000040",
                // "&:hover": {
                //   backgroundColor: "red",
                // },
              }}
            >
              Delete
            </Button>

            <Button
              variant="contained"
              sx={{
                width: "130px",
                height: "40px",
                borderRadius: "50px",
                color: "white",
                marginLeft: "10px",
                backgroundColor: "#71C887",
                // "&:hover": {
                //   backgroundColor: "green",
                // },
              }}
              onClick={handleCancelClick}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Grid>
    </section>
  );
};

export default DeleteProfile;
