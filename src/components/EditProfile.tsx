import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, CircularProgress, Container, Divider, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../api/UserService';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../helpers/Store';
import Topbar from './Topbar';
import Navbar from './Navbar';
import CryptoJS from 'crypto-js';

export default function EditProfile() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const userId = useSelector((state: RootState) => state.auth.userId);
    const [passwordLengthError, setPasswordLengthError] = useState(false);
    const [usernameExists, setUsernameExists] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const canSave = !passwordLengthError;

    const [data, setData]= useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        username: "",
        password: "",
        businessName: "",
        businessType: "",
    })

    const handlePasswordShow = () => {
        setShowPassword(!showPassword);
    }

    const { firstName, lastName, email, address, username, password, businessName, businessType } = data;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (event: SelectChangeEvent) => {
        setData({ ...data, [event.target.name]: event.target.value });
    }

    const handleCancelClick = () => {
        navigate("/profile");
    }

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const password = event.target.value;
        setData({ ...data, [event.target.name]: event.target.value });
        console.log(event.target.name)

        // check password length
        if (password.length < 8) {
            setPasswordLengthError(true);
        } else {
            setPasswordLengthError(false);
        }
        
    };

    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setData({ ...data, [name]: value });
        console.log(name);
        
        if (name === "username") {
            checkUsernameAvailability(value);
        }
    };

    const checkUsernameAvailability = (username: any) => {
        UserService.getUserByUsername(username)
            .then((response) => {
                setUsernameExists(response.data.exists || response.data.userExists);
            })
            .catch((error) => {
                console.error("Error checking username availability:", error);
            });
    };

    useEffect(() => {
        if(data.firstName === ""){
          setLoading(true);  
        }
        const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';
        const decryptedUserId = CryptoJS.AES.decrypt(userId, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    
        if (decryptedUserId) {
          UserService.getUserById(decryptedUserId)
            .then((response) => {
              setData(response.data);
              setLoading(false);
            })
            .catch((error) => {
              console.error('Error fetching user data:', error);
            });
        }
      }, [userId]);

    const putUser = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()

        const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';
        const decryptedUserId = CryptoJS.AES.decrypt(userId, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

        if (passwordLengthError) {
            return;
        }

        await axios.put(`https://datamate-api.onrender.com/user/putUser?userId=${decryptedUserId}`,{
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            address: data.address,
            username: data.username,
            password: data.password,
            businessName: data.businessName,
            businessType: data.businessType,
        })
        .then((res)=> {
            console.log('Success! Editing Data'); 
            console.log(res); 
            navigate("/profile");
        })
        .catch((err:string) => console.log(err))
    }

    const [open, setOpen] = useState(false);
    const toggleDrawerOpen = () => {
        setOpen(!open);
    };

    const [emailError, setEmailError] = useState(false);

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const email = e.target.value;
        setData({ ...data, email });

        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        const isEmailValid = emailRegex.test(email);
        setEmailError(!isEmailValid);
    };


    return (
        <div className='gradientbg edit-spacing' style={{ width: '100%', height: '100vh'}}>
            <Modal open={open} onClose={toggleDrawerOpen}>
                <Navbar open={open} handleDrawerClose={toggleDrawerOpen} />
            </Modal>
            <Topbar open={open} handleDrawerOpen={toggleDrawerOpen} />
            <Grid component="form" onSubmit={putUser}>
                <Grid container justifyContent="center" alignItems="center" mt={4.5}>
                    { isLoading?
                    <Box height="100vh" justifyContent="center" alignItems="center" mt={35}>
                        <CircularProgress size="6rem" color="success" />
                    </Box>:    
                    <Box sx={{ backgroundColor: 'white', margin: {xs: '30px'}, padding: {xs: '25px 30px 25px 30px', md: '25px 35px 25px 35px'}, borderRadius: '20px', boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)' }}>
                        <Stack direction='column' divider={<Divider orientation="horizontal" flexItem sx={{ borderBottomWidth: '2px', borderColor: '#374248' }} />} spacing={2}>
                            <Typography variant="h6" fontWeight="bold">
                                User Profile
                            </Typography>
                            <Container>
                                <Grid container direction={{ xs: 'column', sm: 'row', md: 'row' }} justifyContent="center" alignItems="center" sx={{ marginTop: '10px'}}>
                                    <TextField
                                        size="small"
                                        required 
                                        name="firstName"
                                        label="First Name"
                                        variant="outlined"
                                        value={firstName}
                                        onChange={handleChange}
                                        sx={{ marginBottom: { xs: 2, sm: 2, md: 2 }, marginRight: { md: 2 }, width: { xs: '100%', sm: '100%', md: 'auto' } }}
                                    />
                                    <TextField
                                        size="small"
                                        required 
                                        name="lastName"
                                        label="Last Name"
                                        variant="outlined"
                                        value={lastName}
                                        onChange={handleChange}
                                        sx={{ marginBottom: { xs: 2, sm: 2, md: 2 }, width: { xs: '100%', sm: '100%', md: 'auto' } }}
                                    />
                                </Grid>
                                <Grid container direction="column" justifyContent="center" alignItems="center">
                                    <TextField
                                        size="small"
                                        required 
                                        name="email"
                                        label="Email"
                                        variant="outlined"
                                        value={email}
                                        onChange={handleEmailChange}
                                        fullWidth
                                        sx={{ marginBottom: { xs: 2, sm: 2, md: 2 } }}
                                    />
                                    {emailError && (
                                        <Typography variant="caption" color="error" sx={{mb: 1, mt: -1}}>
                                            Please enter a valid email address.
                                        </Typography>
                                    )}
                                    <TextField
                                        size="small"
                                        required 
                                        name="address"
                                        label="Address"
                                        variant="outlined"
                                        value={address}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={{ marginBottom: { xs: 2, sm: 2, md: 2 } }}
                                    />
                                    <TextField
                                        size="small"
                                        required 
                                        name="username"
                                        label="Username"
                                        variant="outlined"
                                        value={username}
                                        onChange={handleUsernameChange}
                                        fullWidth
                                        sx={{ marginBottom: { xs: 2, sm: 2, md: 2 } }}
                                    />
                                    {usernameExists && (
                                        <Typography variant="caption" color="error" sx={{mb: 1, mt: -1}}>
                                            Username is already taken.
                                        </Typography>
                                    )}
                                    <TextField
                                        required
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        label="Password"
                                        size="small"
                                        onChange={handlePasswordChange}
                                        fullWidth
                                        sx={{ marginBottom: { xs: 2, sm: 2, md: 2 } }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={handlePasswordShow}>
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    {passwordLengthError && (
                                        <Typography variant="caption" color="error" sx={{mb: 1, mt: -1}}>
                                            Your password should not be less than 8 characters.
                                        </Typography>
                                    )}
                                    <TextField
                                        size="small"
                                        required 
                                        name="businessName"
                                        label="Business Name"
                                        variant="outlined"
                                        value={businessName}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={{ marginBottom: { xs: 2, sm: 2, md: 2 } }}
                                    />
                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label" size='small'>Business Type</InputLabel>
                                        <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        name='businessType'
                                        value={businessType}
                                        label="Business Type"
                                        onChange={handleSelectChange}
                                        size='small'
                                        >
                                        <MenuItem value={'Food & Beverages'}>Food & Beverages</MenuItem>
                                        <MenuItem value={'Retail'}>Retail</MenuItem>
                                        <MenuItem value={'Manufacturing'}>Manufacturing</MenuItem>
                                        <MenuItem value={'Service-based'}>Service-based</MenuItem>
                                        <MenuItem value={'Others'}>Others</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid container direction="row" alignItems={{ xs: 'center', sm: 'flex-end', md: 'flex-end' }} justifyContent={{ xs: 'center', sm: 'flex-end', md: 'flex-end' }} marginBottom='6px'>
                                    <Box className='cancelBtn' sx={{display: 'flex', justifyContent: 'center'}}>
                                        <Button variant="contained" onClick={handleCancelClick}>
                                            Cancel
                                        </Button>
                                    </Box>
                                    <Box className='saveBtn' sx={{display: 'flex', justifyContent: 'center', marginLeft: { xs: 1, sm: 1, md: 2 }}}>
                                        <Button variant="contained" type="submit" disabled={!canSave}>
                                            Save
                                        </Button>
                                    </Box>
                                </Grid>
                            </Container>
                        </Stack>
                    </Box>}
                
                </Grid>
            </Grid>
        </div>
    );
}
