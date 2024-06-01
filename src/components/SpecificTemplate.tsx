import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Dialog, DialogContent, Grid, IconButton, ImageList, ImageListItem, Modal, Stack } from '@mui/material';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import SalesTemp from '../images/salestemplate.png';
import DownloadOpen from '../images/download.png';
import NavigateImg from '../images/navigate.png';
import InputImg from '../images/input.png';
import LocateDownload from '../images/downloadb.png';
import SalesColumns from '../images/excolumns.png';
import EnableEdit from '../images/enableedit.png';
import DateValid from '../images/datecheck.png';
import DateInvalid from '../images/dateinvalid.png';
import CustNameGuide from '../images/nameguide.png';
import ProductGuide from '../images/productguide.png';
import QuantityInvalidDecimal from '../images/quantityinvalid1.png';
import QuantityInvalidText from '../images/quantityinvalid2.png';
import UnitGuideInvalid from '../images/unitinvalid.png';
import UnitGuideValid from '../images/unitcheck.png';
import TotalSalesGuide from '../images/totalsales.png';
import StatusGuide from '../images/status.png';
import axios from 'axios';
import { useState } from 'react';
import Navbar from './Navbar';
import Topbar from './Topbar';


export default function SpecificTemplate(){

    const [open, setOpen] = React.useState(false);

    const handleImageClick = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const downloadFile = async () =>{
      axios({
          // url: "https://datamate-api.onrender.com/downloadTemplate/1",
          url: "http://localhost:8080/downloadTemplate/1",
          method: 'GET',
          responseType: 'arraybuffer', 
      }).then(async (response) => {
          const blobData :Blob = new Blob([response.data], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml;charset=UTF-8"});
          const href = URL.createObjectURL(blobData);
      
          // create "a" HTML element with href to file & click
          const link = document.createElement('a');
          link.href = href;
          link.setAttribute('download', 'SalesReportTemplate.xltx'); //or any other extension
          document.body.appendChild(link);
          link.click();
      
          // clean up "a" element & remove ObjectURL
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
      });
    }

    return(
      <Grid>
        <Grid className="gradientbg" mt={5}>
          <Grid container direction="row" justifyContent="space-between" sx={{p: {xs: '40px 60px 20px 60px', sm: '40px 60px 20px 60px', md: '40px 60px 20px 60px'} }}>  
            <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: {xs: '20px', sm: '25px', md: '32px'}, mt: {xs: 1.3, md: .2}}}>
              Sales Report Template
            </Typography>
            <IconButton onClick={downloadFile}>
              <DownloadForOfflineIcon sx={{ color: 'white', width: {xs: '30px', sm: '35px', md: '40px'}, height: {xs: '30px', sm: '35px', md: '40px'} }} />
            </IconButton>
          </Grid>
        </Grid>

        <Grid container justifyContent="center" alignItems="center">
          <Box sx={{ m: {xs: 5, sm: 8, md: 10}, maxWidth: 842, height: {xs: 200, sm: 300, md: 400}}}>
            <img
              src={SalesTemp}
              style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
              onClick={handleImageClick}
            />
          </Box>
          <Typography sx={{ px:{xs: 2, sm: 5, md: 8}, textAlign: 'justify'}}>
            The Sales Report Template is a fixed template that is designed to empower businesses in efficiently tracking and analyzing their sales data. Whether you're a small business owner, a sales manager, or a beginner in sales analysis, this template provides a structured and user-friendly solution that helps you gain valuable insights into your sales performance. 
            By utilizing the Sales Report Template, you can effortlessly record and organize essential information about customer transactions. The template's predefined columns serve specific purposes, capturing key data points such as the date of the sales transaction, customer names, product details, quantity sold, unit price, total sales, and payment status. 
          </Typography>

          <Grid container sx={{ my: {xs: 4, sm: 5, md: 8}, mx: {xs: 0, sm: 2, md: 3} }}>
            <Typography fontWeight="bold" sx={{ ml: '2rem', fontSize: {xs: '25px', sm: '32px', md: '40px'} }}>Guide</Typography>
          </Grid>

          <Grid container>
            <Grid container>
              {/* FirstPart-Guide */}
              <Accordion sx={{px: {xs: 2, sm: 2, md: 5}, width: '100%'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <img src={DownloadOpen} style={{width: 80, height: 80, marginTop: '1rem', marginBottom: '1rem'}}/>
                  <Typography sx={{fontSize: '25px', marginLeft: '8rem', marginTop: '2.5rem'}}>Downloading and Opening the Spreadsheet</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem' }}>
                    The Sales Report Template is designed to help you track and analyze sales data effectively. It provides predefined columns with specific purposes, allowing you to input relevant information about customer transactions.
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem' }}>
                    <ol type='a'>
                      <li>To download the Sales Report Template XLSX file, simply click on the download button below.<br/></li>
                      <li>After downloading, locate the file on your local disk and double-click to open it.</li>
                    </ol>
                    <img src={LocateDownload} style={{ width: '100%', height: 'auto', marginLeft: 'auto', marginTop: '1rem', marginBottom: '1rem', display: 'block', marginRight: 'auto' }} />
                    <ol start={3} type='a'>
                      <li>Depending on your computer's settings, the file may open directly in your default spreadsheet software (e.g., Microsoft Excel, Google Sheets, etc.) or prompt you to choose the software to open it with.</li>
                      <li>Once the file is opened, you may see a security warning or notification at the top of the file preview. This is a necessary action to ensure full functionality and enable editing capabilities.</li>
                      <li>To proceed, click on the "Enable Editing" button or a similar option, as it allows you to make changes and input the necessary data.</li>
                    </ol> 
                    <img src={EnableEdit} style={{ width: '100%', height: 'auto', marginLeft: 'auto', marginTop: '1rem', marginBottom: '1rem', display: 'block', marginRight: 'auto' }} /> <br/>
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', fontStyle:'italic' }}>
                    Note: The Sales Report Template is a fixed template, which means certain columns and rows have predefined purposes and formats. You can modify specific sections of the template while adhering to the provided guidelines.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
            
            <Grid container>
              {/* SecondPart-Guide */}
              <Accordion sx={{px: {xs: 2, sm: 2, md: 5}, width: '100%'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <img src={NavigateImg} style={{width: 80, height: 80, marginTop: '1rem', marginBottom: '1rem'}}/>
                  <Typography sx={{fontSize: '25px', marginLeft: '8rem', marginTop: '2.5rem'}}>Navigating the Spreadsheet</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem'}}>
                    The Sales Report Template consists of multiple columns representing different aspects of the sales report.
                    The fixed columns in the template include: 
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Date:</strong> This column is specifically designated for inputting the date of the sales transaction. It helps track when each transaction occurs.</li>
                      <li><strong>Customer Name:</strong> In this column, you should enter the name of the customer associated with the sale. This allows you to identify the individuals or organizations involved in each transaction.</li>
                      <li><strong>Product:</strong> The purpose of this column is to specify the name or description of the product sold. It helps in identifying the specific items or services being transacted.</li>
                      <li><strong>Quantity Sold:</strong> This column requires you to enter the quantity of the product sold. It helps determine the number of units or items involved in each transaction.</li>
                      <li><strong>Unit Price:</strong> Here, you should provide the unit price of the product. This column assists in calculating the total cost of the products sold.</li>
                      <li><strong>Total Sales:</strong> This column is automatically calculated by multiplying the Quantity Sold with the Unit Price. It shows the total amount of sales generated for each transaction.</li>
                      <li><strong>Payment Status:</strong> This column is used to indicate whether the payment for a particular transaction has been received or not. You can choose between "True" or "False" to reflect the payment status accurately.</li>
                    </ol>
                    <img src={SalesColumns} style={{width: '100%', height: 'auto', marginTop: '1rem', marginBottom: '1rem'}}/>
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', fontStyle:'italic' }}>
                    Note: The first row, which contains the column titles, is fixed and cannot be edited. It serves as a reference for understanding the purpose of each column and maintaining consistency throughout the spreadsheet. 
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid container>
              {/* ThirdPart-Guide */}
              <Accordion sx={{px: {xs: 2, sm: 2, md: 5}, width: '100%'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel3a-content"
                  id="panel3a-header"
                >
                  <img src={InputImg} style={{width: 80, height: 80, marginTop: '1rem', marginBottom: '1rem'}}/>
                  <Typography sx={{fontSize: '25px', marginLeft: '8rem', marginTop: '2.5rem'}}>Data Input</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem'}}>
                    When inputting data into the Sales Report Template, it is important to follow the necessary restrictions and guidelines for each column: 
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Date:</strong> Enter a valid date format (e.g., DD/MM/YYYY or MM/DD/YYYY). If the format is invalid, the template will prompt you to make the necessary corrections.</li><br/>
                      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <div className="image-overlay-container">
                          <img src={DateValid} alt="Date Valid" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Valid date format</Typography>
                          </div>
                        </div>
                        <div className="image-overlay-container">
                          <img src={DateInvalid} alt="Date Invalid" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Invalid date format</Typography>
                          </div>
                        </div>
                      </Stack>
                      
                      <li><strong>Customer Name:</strong> Use alphabetic characters to enter the name of the customer associated with the sale.</li><br/>        
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={CustNameGuide} style={{ width: '100%', height: 'auto' }} alt="Customer Name - Guide" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Input for name should be less than or equal to 50 characters. </Typography>
                          </div>
                        </div>
                      </Box> <br/><br/>

                      <li><strong>Product:</strong> Provide the name or description of the product being sold. Use a string value to accurately describe the item.</li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={ProductGuide} style={{ width: '100%', height: 'auto' }} alt="Product - Guide" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Input for product should be less than or equal to 50 characters. </Typography>
                          </div>
                        </div>
                      </Box> <br/><br/>

                      <li><strong>Quantity Sold:</strong> Input the quantity of the product sold as a whole number or integer. Decimal values or non-numeric characters will be considered invalid.</li><br/>
                      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <div className="image-overlay-container">
                          <img src={QuantityInvalidDecimal} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Decimal numbers are not allowed.</Typography>
                          </div>
                        </div>
                        <div className="image-overlay-container">
                          <img src={QuantityInvalidText} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 2" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Text/String input is not allowed.</Typography>
                          </div>
                        </div>
                      </Stack> <br/><br/>

                      <li><strong>Unit Price:</strong> Enter the unit price of the product as a decimal number or integer. Avoid using non-numeric characters or symbols that are not relevant to pricing.</li><br/>
                      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <div className="image-overlay-container">
                          <img src={UnitGuideInvalid} style={{ width: '100%', height: 'auto' }} alt="Unit Price - Invalid" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Notifies for typos in Unit Price column</Typography>
                          </div>
                        </div>
                        <div className="image-overlay-container">
                          <img src={UnitGuideValid} style={{ width: '100%', height: 'auto' }} alt="Unit Price - Guide" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Valid format</Typography>
                          </div>
                        </div>
                      </Stack> <br/><br/>
                      
                      <li><strong>Total Sales:</strong> This column is automatically calculated by multiplying the Quantity Sold with the Unit Price. You don't need to manually enter any data in this column.</li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={TotalSalesGuide} style={{ width: '100%', height: 'auto' }} alt="Total Sales - Guide" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Get the total sales automatically</Typography>
                          </div>
                        </div>
                      </Box> <br/><br/>
                      
                      <li><strong>Payment Status:</strong> Simply choose either "True" or "False" from the available options to indicate whether the payment has been received. There is no need to manually input any values 
                        in this column, as you can select the appropriate option directly. Please ensure that you choose one of these exact values to avoid any potential errors.
                      </li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={StatusGuide} style={{ width: '100%', height: 'auto' }} alt="Payment Status - Guide" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Easily choose the appropriate option</Typography>
                          </div>
                        </div>
                      </Box> <br/><br/>
                    </ol>
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', fontStyle:'italic' }}>
                    Note: If you enter invalid data or violate the specified restrictions in any column, the template will alert you and prompt you to correct the input before proceeding. It is essential to review your entries and ensure they align with the provided guidelines to maintain data accuracy.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          <Box className='templateDownloadBtn'>
            <Button onClick={downloadFile} 
            variant="contained" sx={{fontWeight: 'bold', backgroundColor: '#71C887', color:'white',  borderRadius: 50, paddingInline: 4}}>DOWNLOAD</Button>
          </Box>

          <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogContent>
              <img src={SalesTemp} style={{ width: '100%', height: 'auto' }} />
            </DialogContent>
          </Dialog>
        </Grid>   
      </Grid>
    )


}