import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import spreadsheet from '../images/spreadsheet1.png';
import { useNavigate } from "react-router-dom";

export type TemplateItemType ={
    templateId: number,
    templateName: string,
}

export default function TemplateItem({templateId, templateName}: TemplateItemType) {
    const nav = useNavigate();
    
    const handleSpecificTemplateClick = () => {
        const url = "/templates/" + templateId.toString()
        nav(url);
    }


    return (
      <Card onClick={handleSpecificTemplateClick} sx={{display:"flex", justifyContent:'center', width: "17em", backgroundColor:"#71C887", height:"12em", margin:"2em"
      ,'&:hover': {
        backgroundColor: 'primary.main',
        opacity: [0.9, 0.8, 0.7],
      }}}>
        <CardContent style={{display:'flex', justifyContent:"center", alignItems:"center", paddingTop:"20px", flexDirection:"column"}}>
          <Grid container direction="row" justifyContent="center" alignItems="center" sx={{ backgroundColor:"white", width: '14em', height: '10em'}}>
            <Box>
                <img src={spreadsheet} alt='spreadsheet-icon'/>
            </Box>
          </Grid>
            <Box sx={{ maxWidth: 250, mt: 1 }}>
              <Typography variant="body2" sx={{padding:0, color:"white", textAlign:"center", whiteSpace: 'nowrap' }}>
                  <b>{templateName}</b>
              </Typography>
            </Box>
        </CardContent>
      </Card>
    );
  }