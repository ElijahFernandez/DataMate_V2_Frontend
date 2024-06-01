import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Grid, IconButton, InputAdornment, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopbarInit from './TopbarInit';
import UserService from '../api/UserService';
import { SnackbarContext, SnackbarContextType } from '../helpers/SnackbarContext';
import { useDispatch, useSelector } from 'react-redux';
import { loginFailure, loginSuccess, logout } from '../helpers/AuthAction';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecureLogin from '../images/seclogin.gif';

type LoginProps = {
  startLoading: () => void,
  stopLoading: () => void,
}

export default function Login({startLoading, stopLoading}:
  LoginProps){

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const { handleSetMessage } = useContext(SnackbarContext) as SnackbarContextType;
    const dispatch = useDispatch();
    const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | undefined>(undefined);

    // inactivity timer, auto logout after 12 hours of inactivity
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        const newTimer = setTimeout(() => {
        dispatch(logout());
        navigate('/', { replace: true });
        }, 12 * 60 * 60 * 1000); // 12 hours in milliseconds
        setInactivityTimer(newTimer);
    };

    useEffect(() => {
        resetInactivityTimer();

        window.addEventListener('mousemove', resetInactivityTimer);
        window.addEventListener('keydown', resetInactivityTimer);
        window.addEventListener('mousedown', resetInactivityTimer);
        window.addEventListener('touchstart', resetInactivityTimer);
        window.addEventListener('scroll', resetInactivityTimer);

        return () => {
            clearTimeout(inactivityTimer);
            window.removeEventListener('mousemove', resetInactivityTimer);
            window.removeEventListener('keydown', resetInactivityTimer);
            window.removeEventListener('mousedown', resetInactivityTimer);
            window.removeEventListener('touchstart', resetInactivityTimer);
            window.removeEventListener('scroll', resetInactivityTimer);
        };
    }, []);

    const [loginData, setLoginData] = useState({
        username: "",
        password: ""
    });

    const handlePasswordShow = () => {
        setShowPassword(!showPassword);
    }

    const onInputChange = (e: any) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        console.log(e.target.name)
    }
    

    const validateDetails = async (event:any) => {
        event.preventDefault();
        setUsernameError(null);
        setPasswordError(null);
      
        startLoading()
        UserService.getUserByUsernameDetails(loginData.username)
          .then((res) => {
            if (res.data !== "") {
              if (res.data.password === loginData.password) {
                UserService.getUserById(res.data.userId)
                  .then((user) => {
                    stopLoading();
                    if (user.data.length !== 0) {
                      dispatch(loginSuccess(res.data.userId));
                      console.log('success')
                      navigate('/', { replace: true });
                    } else {
                      setUsernameError("Invalid credentials.");
                      setPasswordError("");
                    }
                  })
                  .catch((error) => {
                    dispatch(loginFailure(error.message + ". Failed to login."));
                  });
              } else {
                stopLoading();
                setUsernameError("Invalid credentials.");
                setPasswordError("");
              }
            } else {
              stopLoading();
              setUsernameError("Invalid credentials.");
              setPasswordError("");
            }
          });
      };

      const [isLabelShrunkUsername, setIsLabelShrunkUsername] = useState(false);
      const [isLabelShrunkPass, setIsLabelShrunkPass] = useState(false);

      const handleUsernameTextFieldFocus = () => {
        setIsLabelShrunkUsername(true);
      };
    
      const handleUsernameTextFieldBlur = (event: any) => {
        if (!event.target.value) {
          setIsLabelShrunkUsername(false);
        }
      };

      const handlePassTextFieldFocus = () => {
        setIsLabelShrunkPass(true);
      };
    
      const handlePassTextFieldBlur = (event: any) => {
        if (!event.target.value) {
          setIsLabelShrunkPass(false);
        }
      };

      const isXsScreen = useMediaQuery('(max-width:900px)');

    return(
        <Grid className='gradientbg' sx={{ width: '100%', height: '100%' }}>
            <Grid component='form' onSubmit={validateDetails} container justifyContent="center" alignItems="center" sx={{ width: '100%', height: '100vh' }}>
                <Box sx={{ top: {xs: '18%', md: '13%'}, position:'absolute', maxWidth: 850, backgroundColor: 'white', margin: {xs: '30px'}, p: {xs: '50px 50px 50px 50px', md: '70px 60px 70px 60px'}, borderRadius: '20px', boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)' }}>
                    <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }}>
                      {!isXsScreen && (
                        <Box sx={{ maxWidth: { xs: 300, md: 500 }, maxHeight: { xs: 500, md: 400 }, mr: 10 }}>
                            <img src={SecureLogin} alt="Secure Login" style={{ height: 400 }} />
                        </Box>
                      )}
                        <Grid container direction='column'>
                        <Typography variant='h4' fontWeight="bold" color='#374248'>
                            Log-in
                        </Typography>
                        <Grid container sx={{pt: {xs: '15px', md: '15px'}}}>
                            <TextField
                                size="small"
                                required 
                                name="username"
                                label="Username"
                                value={loginData.username}
                                error={usernameError !== null}
                                helperText={usernameError}
                                onFocus={handleUsernameTextFieldFocus}
                                onBlur={handleUsernameTextFieldBlur}
                                onChange={(e) => onInputChange(e)}
                                variant="outlined"
                                fullWidth
                                sx={{ marginBottom: { xs: 2, sm: 2, md: 2 }, marginTop: { xs: 2, sm: 2, md: 3 } }}
                                InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <PersonOutlineIcon />
                                      </InputAdornment>
                                    ),
                                }}
                                InputLabelProps={{
                                  shrink: isLabelShrunkUsername,
                                  sx: { ml: isLabelShrunkUsername ? 0 : 6 },
                                }}
                            />
                            <TextField
                                required
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={loginData.password}
                                label="Password"
                                error={passwordError !== null}
                                helperText={passwordError}
                                onFocus={handlePassTextFieldFocus}
                                onBlur={handlePassTextFieldBlur}
                                onChange={(e) => onInputChange(e)}
                                size="small"
                                fullWidth
                                sx={{ marginBottom: { xs: 2, sm: 2, md: 2 } }}
                                InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <LockOutlinedIcon />
                                      </InputAdornment>
                                    ),
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton onClick={handlePasswordShow}>
                                          {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                }}
                                InputLabelProps={{
                                  shrink: isLabelShrunkPass,
                                  sx: { ml: isLabelShrunkPass ? 0 : 6 },
                                }}
                            />
                        </Grid>
                        <Grid container justifyContent="flex-end" alignItems="flex-end">
                            <Link to='/forgot-password' style={{ fontSize: '12px' }}>Forgot Password?</Link>
                        </Grid>
                        <Grid container direction="row" alignItems='center' justifyContent='center' mt={2}>
                            <Box className='loginBtn'>
                                <Button variant="contained" type='submit'>
                                    Login
                                </Button>
                            </Box>
                        </Grid>
                        <Grid container justifyContent="center" alignItems="center" mt={3}>
                            <Typography variant='body2'>
                                Not registered yet? <Link to='/registration'>Create an account</Link>
                            </Typography>
                        </Grid>
                        </Grid>
                    </Stack>      
                </Box>
            </Grid>
        </Grid>
    )
}