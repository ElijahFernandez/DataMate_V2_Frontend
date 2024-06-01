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
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import TopbarInit from "./TopbarInit";
import { useContext, useEffect, useState } from "react";
import UserService from "../api/UserService";
import { Link } from "react-router-dom";
import {
  SnackbarContext,
  SnackbarContextType,
} from "../helpers/SnackbarContext";

export default function VerifyCode() {
  const { message, handleSetMessage } = useContext(
    SnackbarContext
  ) as SnackbarContextType;
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [loading, setLoading] = useState(false);
  // const email = new URLSearchParams(location.search).get("email");
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const isSmallScreen = window.innerWidth < 600;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const storedRemainingTime = localStorage.getItem("remainingTime");

    if (storedRemainingTime) {
      setRemainingTime(parseInt(storedRemainingTime));
    }

    if (remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1;
          localStorage.setItem("remainingTime", newTime.toString());
          return newTime;
        });
      }, 1000);
    } else {
      setResendDisabled(false);
      localStorage.removeItem("remainingTime");
    }

    setIntervalId(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [remainingTime]);

  const handleCancelClick = () => {
    navigate("/login");
  };

  const handleFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      console.log("Verification code submitted:", code);
      console.log("Email:", email);

      if (email !== null) {
        const response = await UserService.verifyCode(email, code);

        if (response.data === "Email is verified.") {
          handleSetMessage(response.data);
          navigate("/forgot-password/reset-password", { state: { email } });
        } else {
          console.error("Invalid verification code");
          handleSetMessage("Invalid verification code.");
        }
      } else {
        console.error("Email is null. This should not happen.");
      }
    } catch (error) {
      console.error("Error:", error);
      handleSetMessage("Invalid verification code.");
    }
  };

  const handleResendClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const storedRemainingTime = localStorage.getItem("remainingTime");

    if (!storedRemainingTime || parseInt(storedRemainingTime) <= 0) {
      setResendDisabled(true);
      setRemainingTime(300); // Reset timer to 5 minutes

      try {
        setLoading(true);
        const response = await UserService.forgotPassword(email);
        console.log("Response from backend:", response.data);
        handleSetMessage("Verification code resent.");
      } catch (error) {
        console.error("Error:", error);
        handleSetMessage(
          "Unable to resend verification code. Please try again."
        );
      } finally {
        setLoading(false);
      }
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
              Account Verification
            </Typography>
            <Typography
              variant="body1"
              sx={{ marginTop: { xs: 3, sm: 4, md: 6 } }}
            >
              We have sent a code to your email , {email}. Enter it{" "}
              {isSmallScreen ? null : <br />} below to confirm your account.
            </Typography>
            <TextField
              size="small"
              required
              name="code"
              label="Verification Code"
              variant="outlined"
              fullWidth
              sx={{
                marginBottom: { xs: 2, sm: 2, md: 2 },
                marginTop: { xs: 2, sm: 2, md: 3 },
              }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
            <Grid container justifyContent="center" alignItems="center" mt={5}>
              <Typography variant="body2">
                Didn't receive the code?{" "}
                {remainingTime === 0 ? (
                  <button
                    onClick={handleResendClick}
                    className={resendDisabled ? "disabled-link" : ""}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#0000FF",
                      textDecoration: "underline",
                    }}
                  >
                    Resend.
                  </button>
                ) : (
                  <span
                    className="disabled-link"
                    style={{ color: "#0000FF", textDecoration: "underline" }}
                  >
                    Resend.
                  </span>
                )}
                <span>
                  Remaining Time: {Math.floor(remainingTime / 60)}:
                  {String(remainingTime % 60).padStart(2, "0")}
                </span>
              </Typography>
            </Grid>
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
