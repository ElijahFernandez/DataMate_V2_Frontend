import * as React from 'react';
import { Box, Button, Modal, Stack, Typography, Zoom } from "@mui/material"
import GirlImg from '../images/girl.png';
import DownArrow from '../images/downarrow.png';
import TemplateInstructions from '../images/instructions_one.gif';
import UploadInstructions from '../images/instructions_two.gif';
import NumOneIcon from '../images/onenum.png';
import NumTwoIcon from '../images/twonum.png';
import NumThreeIcon from '../images/threenum.png';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../helpers/Store';
import Footer from './Footer';

type HomeProps = {
    toggleImport: () => void,
}

export default function Home({toggleImport}:HomeProps){
    const [importFile, setImportFile] = React.useState(false);
    const nav = useNavigate();
    const isLoggedIn = useSelector((state:RootState) => state.auth.isLoggedIn);
  
    const helpSectionRef = React.useRef<HTMLDivElement | null>(null);
    const handleGetStartedClick = () => {
        const yOffset = -70; 
        const element = document.getElementById('helpstart');
        const y = element!.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({top: y, behavior: 'smooth'});
        if (helpSectionRef.current) {
            helpSectionRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    };

    const handleTemplatesClick =()=>{
        if(isLoggedIn) {
            nav('/templates')
        }else{
            nav('/login')
        }
    }
    
    const [isHovered, setIsHovered] = React.useState(false);

    return(
        <Box mt={6}>
            <section className='gradientbg hero-banner'>
                <Box className='wrapper'>
                    <Box>
                        <h1 className='h1-container'>Streamline Your<br></br>Data Management</h1>
                        <p className='subheading1'>Download templates or import your <br></br>spreadsheet today!</p>
                        <Box className='btnstyle'>
                            <Button onClick={handleGetStartedClick} variant="contained" type="submit">
                                GET STARTED
                                <img src={DownArrow} className="button-vector"/>
                            </Button>
                        </Box>
                    </Box>

                    <Box className='img-banner'>
                        <img className='float-image' src={GirlImg}/>
                    </Box>
                </Box>
                
            </section>

            <section id="helpstart">
                <Box sx={{ my: {xs: 3, sm: 5, md: 7} }}>
                    <div className='wrapper'>
                        <h2 className='h2-style' >How can we help you?</h2>
                        <p className='pHome-style'>Get more done in less time with our downloadable templates - Boost Your Productivity Now!</p>
                    </div>
                </Box>

                <div className='template-content-holder'>
                    <div className='wrapper-template'>
                        <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Box className='template-gif-container'>
                                <img className='template-gif' src={TemplateInstructions}/>
                            </Box>
                            <Stack>
                                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} className={`ins-alignment hover-style`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <img className='num-style-temp' src={NumOneIcon}/>
                                    <p className='temp-text-style'>Select a template provided by our app</p>      
                                </Stack>
                                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} className={`ins-alignment hover-style`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <img className='num-style-temp' src={NumTwoIcon}/>
                                    <p className='temp-text-style'>Download a template</p>      
                                </Stack>
                                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} className={`ins-alignment hover-style`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <img className='num-style-temp' src={NumThreeIcon}/>
                                    <p className='temp-text-style'>Use the template in creating your data</p>      
                                </Stack>
                            </Stack>
                        </Stack>
                    </div>
                </div>
                <Box className='templateBtn' sx={{display: 'flex', justifyContent: 'center'}}>
                    <Button onClick={handleTemplatesClick} variant="contained">
                        GO TO TEMPLATES
                    </Button>
                </Box>

                <div className='wrapper'>
                    <p className='import-intro'>Already have an existing spreadsheet? We can clean it or turn it to a database.</p>
                </div>
                   
                <div className='upload-content-holder'>
                    <div className='wrapper-upload'>
                        <Stack direction={{ xs: 'column', sm: 'column', md: 'row-reverse' }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Box className='import-gif-container'>
                                <img className='import-gif' src={UploadInstructions}/>
                            </Box>
                            <Stack>
                                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} className={`ins-alignment hover-style`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <img className='num-style-imp' src={NumOneIcon}/>
                                    <p className='up-text-style'>Import a spreadsheet file from your computer</p>      
                                </Stack>
                                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} className={`ins-alignment hover-style`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <img className='num-style-imp' src={NumTwoIcon}/>
                                    <p className='up-text-style'>Our app will restructure your sheet</p>      
                                </Stack>
                                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} className={`ins-alignment hover-style`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <img className='num-style-imp' src={NumThreeIcon}/>
                                    <p className='up-text-style'>Convert spreadsheet into a database or download it</p>      
                                </Stack>
                            </Stack>
                        </Stack>
                    </div>
                </div>
                
                <Box className='importBtn templateBtn' sx={{display: 'flex', justifyContent: 'center'}}>
                     <Button  onClick={isLoggedIn ? toggleImport : () => nav('/login')} variant="contained">IMPORT SPREADSHEET</Button>
                </Box>

                {/* Here lies increment DataMate_V2 */}

                {/* <div className='wrapper-title'>
                    <p className='import-intro'>Want to embed customized forms in your website? We can generate one just for you.</p>
                </div>

                <div className='wrapper-form'>
                    <p className='import-intro'></p>
                </div>

                <div className='template-content-holder-form'>
                    <div className='wrapper-template'>
                        <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Box className='template-gif-container'>
                                <img className='template-gif' src={TemplateInstructions}/>
                            </Box>
                            <Stack>
                                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} className={`ins-alignment hover-style`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <img className='num-style-temp' src={NumOneIcon}/>
                                    <p className='temp-text-style'>Select a database from the app</p>      
                                </Stack>
                                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} className={`ins-alignment hover-style`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <img className='num-style-temp' src={NumTwoIcon}/>
                                    <p className='temp-text-style'>Our app will generate embed forms for you</p>      
                                </Stack>
                                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} className={`ins-alignment hover-style`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <img className='num-style-temp' src={NumThreeIcon}/>
                                    <p className='temp-text-style'>Copy the embedded code and paste it in your website!</p>      
                                </Stack>
                            </Stack>
                        </Stack>
                    </div>
                </div>
                <Box className='importBtn templateBtn' sx={{display: 'flex', justifyContent: 'center'}}>
                     <Button onClick={isLoggedIn ? () => nav('/generateforms') : () => nav('/login')} variant="contained">CHOOSE A DATABASE</Button>
                </Box> */}


            </section>

            <section style={{ marginTop: 10 }}>
                <Footer/>
            </section>
        </Box> 
    )
}