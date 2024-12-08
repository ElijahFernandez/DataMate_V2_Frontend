import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Dialog, DialogContent, Grid, IconButton, ImageList, ImageListItem, Modal, Stack } from '@mui/material';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import DownloadOpen from '../images/download.png';
import NavigateImg from '../images/navigate.png';
import InputImg from '../images/input.png';
import VendorEnableEdit from '../images/vendorEnableEdit.png';
import VendorPrev from '../images/vendorPrevImage.png';
import VendorDownloads from '../images/vendorDownloads.png';
import VendorColumn1 from '../images/vendorColumn1.png';
import VendorColumn2 from '../images/vendorColumn2.png';
import VendorColumn3 from '../images/vendorColumn3.png';
import VendorAuto from '../images/vendorauto.png';
import VendorContactPerson from '../images/vendorcp.png';
import EmailValid from '../images/vendoremailcorrect.png';
import EmailInvalid from '../images/vendoremailinvalid.png';
import ContactNo from '../images/vendorcontact.png';
import VendorAddress from '../images/vendoraddress.png';
import ItemID from '../images/itemname.png';
import VendorIdDropdown from '../images/vendoriddropdown.png';
import ItemVendorId from '../images/itemvendid.png';
import PriceValid from '../images/itempricevalid.png';
import PriceInvalid from '../images/itempriceinvalid.png';
import InvoiceNumber from '../images/invoicenum.png';
import ItemIdDropdown from '../images/invoiceitemid.png';
import ItemIdSample from '../images/invoiceitemidsample.png';
import InvoiceVendorIdDropdown from '../images/invoicevendid.png';
import InvoiceVendorIdSample from '../images/invoicevendidsample.png';
import DateOrderedValid from '../images/orderedvalid.png';
import DateOrderedInvalid from '../images/orderedinvalid.png';
import DateReceivedValid from '../images/receivedvalid.png';
import DateReceivedInvalid from '../images/receivedinvalid.png';
import axios from 'axios';
import Navbar from './Navbar';
import Topbar from './Topbar';
import { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

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
            url: `${API_URL}/downloadTemplate/2`,
            method: 'GET',
            responseType: 'arraybuffer', 
          }).then(async (response) => {
          const blobData :Blob = new Blob([response.data], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml;charset=UTF-8"});
          const href = URL.createObjectURL(blobData);
      
          // create "a" HTML element with href to file & click
          const link = document.createElement('a');
          link.href = href;
          link.setAttribute('download', 'VendorManagementTemplate.xltx'); //or any other extension
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
              Vendor Management Template
            </Typography>
            <IconButton onClick={downloadFile}>
              <DownloadForOfflineIcon sx={{ color: 'white', width: {xs: '30px', sm: '35px', md: '40px'}, height: {xs: '30px', sm: '35px', md: '40px'} }} />
            </IconButton>
          </Grid>
        </Grid>

        <Grid container justifyContent="center" alignItems="center">
          <Box sx={{ m: {xs: 5, sm: 8, md: 10}, maxWidth: 842, height: {xs: 200, sm: 300, md: 400}}}>
            <img
              src={VendorPrev}
              style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
              onClick={handleImageClick}
            />
          </Box>
          <Typography sx={{ px:{xs: 2, sm: 5, md: 8}, textAlign: 'justify'}}>
            The Vendor Management Template is a fixed template designed to streamline and enhance your vendor management process. This template offers a structured and efficient way to manage your vendors, items, and invoices. By using the Vendor Management Template, you can efficiently record and manage vital vendor-related information. The template's well-defined fields are designed to assist you in capturing crucial details, including vendor identification, contact information, item details, invoice records, and more, ensuring a streamlined vendor management process.
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
                  <Typography sx={{fontSize: {xs: '18px', sm: '22px', md: '25px'}, ml: {xs:'4rem', sm: '6rem', md: '8rem'}, marginTop: '2.5rem'}}>Downloading and Opening the Spreadsheet</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem', textAlign: 'justify' }}>
                    The Vendor Management Template is designed to enhance your vendor management process. It provides predefined columns with specific purposes, allowing you to input relevant information and simplify the task of vendor management.
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem' }}>
                    <ol type='a'>
                      <li>To download the Vendor Management Template XLTX file, simply click on the download button provided.<br/></li>
                      <li>After downloading, locate the file on your local disk and double-click to open it.</li>
                    </ol>
                    <img src={VendorDownloads} style={{ width: '100%', height: 'auto', marginLeft: 'auto', marginTop: '1rem', marginBottom: '1rem', display: 'block', marginRight: 'auto' }} />
                    <ol start={3} type='a'>
                      <li>Depending on your computer's settings, the file may open directly in your default spreadsheet software (e.g., Microsoft Excel, Google Sheets, etc.) or prompt you to choose the software to open it with.</li>
                      <li>Once the file is opened, you may see a security warning or notification at the top of the file preview. This is a necessary action to ensure full functionality and enable editing capabilities.</li>
                      <li>To proceed, click on the "Enable Editing" button or a similar option, as it allows you to make changes and input the necessary data.</li>
                    </ol> 
                    <img src={VendorEnableEdit} style={{ width: '100%', height: 'auto', marginLeft: 'auto', marginTop: '1rem', marginBottom: '1rem', display: 'block', marginRight: 'auto' }} /> <br/>
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', fontStyle:'italic', textAlign: 'justify' }}>
                    Note: The Vendor Management Template is a fixed template, which means certain columns and rows have predefined purposes and formats. You can modify specific sections of the template while adhering to the provided guidelines.
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
                  <Typography sx={{fontSize: {xs: '18px', sm: '22px', md: '25px'},  ml: {xs:'4rem', sm: '6rem', md: '8rem'}, marginTop: '2.5rem'}}>Navigating the Spreadsheet</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem', textAlign: 'justify'}}>
                    The Vendor Management Template consists of three worksheets: <strong>Vendor, Item, and Invoice</strong>. Each worksheet serves a distinct purpose:
                    <br/><br/>
                    The Vendor Woksheet serves as a central repository for vendor information, allowing you to maintain a comprehensive record of your vendors. It contains the following columns:
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Vendor ID: </strong>This column holds the unique identifier for each vendor.</li>
                      <li><strong>Vendor Name: </strong>Enter the name of the vendor or supplier.</li>
                      <li><strong>Contact Person: </strong>Specify the primary contact person within the vendor's organization.</li>
                      <li><strong>Email: </strong>Input the email address for vendor communication.</li>
                      <li><strong>Contact No.: </strong>Record the contact number for reaching the vendor.</li>
                      <li><strong>Address: </strong>Document the physical address of the vendor's location.</li>
                    </ol>
                  </Typography> <br/>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem', textAlign: 'justify'}}>
                    The Item Worksheet enables you to manage the items or products provided by your vendors efficiently. It contains the following columns:
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Item ID: </strong>This column holds the unique identifier for each item.</li>
                      <li><strong>Item Name: </strong>Enter the name of the item or product supplied by vendors.</li>
                      <li><strong>Vendor ID: </strong>Reference the corresponding vendor supplying the item.</li>
                      <li><strong>Price: </strong>State the unit price of the item provided by the vendor.</li>
                    </ol>
                  </Typography> <br/>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem', textAlign: 'justify'}}>
                    The Invoice Worksheet facilitates the tracking of invoices related to vendor transactions. It contains the following columns:
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Invoice Number: </strong>This column holds the unique identifier for each invoice.</li>
                      <li><strong>Item ID: </strong>Reference the item associated with the invoice.</li>
                      <li><strong>Vendor ID: </strong>Link the invoice to the relevant vendor.</li>
                      <li><strong>Date Ordered: </strong>Specify the date when the order was placed with the vendor.</li>
                      <li><strong>Date Received: </strong>Document the date when the ordered items were received from the vendor.</li>
                    </ol>
                    <img src={VendorColumn1} style={{width: '100%', height: 'auto', marginTop: '1rem', marginBottom: '1rem'}}/>
                    <img src={VendorColumn2} style={{width: '100%', height: 'auto', marginTop: '1rem', marginBottom: '1rem'}}/>
                    <img src={VendorColumn3} style={{width: '100%', height: 'auto', marginTop: '1rem', marginBottom: '1rem'}}/>
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', fontStyle:'italic', textAlign: 'justify' }}>
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
                  <Typography sx={{fontSize: {xs: '18px', sm: '22px', md: '25px'},  ml: {xs:'4rem', sm: '6rem', md: '8rem'}, marginTop: '2.5rem'}}>Data Input</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem', textAlign: 'justify'}}>
                    When inputting data into the Vendor Management Template, it is important to follow the necessary restrictions and guidelines for each column: 
                  </Typography>

                  {/* Vendor Worksheet */}
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem'}}>
                    Vendor Worksheet:
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Vendor ID: </strong>This is automatically generated and assigned a unique identifier whenever you add a new vendor.</li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={VendorAuto} alt="Date Valid" style={{ width: '100%', height: 'auto' }}/>
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Enter data in any of the columns and the Vendor ID is automatically generated.</Typography>
                          </div>
                        </div>
                      </Box> <br/>

                      <li><strong>Vendor Name: </strong>Use alphabetic characters to input the vendor's name accurately.</li><br/>

                      <li><strong>Contact Person: </strong>Enter the name of the primary contact person within the vendor's organization. Use valid text and alphabetic characters in this field.</li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={VendorContactPerson} style={{ width: '100%', height: 'auto' }} alt="Product - Guide" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Input for contact person should be less than or equal to 50 characters. </Typography>
                          </div>
                        </div>
                      </Box> <br/><br/>

                      <li><strong>Email: </strong>Input the valid email address for vendor communication. Make sure to use the standard email format (ex. datamate@gmail.com).</li><br/>
                      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <div className="image-overlay-container">
                          <img src={EmailValid} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Valid format.</Typography>
                          </div>
                        </div>
                        <div className="image-overlay-container">
                          <img src={EmailInvalid} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 2" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Invalid format.</Typography>
                          </div>
                        </div>
                      </Stack> <br/><br/>

                      <li><strong>Contact No.: </strong>Input the contact number for reaching the vendor.</li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={ContactNo} style={{ width: '100%', height: 'auto' }} alt="Unit Price - Invalid" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Sample contact number input.</Typography>
                          </div>
                        </div>
                      </Box> <br/><br/>
                      
                      <li><strong>Address: </strong>Specify the physical address of the vendor's location. This accepts alphanumeric values.</li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={VendorAddress} style={{ width: '100%', height: 'auto' }} alt="Total Sales - Guide" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Sample vendor address.</Typography>
                          </div>
                        </div>
                      </Box> <br/><br/>
                    </ol>
                  </Typography>

                {/* Item Worksheet */}
                <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem'}}>
                    Item Worksheet:
                </Typography>
                <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                        <li><strong>Item ID: </strong>This is automatically generated whenever you input a new item.</li><br/>
                        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={ItemID} alt="Date Valid" style={{ width: '100%', height: 'auto' }}/>
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Enter data in any of the columns and the Item ID is automatically generated.</Typography>
                          </div>
                        </div>
                      </Box> <br/>
                        
                        <li><strong>Item Name: </strong>Only input valid string values to accurately represent the name or description of the item.</li><br/> 

                        <li><strong>Vendor ID: </strong>Choose the corresponding vendor ID from the dropdown button.</li><br/>
                        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                            <div className="image-overlay-container">
                                <img src={VendorIdDropdown} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                                <div className="image-overlay">
                                <Typography className="image-overlay-title">Select a Vendor ID from the Vendors Worksheet.</Typography>
                                </div>
                            </div>
                            <div className="image-overlay-container">
                                <img src={ItemVendorId} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 2" />
                                <div className="image-overlay">
                                <Typography className="image-overlay-title">Sample selection.</Typography>
                                </div>
                            </div>
                        </Stack> <br/><br/>

                        <li><strong>Price: </strong>Enter the unit price of the item as a decimal number or whole number.</li><br/>
                        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                            <div className="image-overlay-container">
                                <img src={PriceValid} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                                <div className="image-overlay">
                                <Typography className="image-overlay-title">Valid format.</Typography>
                                </div>
                            </div>
                            <div className="image-overlay-container">
                                <img src={PriceInvalid} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 2" />
                                <div className="image-overlay">
                                <Typography className="image-overlay-title">Input only decimal or whole number.</Typography>
                                </div>
                            </div>
                        </Stack> <br/><br/>
                    </ol>
                </Typography>

                {/* Invoice Worksheet */}
                <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem'}}>
                    Invoice Worksheet:
                </Typography>
                <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                        <li><strong>Invoice Number: </strong>Assign a unique identifier for each invoice without duplication.</li><br/>
                        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                            <img src={InvoiceNumber} style={{ width: '100%', height: 'auto' }} alt="Customer Name - Guide" />
                            <div className="image-overlay">
                            <Typography className="image-overlay-title">Sample invoice number.</Typography>
                            </div>
                        </div>
                        </Box> <br/><br/>
                        
                        <li><strong>Item ID: </strong>Choose the corresponding item ID from the dropdown button.</li><br/>        
                        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                            <div className="image-overlay-container">
                                <img src={ItemIdDropdown} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                                <div className="image-overlay">
                                    <Typography className="image-overlay-title">Select an Item ID from the Item Worksheet.</Typography>
                                </div>
                            </div>
                            <div className="image-overlay-container">
                                <img src={ItemIdSample} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 2" />
                                <div className="image-overlay">
                                    <Typography className="image-overlay-title">Sample selection.</Typography>
                                </div>
                            </div>
                        </Stack> <br/><br/>

                        <li><strong>Vendor ID: </strong>Choose the corresponding vendor ID from the dropdown button.</li><br/>
                        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                            <div className="image-overlay-container">
                                <img src={InvoiceVendorIdDropdown} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                                <div className="image-overlay">
                                    <Typography className="image-overlay-title">Select a Vendor ID from the Vendor Worksheet.</Typography>
                                </div>
                            </div>
                            <div className="image-overlay-container">
                                <img src={InvoiceVendorIdSample} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 2" />
                                <div className="image-overlay">
                                    <Typography className="image-overlay-title">Sample selection.</Typography>
                                </div>
                            </div>
                        </Stack> <br/><br/>

                        <li><strong>Date Ordered: </strong>Specify the date when the order was placed with the vendor (use a valid date format: MM/DD/YYYY).</li><br/>
                        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <div className="image-overlay-container">
                            <img src={DateOrderedValid} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                            <div className="image-overlay">
                            <Typography className="image-overlay-title">Please follow specified format.</Typography>
                            </div>
                        </div>
                        <div className="image-overlay-container">
                            <img src={DateOrderedInvalid} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 2" />
                            <div className="image-overlay">
                            <Typography className="image-overlay-title">Sample invalid date format.</Typography>
                            </div>
                        </div>
                        </Stack> <br/><br/>

                        <li><strong>Date Received: </strong>Specify the date when the ordered items were received from the vendor (use a valid date format: MM/DD/YYYY).</li><br/>
                        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <div className="image-overlay-container">
                            <img src={DateReceivedValid} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                            <div className="image-overlay">
                            <Typography className="image-overlay-title">Please follow specified format.</Typography>
                            </div>
                        </div>
                        <div className="image-overlay-container">
                            <img src={DateReceivedInvalid} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 2" />
                            <div className="image-overlay">
                            <Typography className="image-overlay-title">Sample invalid date format.</Typography>
                            </div>
                        </div>
                        </Stack> <br/><br/>
                    </ol>
                </Typography>

                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', fontStyle:'italic', textAlign: 'justify' }}>
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
              <img src={VendorPrev} style={{ width: '100%', height: 'auto' }} />
            </DialogContent>
          </Dialog>
        </Grid>   
      </Grid>
    )


}