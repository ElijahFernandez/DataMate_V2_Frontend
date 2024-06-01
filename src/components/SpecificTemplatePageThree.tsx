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
import EmployeeOverview from '../images/employee/employeeOverview.png';
import EmployeeDownload from '../images/employee/employeeDownload.png';
import EmployeeEdit from '../images/employee/employeeEdit.png';
import EmployeeSheet1 from '../images/employee/employeeNEntry.png';
import EmployeeSheet2 from '../images/employee/employeeNEMployee.png';
import EmployeeSheet3 from '../images/employee/employeeNDepartment.png';
import EntryEntryID from '../images/employee/employeeEntryID.png';
import EntryDate from '../images/employee/employeeDate.png';
import EntryTime from '../images/employee/employeeTime.png';
import EntryEmployeeID from '../images/employee/employeeEntryEmployeeID.png';
import EmployeeEmployeeID from '../images/employee/employeeID.png';
import EmployeeName from '../images/employee/employeeName.png';
import EmployeeEmail from '../images/employee/employeeEmail.png';
import EmployeeDepartmentID from '../images/employee/employeeDepartmentID.png';
import DepartmentDepartmentID from '../images/employee/departmentDepartmentID.png';
import DepartmentName from '../images/employee/departmentName.png';
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
          // url: "https://datamate-api.onrender.com/downloadTemplate/3",
          url: "https:localhost:8080/downloadTemplate/3",
          method: 'GET',
          responseType: 'arraybuffer', 
      }).then(async (response) => {
          const blobData :Blob = new Blob([response.data], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml;charset=UTF-8"});
          const href = URL.createObjectURL(blobData);
      
          // create "a" HTML element with href to file & click
          const link = document.createElement('a');
          link.href = href;
          link.setAttribute('download', 'EmployeeTimesheetTemplate.xltx'); //or any other extension
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
              Employee Timesheet Template
            </Typography>
            <IconButton onClick={downloadFile}>
              <DownloadForOfflineIcon sx={{ color: 'white', width: {xs: '30px', sm: '35px', md: '40px'}, height: {xs: '30px', sm: '35px', md: '40px'} }} />
            </IconButton>
          </Grid>
        </Grid>

        <Grid container justifyContent="center" alignItems="center">
          <Box sx={{ m: {xs: 5, sm: 8, md: 10}, maxWidth: 842, height: {xs: 200, sm: 300, md: 400}}}>
            <img
              src={EmployeeOverview}
              style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
              onClick={handleImageClick}
            />
          </Box>
          <Typography sx={{ px:{xs: 2, sm: 5, md: 8}, textAlign: 'justify'}}>
          The Employee Timesheet Template is a fixed template designed to streamline and enhance your employee time tracking process. This template offers a structured and efficient way to log and manage your employees' work hours. By using the Employee Timesheet Template, you can efficiently record and manage vital employee-related information. The template's well-defined fields are designed to assist you in capturing crucial details, including employee identification, contact information, and timesheet records, ensuring a streamlined employee time tracking process.
          </Typography>

          <Grid container sx={{ my: {xs: 4, sm: 5, md: 8}, mx: {xs: 0, sm: 2, md: 3} }}>
            <Typography fontWeight="bold" sx={{ ml: '2rem', fontSize: {xs: '25px', sm: '32px', md: '40px'} }}>Guide</Typography>
          </Grid>

          <Grid container>
            <Grid container>
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
                  The Employee Timesheet Template is designed to enhance the management of your employee timesheet process. It provides predefined columns with specific purposes, allowing you to input relevant information and simplify the task of managing the employee timesheet.
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem' }}>
                    <ol type='a'>
                      <li>To download the Employee Timesheet Template XLTX file, simply click on the download button provided.<br/></li>
                      <li>After downloading, locate the file on your local disk and double-click to open it.</li>
                    </ol>
                    <img src={EmployeeDownload} style={{ width: '100%', height: 'auto', marginLeft: 'auto', marginTop: '1rem', marginBottom: '1rem', display: 'block', marginRight: 'auto' }} />
                    <ol start={3} type='a'>
                      <li>Depending on your computer's settings, the file may open directly in your default spreadsheet software (e.g., Microsoft Excel, Google Sheets, etc.) or prompt you to choose the software to open it with.</li>
                      <li>Once the file is opened, you may see a security warning or notification at the top of the file preview. This is a necessary action to ensure full functionality and enable editing capabilities.</li>
                      <li>To proceed, click on the "Enable Editing" button or a similar option, as it allows you to make changes and input the necessary data.</li>
                    </ol> 
                    <img src={EmployeeEdit} style={{ width: '100%', height: 'auto', marginLeft: 'auto', marginTop: '1rem', marginBottom: '1rem', display: 'block', marginRight: 'auto' }} /> <br/>
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', fontStyle:'italic', textAlign: 'justify' }}>
                    Note: The Employee Timesheet Template i s a fixed template, which means certain columns and rows have predefined purposes and formats. You can modify specific sections of the template while adhering to the provided guidelines.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
            
            <Grid container>
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
                    The Employee Timesheet Template is structured into three worksheets:   <strong>Entry, Employee, and Department</strong>. Each worksheet serves a distinct purpose:
                    <br/><br/>
                    The Entry Worksheet serves as a record for employee time tracking, allowing you to maintain a comprehensive record of your employees' work hours. It contains the following columns:
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Entry ID: </strong>This column holds a unique identifier for each employee's time entry.</li>
                      <li><strong>Date: </strong>: Specify the date for each time entry.</li>
                      <li><strong>Time: </strong>Record the time when each entry was made.</li>
                      <li><strong>Employee ID: </strong>This column holds the unique identifier for each employee.</li>
                    </ol>
                  </Typography> <br/>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem', textAlign: 'justify'}}>
                  The Employee Worksheet enables you to manage employee information efficiently. It contains the following columns:
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Employee ID: </strong>This column holds the unique identifier for each employee.</li>
                      <li><strong>Employee Name: </strong>Enter the name of the employee</li>
                      <li><strong>Email: </strong>Input the email address for employee communication.</li>
                      <li><strong>Department ID: </strong>This column holds the unique identifier for the department to which the employee belongs.</li>
                    </ol>
                  </Typography> <br/>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem', textAlign: 'justify'}}>
                  The Department Worksheet facilitates tracking employees and their respective departments. It contains the following columns:
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Department ID: </strong>This column holds the unique identifier for each department.</li>
                      <li><strong>Department Name: </strong>Enter the name of the department.</li>
                    </ol>
                    <img src={EmployeeSheet1} style={{width: '100%', height: 'auto', marginTop: '1rem', marginBottom: '1rem'}}/>
                    <img src={EmployeeSheet2} style={{width: '100%', height: 'auto', marginTop: '1rem', marginBottom: '1rem'}}/>
                    <img src={EmployeeSheet3} style={{width: '100%', height: 'auto', marginTop: '1rem', marginBottom: '1rem'}}/>
                  </Typography>
                  <Typography sx={{ marginLeft: '5rem', marginRight: '5rem', fontStyle:'italic', textAlign: 'justify' }}>
                    Note: The first row, which contains the column titles, is fixed and cannot be edited. It serves as a reference for understanding the purpose of each column and maintaining consistency throughout the spreadsheet. 
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid container>
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
                  When inputting data into the Employee Timesheet Template, it is important to follow the necessary restrictions and guidelines for each worksheet:
                  </Typography>

                  {/* Entry Worksheet */}
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem'}}>
                    Entry Worksheet:
                  </Typography>
                  <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                      <li><strong>Entry ID: </strong>This column is automatically generated and assigned a unique identifier whenever you add a new time entry.</li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={EntryEntryID} alt="Date Valid" style={{ width: '100%', height: 'auto' }}/>
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Enter data in any of the columns and the Entry ID is automatically generated.</Typography>
                          </div>
                        </div>
                      </Box> <br/>

                      <li><strong>Date: </strong>Specify the date for each time entry (use a valid date format: MM/DD/YYYY).</li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={EntryDate} style={{ width: '100%', height: 'auto' }} alt="Product - Guide" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Input for contact person should be less than or equal to 50 characters. </Typography>
                          </div>
                        </div>
                      </Box> <br/><br/>

                      <li><strong>Time: </strong>Record the time when each entry was made (use a valid time format: HH:MM:SS).</li><br/>
                      <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={EntryTime} style={{ width: '100%', height: 'auto' }} alt="Product - Guide" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Input for contact person should be less than or equal to 50 characters. </Typography>
                          </div>
                        </div>
                      </Box> <br/><br/>

                      <li><strong>Employee ID: </strong>Choose the corresponding employee ID from the dropdown button.</li><br/>
                      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <div className="image-overlay-container">
                          <img src={EntryEmployeeID} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Select an Employee ID from the Employee Worksheet.</Typography>
                          </div>
                        </div>
                      
                      </Stack> <br/><br/>

                    </ol>
                  </Typography>

                {/* Employee Worksheet */}
                <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem'}}>
                    Employee Worksheet:
                </Typography>
                <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                        <li><strong>Employee ID: </strong>This column is automatically generated whenever you input a new employee.</li><br/>
                        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={EmployeeEmployeeID} alt="Date Valid" style={{ width: '100%', height: 'auto' }}/>
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Enter data in any of the columns and the Employee ID is automatically generated.</Typography>
                          </div>
                        </div>
                      </Box> <br/>
                        
                        <li><strong>Employee Name: </strong>Only input valid alphabetic characters to accurately represent the name of the employee.</li><br/> 
                        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                        <div className="image-overlay-container">
                          <img src={EmployeeName} alt="Date Valid" style={{ width: '100%', height: 'auto' }}/>
                          <div className="image-overlay">
                            <Typography className="image-overlay-title">Enter name of employee.</Typography>
                          </div>
                        </div>
                      </Box> <br/>

                        <li><strong>Email: </strong>Input the valid email address for employee communication. Make sure to use the standard email format (e.g., john.doe@email.com).</li><br/>
                        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                            <div className="image-overlay-container">
                                <img src={EmployeeEmail} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                                <div className="image-overlay">
                                <Typography className="image-overlay-title">Enter email of employee.</Typography>
                                </div>
                            </div>
                        
                        </Box> <br/><br/>

                        <li><strong>Department ID: </strong>Choose the corresponding department ID from the dropdown button.</li><br/>
                        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                            <div className="image-overlay-container">
                                <img src={EmployeeDepartmentID} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                                <div className="image-overlay">
                                <Typography className="image-overlay-title">Select a Department ID from Department Worksheet.</Typography>
                                </div>
                            </div>
                        
                        </Box> <br/><br/>
                    </ol>
                </Typography>

                {/* Department Worksheet */}
                <Typography sx={{marginLeft: '5rem', marginRight: '5rem', marginBottom: '2rem'}}>
                    Department Worksheet:
                </Typography>
                <Typography sx={{marginLeft: '5rem', marginRight: '5rem', textAlign: 'justify'}}>
                    <ol style={{ listStyleType: 'lower-roman' }}>
                    
                        <li><strong>Department ID: </strong>This column is automatically generated and assigned a unique identifier whenever you add a new department.</li><br/>        
                        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                            <div className="image-overlay-container">
                                <img src={DepartmentDepartmentID} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                                <div className="image-overlay">
                                <Typography className="image-overlay-title">Enter data in any of the columns and the Department ID is automatically generated.</Typography>
                                </div>
                            </div>
                        
                        </Box> <br/><br/>

                        <li><strong>Department Name: </strong>Enter the name of the department using valid text and alphabetic characters.</li><br/>
                        <Box sx={{ justifyContent: 'center', display: 'flex' }}>
                            <div className="image-overlay-container">
                                <img src={DepartmentName} style={{ width: '100%', height: 'auto' }} alt="Quantity Invalid 1" />
                                <div className="image-overlay">
                                <Typography className="image-overlay-title">Enter name of department.</Typography>
                                </div>
                            </div>
                        
                        </Box> <br/><br/>

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
              <img src={EmployeeOverview} style={{ width: '100%', height: 'auto' }} />
            </DialogContent>
          </Dialog>
        </Grid>   
      </Grid>
    )


}