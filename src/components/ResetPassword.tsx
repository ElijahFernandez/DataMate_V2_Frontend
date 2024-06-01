import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopbarInit from "./TopbarInit";
import { useContext, useState } from "react";
import UserService from "../api/UserService";
import {
  SnackbarContext,
  SnackbarContextType,
} from "../helpers/SnackbarContext";

import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function ResetPassword() {
  const { message, handleSetMessage } = useContext(
    SnackbarContext
  ) as SnackbarContextType;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const isSmallScreen = window.innerWidth < 600;

  const handleCancelClick = () => {
    navigate("/login");
  };

  const handleFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      handleSetMessage("Your password should not be less than 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      handleSetMessage("Passwords do not match");
      return;
    }
    try {
      if (email !== null) {
        const response = await UserService.resetPassword(email, newPassword);

        if (response.data === "Password reset successful.") {
          console.log("Response from backend:", response.data);
          handleSetMessage(response.data);
          navigate("/login");
        } else {
          console.error("Something went wrong...");
          handleSetMessage(response.data);
        }
      } else {
        console.error("Email is null. This should not happen.");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        handleSetMessage(error.response.data);
      } else {
        console.error("Error:", error);
        handleSetMessage(
          "New password must be different from current password."
        );
      }
    }
  };

  const handleToggleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Grid
      className="gradientbg"
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: "100%",
        minHeight: "100vh",
        padding: {
          xs: "2rem 1rem",
          sm: "8rem 0rem 9rem 0rem",
          md: "8rem 0rem 7.8rem 0rem ",
        },
      }}
    >
      <TopbarInit />
      <Grid
        component="form"
        container
        justifyContent="center"
        alignItems="center"
        mt={6.6}
      >
        <Box
          sx={{
            backgroundColor: "white",
            margin: "30px",
            padding: "35px 30px",
            borderRadius: "20px",
            boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
            opacity: 0.85,
          }}
        >
          <Grid
            direction="column"
            container
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: "#374248" }}
            >
              Reset Password
            </Typography>
            <Typography
              variant="body1"
              sx={{ marginTop: { xs: 3, sm: 4, md: 6 } }}
            >
              Please provide a new password for your account security. Choose a
              strong {isSmallScreen ? null : <br />} one to enhance protection
            </Typography>
            <TextField
              size="small"
              required
              name="newPassword"
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              sx={{
                // marginBottom: { xs: 2, sm: 2, md: 2 },
                marginTop: { xs: 2, sm: 2, md: 3 },
              }}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleToggleNewPassword}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              size="small"
              required
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              sx={{
                marginBottom: { xs: 2, sm: 2, md: 2 },
                marginTop: { xs: 2, sm: 2, md: 3 },
              }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleToggleConfirmPassword}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <Stack
              spacing={3}
              direction={{ xs: "column", md: "row" }}
              sx={{
                mt: 3,
                justifyContent: { xs: "center", md: "end" },
                ml: { xs: "10px", md: "180px" },
              }}
            >
              <Button
                type="submit"
                variant="contained"
                sx={{ width: { xs: "100%", md: "200px" } }}
                onClick={handleCancelClick}
                style={{
                  fontWeight: "bold",
                  backgroundColor: "#C0C0C0",
                  color: "white",
                  borderRadius: "50px",
                  padding: "10px 50px",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFormSubmit}
                color="primary"
                variant="contained"
                sx={{
                  width: "200px",
                }}
                style={{
                  fontWeight: "bold",
                  backgroundColor: "#71C887",
                  color: "white",
                  borderRadius: "50px",

                  padding: "10px 20px",
                }}
              >
                Confirm
              </Button>
            </Stack>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
