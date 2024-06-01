import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import TopbarInit from "./TopbarInit";
import { useState, useContext } from "react";
import UserService from "../api/UserService";
import {
  SnackbarContext,
  SnackbarContextType,
} from "../helpers/SnackbarContext";

export default function ForgotPassword() {
  const { message, handleSetMessage } = useContext(
    SnackbarContext
  ) as SnackbarContextType;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [codeSent, setCodeSent] = useState(false);

  const handleCancelClick = () => {
    navigate("/login");
  };

  const handleFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      handleSetMessage("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      console.log("Email submitted:", email);
      const response = await UserService.forgotPassword(email);
      console.log("Response from backend:", response.data);
      handleSetMessage("Verification code sent.");
      // navigate(
      //   `/forgot-password/verify-code?email=${encodeURIComponent(email)}`
      // );
      setCodeSent(true);
      navigate("/forgot-password/verify-code", { state: { email } });
    } catch (error) {
      console.error("Error:", error);
      handleSetMessage("Something went wrong. Please double check your email.");
    } finally {
      setLoading(false);
    }
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
              Forgot Password?
            </Typography>
            <Typography variant="body1" sx={{ mt: { xs: 3, sm: 4, md: 6 } }}>
              In order to reset your password, please input your email to
              confirm your request.
            </Typography>
            <TextField
              size="small"
              required
              name="email"
              label="Email"
              variant="outlined"
              fullWidth
              sx={{
                mb: { xs: 2, sm: 2, md: 2 },
                mt: { xs: 2, sm: 2, md: 3 },
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                Send Verification
              </Button>
            </Stack>
          </Grid>
        </Box>
      </Grid>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress color="secondary" size={80} />
        </div>
      )}
      <Outlet />
    </Grid>
  );
}
