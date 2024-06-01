import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, Container, Divider, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { ChangeEvent, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopbarInit from './TopbarInit';
import UserService from '../api/UserService';
import { SnackbarContext, SnackbarContextType } from '../helpers/SnackbarContext';

type RegisterProps = {
    startLoading: () => void,
    stopLoading: () => void,
}

export default function Registration({startLoading, stopLoading}: RegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // const [businessType, setBusinessType] = React.useState('');
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [passwordLengthError, setPasswordLengthError] = useState(false);
    const confirmPasswordRef = React.useRef<HTMLInputElement | null>(null);
    const passwordRef = React.useRef<HTMLInputElement | null>(null);
    const [usernameExists, setUsernameExists] = useState(false);
    const navigate = useNavigate();
    const formats = ["jpg", "jpeg", "png", "bmp", "gif", "tiff"];
    const { handleSetMessage } = useContext(SnackbarContext) as SnackbarContextType;

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

    const [userImage, setUserImage] = useState<File | null>(null);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData({ ...data, [event.target.name]: event.target.value });
        console.log(event.target.name)
    };

    const handlePasswordShow = () => {
        setShowPassword(!showPassword);
    }

    const handleConfirmPasswordShow = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    const handleSelectChange = (event: SelectChangeEvent) => {
        setData({ ...data, [event.target.name]: event.target.value });
        console.log(event.target.name)
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const password = event.target.value;
        const confirmPassword = confirmPasswordRef.current?.value;
        setData({ ...data, [event.target.name]: event.target.value });
        console.log(event.target.name)

        // check password length
        if (password.length < 8) {
            setPasswordLengthError(true);
        } else {
            setPasswordLengthError(false);
        }
        
        // check if passwords match
        if (confirmPassword && password !== confirmPassword) {
            setPasswordMatchError(true);
        } else {
            setPasswordMatchError(false);
        }
    };

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const confirmPassword = event.target.value;
        const password = passwordRef.current?.value;
        
        if (password !== confirmPassword) {
            setPasswordMatchError(true);
        } else {
            setPasswordMatchError(false);
        }
    };

    // const handleFileChange = (e: any) => {
    //     console.log(e.target.files[0])
    //     setUserImage(e.target.files[0])
    // };

    const handleFileChange = (e: any) => {
        const selectedFile = e.target.files[0];
    
        if (selectedFile) {
            const isImage = selectedFile.type.startsWith('image/') && formats.some((format) =>
            selectedFile.name.toLowerCase().endsWith(format.toLowerCase())
          )
            
    
            if (isImage) {
                const reader = new FileReader();
    
                reader.onloadend = () => {
                    if (reader.result && typeof reader.result === 'string') {
                        setUserImage(selectedFile);
                    }
                };
    
                reader.readAsDataURL(selectedFile);
            } else {
                alert('Please upload an image file only.');
                setUserImage(null);
                if (e.target instanceof HTMLInputElement) {
                    e.target.value = '';
                }
            }
        } else {
            setUserImage(null);
        }
    };
    

    const [emailError, setEmailError] = useState(false);

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const email = e.target.value;
        setData({ ...data, email });

        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        const isEmailValid = emailRegex.test(email);
        setEmailError(!isEmailValid);
    };

    const postUser = async (event: { preventDefault: () => void; }) =>{
        event.preventDefault();

        const containsOnlySpaces = Object.values(data).some((value) => value.trim() === '');

        if (containsOnlySpaces || passwordMatchError || passwordLengthError || emailError) {
            if (containsOnlySpaces) {
                alert('Please fill in all fields. DataMate does not accept spaces-only entries.');
            }
            return;
        }
        
        const formData = new FormData();
        formData.append("user", new Blob([JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            address: data.address,
            username: data.username,
            password: data.password,
            businessName: data.businessName,
            businessType: data.businessType,
        })], {type: 'application/json'}));
        if (userImage !== null) {
            formData.append("userImage", userImage);
    
            const isImage = userImage.type.startsWith('image/');
            if (!isImage) {
                alert('Please upload an image file only.');
                return;
            }
        }
        console.log(formData)
        console.log(formData.keys())
        startLoading();
        UserService.postUser(formData)
        .then((res:any)=> {
            console.log('Posting Data')
            stopLoading();
            navigate("/login")
        })
        .catch((err:string) => console.log(err))

    }

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


    return (
        <Grid container className='gradientbg edit-spacing' justifyContent="center" alignItems="center" sx={{ width: '100%', height: '100%'}}>
            {/* <TopbarInit/> */}
            <Grid component="form" encType="multipart/form-data" onSubmit={postUser}>
                <Grid container justifyContent="center" alignItems="center" sx={{ width: '100%', height: '100vh', mt: 5, mb: 11 }}>
                    <Box sx={{ mt: {xs: '100%', sm:'10%', md: '6%'}, backgroundColor: 'white', margin: {xs: '30px'}, p: {xs: '35px', sm: '40px', md: '40px'}, borderRadius: '20px', boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)' }}> 
                        <Container> 
                            <Typography variant="h4" fontWeight="bold" color='#374248'>
                                Register
                            </Typography>            
                            <Stack direction={{ xs: 'column', sm: 'row', md: 'row' }} justifyContent="center" alignItems="center" mt={3}>
                                <TextField
                                    size="small"
                                    required 
                                    name="firstName"
                                    label="First Name"
                                    variant="outlined"
                                    value={data.firstName}
                                    onChange={handleChange}
                                    sx={{ marginBottom: { xs: 2, sm: 2, md: 2 }, marginRight: { sm: 2, md: 2 }, width: '100%' }}
                                />
                                <TextField
                                    size="small"
                                    required 
                                    name="lastName"
                                    label="Last Name"
                                    variant="outlined"
                                    value={data.lastName}
                                    onChange={handleChange}
                                    sx={{ marginBottom: { xs: 2, sm: 2, md: 2 }, width: '100%' }}
                                />
                            </Stack>
                            <Grid container direction="column" justifyContent="center" alignItems="center">
                                <TextField
                                    size="small"
                                    required 
                                    name="email"
                                    label="Email"
                                    variant="outlined"
                                    value={data.email}
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
                                    value={data.address}
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
                                    value={data.username}
                                    onChange={handleUsernameChange}
                                    fullWidth
                                    sx={{ marginBottom: { xs: 2, sm: 2, md: 2 } }}
                                />
                                 {usernameExists && (
                                    <Typography variant="caption" color="error" sx={{mb: 1, mt: -1}}>
                                        Username is already taken.
                                    </Typography>
                                )}
                                <Stack direction={{ xs: 'column', sm: 'row', md: 'row' }} justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
                                    <TextField
                                        required
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        label="Password"
                                        onChange={handlePasswordChange}
                                        inputRef={passwordRef}
                                        size="small"
                                        fullWidth
                                        sx={{ marginBottom: { xs: 2, sm: 2, md: 2 }, marginRight: { sm: 2, md: 2 } }}
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
                                    <TextField
                                        required
                                        name="confirmpassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        label="Confirm Password"
                                        onChange={handleConfirmPasswordChange}
                                        inputRef={confirmPasswordRef}
                                        size="small"
                                        fullWidth
                                        sx={{ marginBottom: { xs: 2, sm: 2, md: 2 } }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={handleConfirmPasswordShow}>
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Stack>
                                {passwordMatchError && (
                                    <Typography variant="caption" color="error" sx={{mb: 1, mt: -1}}>
                                        Passwords do not match.
                                    </Typography>
                                )}
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
                                    value={data.businessName}
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
                                    value={data.businessType}
                                    label="Business Type"
                                    onChange={handleSelectChange}
                                    size='small'
                                    required
                                    >
                                        <MenuItem value={'Food & Beverages'}>Food & Beverages</MenuItem>
                                        <MenuItem value={'Retail'}>Retail</MenuItem>
                                        <MenuItem value={'Manufacturing'}>Manufacturing</MenuItem>
                                        <MenuItem value={'Service-based'}>Service-based</MenuItem>
                                        <MenuItem value='Others'>Others</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid container>
                                <Typography variant="caption" mt={2}>
                                    Upload profile picture
                                </Typography>
                                <TextField
                                    type="file"
                                    variant="outlined"
                                    size='small'
                                    onChange={handleFileChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ backgroundColor: 'transparent' }}
                                />
                            </Grid>
                        
                            <Grid container direction="row" alignItems='center' justifyContent='center'>
                                <Box className='saveBtn'>
                                    <Button variant="contained" type="submit">
                                        Register
                                    </Button>
                                </Box>
                            </Grid>

                            <Grid container justifyContent="center" sx={{margin: '20px 0px 10px 0px'}}>
                                <Typography variant='body2'>
                                    Already have an account? <Link to='/login'>Login</Link>
                                </Typography>
                            </Grid>
                        </Container>
                    </Box>
                
                </Grid>
            </Grid>
        </Grid>
    );
}
