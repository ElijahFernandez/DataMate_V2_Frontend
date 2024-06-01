import { Box, Divider, Grid, Stack, Typography, useMediaQuery } from "@mui/material";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WLogo from "../images/DMLogoWhiteNoBG.png";
import { Link } from "react-router-dom";
import LinkXs from '@mui/material/Link';
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";


export default function Footer(){
    
    const isXsScreen = useMediaQuery('(max-width:900px)');
    const flexScreen = useMediaQuery('(max-width:1350px)');
    const flexTwoScreen = useMediaQuery('(max-width:1250px)');
    const isLoggedIn = useSelector((state:RootState) => state.auth.isLoggedIn);

    return(
        <div className='footer gradientbg' style={{ marginTop: "30px" }}>
            <Box justifyContent="center" alignItems="center" sx={{ p: {xs: 2, sm: 2, md: 3} }} className="wrapper-footer">
                {!isXsScreen && (
                    <>
                        <Stack justifyContent= 'center' alignItems= 'center' direction="row">

                            {!flexTwoScreen && (
                                <Grid container direction="column" maxWidth="20%">
                                <Box>
                                    <img src={WLogo} alt="datamate-logo" style={{ width: 281, height: 101 }}></img>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '15px', color: "white", fontWeight: "medium", maxWidth: 300, ml: 2}}>Streamline your data management process.</Typography>
                                </Box>
                            </Grid>
                            )}
                            
                            <Grid container sx={{ ml: flexTwoScreen ? 0 : flexScreen ? 22 : 28, mt: 4, maxHeight: 88 }} justifyContent= 'center' alignItems= 'center'>
                                <Stack direction="row">
                                    <Grid container direction="column" sx={{ mr: flexScreen? 10:13 }}>
                                        <Typography fontWeight='bold' fontFamily="Helvetica" color="white" sx={{ fontSize: '20px', whiteSpace:"nowrap"}}>
                                            Who we are
                                        </Typography>
                                        <Stack direction="row" mt={1}>
                                            <Grid container direction="column">
                                                <Link to="/about-us" style={{ textDecoration: 'none' }}>
                                                    <Typography sx={{ color: "white", fontSize: "15px", lineHeight: 2}}>About</Typography>
                                                </Link>
                                                <Link to="#" style={{ textDecoration: 'none' }}>
                                                    <Typography sx={{ color: "white", fontSize: "15px", lineHeight: 2}}>Culture</Typography> 
                                                </Link>
                                                <Link to="#" style={{ textDecoration: 'none' }}>   
                                                    <Typography sx={{ color: "white", fontSize: "15px"}}>Join Us</Typography>
                                                </Link> 
                                            </Grid>
                                        </Stack>
                                    </Grid>

                                    <Grid container direction="column" sx={{ mr: flexScreen? 10:13 }}>
                                        <Typography fontWeight='bold' fontFamily="Helvetica" color="white" sx={{ fontSize: '20px'}}>
                                            Explore
                                        </Typography>
                                        <Stack direction="row" mt={1}>
                                            <Grid container direction="column">
                                                <Link to="#" style={{ textDecoration: 'none' }}>
                                                    <Typography sx={{ color: "white", fontSize: "15px", lineHeight: 2}}>Blog</Typography>
                                                </Link>
                                                <Link to="#" style={{ textDecoration: 'none' }}>
                                                    <Typography sx={{ color: "white", fontSize: "15px", lineHeight: 2}}>Press</Typography>     
                                                </Link>
                                                <Link to="#" style={{ textDecoration: 'none' }}>
                                                    <Typography sx={{ color: "white", fontSize: "15px"}}>Services</Typography>
                                                </Link>
                                            </Grid>
                                        </Stack>
                                    </Grid>

                                    <Grid container direction="column" sx={{ mr: flexScreen? 12:13 }}>
                                        <Typography fontWeight='bold' fontFamily="Helvetica" color="white" sx={{ fontSize: '20px'}}>
                                            Let's talk
                                        </Typography>
                                        <Stack direction="row" mt={1}>
                                            <Grid container direction="column">
                                            <Typography sx={{ color: "white", fontSize: "15px"}}>
                                                <Link to="tel:+263-2509" color="inherit" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                +263-2509
                                                </Link>
                                            </Typography>
                                                <Typography sx={{ color: "white", fontSize: "15px"}}>
                                                    <Link to="mailto:datamate001@gmail.com" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                        datamate001@gmail.com
                                                    </Link>
                                                </Typography>     
                                            </Grid>
                                        </Stack>
                                    </Grid>

                                    <Grid container direction="column">
                                        <Typography fontWeight='bold' fontFamily="Helvetica" color="white" sx={{ fontSize: '20px', whiteSpace: "nowrap"}}>
                                            Follow us
                                        </Typography>
                                        <Stack direction="row" mt={1}>
                                            <Link to="#" style={{ textDecoration: 'none' }}>
                                                <FacebookIcon sx={{ color: "white", width: 25, height: 25, mr: 2 }}/>
                                            </Link>
                                            <Link to="#" style={{ textDecoration: 'none' }}>
                                                <InstagramIcon sx={{ color: "white", width: 25, height: 25, mr: 2 }}/>
                                            </Link>
                                            <Link to="#" style={{ textDecoration: 'none' }}>
                                                <LinkedInIcon sx={{ color: "white", width: 25, height: 25 }}/>
                                            </Link>
                                        </Stack>
                                    </Grid>

                                </Stack>
                            </Grid>
                        </Stack>
                        <Divider orientation="horizontal" flexItem sx={{ borderBottomWidth: '1px', borderColor: 'white', mt: 8 }} />
                        <Grid container justifyContent= 'center' alignItems= 'center'>
                            <Stack direction="row" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: '1rem' }}>
                                <p style={{ fontSize: 12, color: 'white' }}>© DataMate. 2023. All Rights Reserved.</p>
                                <Link to="#" style={{ color:"white" }}><p style={{ fontSize: 12, color: 'white', marginLeft: 15 }}> Privacy Policy</p></Link>
                                <Link to="#" style={{ color:"white" }}><p style={{ fontSize: 12, color: 'white', marginLeft: 15 }}> Terms of Service</p></Link>
                            </Stack>
                        </Grid>
                    </>
                )}

                {isXsScreen &&(
                    <>
                        <Stack direction="column" justifyContent= 'center' alignItems= 'center'>
                            <Box maxHeight={50}>
                                <img src={WLogo} alt="datamate-logo" style={{ width: 181, height: 61 }}></img>
                            </Box>
                            {/* {isLoggedIn &&( */}
                                <Stack direction="row" mt={2}>
                                    <LinkXs href="/about-us" underline="hover" style={{ color:"white" }}><Typography sx={{ color: "white", fontSize: "15px", fontWeight: "medium", mr: 4}}>About</Typography></LinkXs>
                                    <LinkXs href="_blank" underline="hover" style={{ color:"white" }}><Typography sx={{ color: "white", fontSize: "15px", fontWeight: "medium", mr: 4}}>Explore</Typography></LinkXs>
                                    <LinkXs href="_blank" underline="hover" style={{ color:"white" }}><Typography sx={{ color: "white", fontSize: "15px", fontWeight: "medium", mr: 4}}>Let's Talk</Typography></LinkXs>
                                    <LinkXs href="_blank" underline="hover" style={{ color:"white" }}><Typography sx={{ color: "white", fontSize: "15px", fontWeight: "medium"}}>Follow Us</Typography></LinkXs>
                                </Stack>
                            {/* )} */}
                        </Stack>
                        <Divider orientation="horizontal" flexItem sx={{ borderBottomWidth: '1px', borderColor: 'white', mt: 2 }} />
                        <Grid container justifyContent= 'center' alignItems= 'center'>
                            <Stack direction="row" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: '1rem' }}>
                                <p style={{ fontSize: 12, color: 'white' }}>© DataMate. 2023. All Rights Reserved.</p>
                                <Link to="#" style={{ color:"white" }}><p style={{ fontSize: 12, color: 'white', marginLeft: 15 }}> Privacy Policy</p></Link>
                                <Link to="#" style={{ color:"white" }}><p style={{ fontSize: 12, color: 'white', marginLeft: 15 }}> Terms of Service</p></Link>
                            </Stack>
                        </Grid>
                    </>
                )}
            </Box>
        </div>
    )

}