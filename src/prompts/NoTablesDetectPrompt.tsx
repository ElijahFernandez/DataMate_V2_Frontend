import { useNavigate } from "react-router-dom";
import FileService from "../services/FileService";
import { Box, Button, styled } from "@mui/material";
import { useEffect, useState } from "react";


type NoTableProps = {
    toggleNoTable: (status:boolean) => void,
    fileId: number,
    reset: () => void,
    startLoading: () => void,
    stopLoading: () => void,
  }

const NoTablesDetectPrompt = ({startLoading, stopLoading, fileId, toggleNoTable, reset}: NoTableProps) => {  
  const nav = useNavigate();

  function okFunction(){
    startLoading();
      FileService.deleteFile(fileId).then((res)=>{
        reset();
        toggleNoTable(false);
        stopLoading();
        nav('/');
      }).catch((err)=>{
        console.log(err);
      })
  }
  
  return (
    <Box sx={{
        position: "absolute",
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 798,
        maxHeight: 594,
        bgcolor: '#71C887',
        boxShadow: 24,
        p: 2,
    }}>
        <div style={{marginTop:"3%", padding:"2em", backgroundColor:"#DCF1EC"}}>
          <div style={{display:"flex", justifyContent:"Center", flexDirection:"column", margin:"2em"}}>
              <p style={{fontSize:"24px", padding:0, margin:0, textAlign:"center"}}>DataMate has not detected any possible tables.</p>
              <p style={{fontSize:"24px", padding:0, margin:0, textAlign:"center"}}>Please recheck your file.</p>
          </div>
          <div style={{display:"flex", justifyContent:"end"}}>
          <Button disableElevation onClick={okFunction} variant="contained" sx={{fontSize:'24px', backgroundColor: '#71C887', color:'white', borderRadius:50 , paddingInline: 7, margin:'5px'}}>OK</Button>          
          </div>
        </div>
    </Box>
  );
};

export default styled(NoTablesDetectPrompt)({});

export {}; // Add this empty export statement