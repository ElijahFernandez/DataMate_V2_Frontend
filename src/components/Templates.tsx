import * as React from 'react';
import { Box, Button, Card, Container, Grid, IconButton, InputAdornment, Modal, Stack, TextField, Typography } from '@mui/material';
import noRecentFiles from '../images/noRecentFiless.png';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useNavigate } from 'react-router-dom';
import TemplateItem, { TemplateItemType } from './TemplateItem';
import axios from 'axios';
import { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


export default function Templates(){
    const [templateList,setTemplateList] = React.useState<TemplateItemType[]>([]);
    const [recentDownloads, setRecentDownloads] = React.useState<TemplateItemType[]>([]);

    React.useEffect(()=>{
      console.log(API_URL);
      axios.get(API_URL + "/templates"
      // axios.get("http://localhost:8080/templates"
      ).then((res)=>{
          console.log(res.data);
          if(res.data){
            setTemplateList(res.data);  
          }
      }).catch(err => {
          console.log(err);
      })
    },[])

    React.useEffect(() => {
      axios.get(API_URL + "/recentDownloads"
        // axios.get("http://localhost:8080/recentDownloads"
      ).then((res) => {
        console.log(res.data);
        if (res.data) {
          setRecentDownloads(res.data);
          console.log("Recent downloads:", recentDownloads);
        }
      }).catch(err => {
        console.log(err);
      })
    }, [])

    React.useEffect(()=>{
      console.log("TL",templateList)
    }, [templateList])

    const [searchQuery, setSearchQuery] = useState(""); // State for the search query

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);

    };

    const filteredTemplates = templateList.filter((template) => {
      return template.templateName.toLowerCase().includes(searchQuery.toLowerCase());
    });
    console.log("template: List", filteredTemplates)
    
    return(
        <Grid container sx={{ mt: {xs: 7, sm: 8, md: 8}}} direction="column">
          <Box className='gradientbg'>
            <Stack direction="column" justifyContent="center" alignItems="center" sx={{ pt: 3}}>
              <Typography sx={{ color: "white", fontWeight: "bold", fontSize: {xs: 30, sm: 45, md: 50} }}> Download Template</Typography>
              <Typography sx={{textAlign: "center" , color: 'white', fontSize: {xs: 16, sm: 18, md: 20}, py: 3, px: {xs: 5}}}>Get more done in less time with our downloadable templates - Boost Your Productivity Now!</Typography>
              <Grid container justifyContent="center" alignItems="center" sx={{ mb: 6 }}>
                <TextField className='search'
                  hiddenLabel
                  size="medium"  
                  placeholder="Search"
                  sx={{width: {xs: '300px', sm: '400px', md: '581px'} , border: 'none', "& fieldset": { border: 'none' },}}
                  onChange={handleSearchChange}
                  InputProps={{ startAdornment: (<InputAdornment position="start"> <SearchOutlinedIcon /> </InputAdornment>), }} 
                  // disableunderline: true, }} 
                />
              </Grid>
            </Stack>
          </Box>

          <Grid container className='wrapper' direction={{ xs: 'column', sm: 'row', md: 'row' }}>
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid container>
                <Typography sx={{ fontWeight: "bold", fontSize: {xs: 20, sm: 25, md: 30}, mt: '3rem' }}>Recent Downloads</Typography>
              </Grid>
              <Grid container>
                {recentDownloads.length === 0 ? (
                  <Grid container sx={{ margin: '3rem', justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                    <img src={noRecentFiles} style={{ width: 200, height: 200 }} />
                  </Grid>
                ) : (
                  <Grid container>
                    {recentDownloads.map((template, i) => {
                      return (
                        <TemplateItem key={i} templateId={template.templateId} templateName={template.templateName} />
                      );
                    })}
                  </Grid>
                )}
              </Grid>
            </Grid>


            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid container>
              <Typography sx={{ fontWeight: "bold", fontSize: {xs: 20, sm: 25, md: 30}, mt: '3rem' }}>All Templates</Typography>
              </Grid>
              <Grid container>
              
                {/* {
                  templateList !== undefined ?
                  filteredTemplates.map((template, i)=>{
                    return(<TemplateItem templateId={template.templateId} templateName={template.templateName}/>)
                  }):<></>
                } */}

                  {templateList !== undefined && filteredTemplates.length === 0 ? (
                    <Grid container justifyContent="center" alignItems="center">
                      <Typography variant='body2' mb={5}>No templates found</Typography>
                    </Grid>
                  ) : (
                    filteredTemplates.map((template, i) => (
                      <TemplateItem key={i} templateId={template.templateId} templateName={template.templateName} />
                    ))
                  )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        )
}