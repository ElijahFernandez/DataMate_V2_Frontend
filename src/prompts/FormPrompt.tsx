import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, Button, Box, Typography, Divider, CircularProgress} from "@mui/material";
import { styled } from "@mui/system";
import modalStyle from "../styles/ModalStyles";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import { Height, Opacity } from "@mui/icons-material";
import axios from "axios";

type FormProps = {
  startLoading: () => void;
  headers: string[];
  onClose: () => void;
  setProcessedHeaders: React.Dispatch<React.SetStateAction<ProcessedFormHeaders[] | undefined>>; // Correct type
};

interface ProcessedFormHeaders {
  headerName: string;
  headerValue: string;
}

const styles = {
  dialogPaper: {
    backgroundColor: "#DCF1EC",
    padding: "25px",
  },
  uploadButton: {
    marginTop: "10px",
    borderRadius: "20px",
    height: "45px",
    width: "160px",
    background: "#71C887",
  },
  divider: {
    py: 0,
    width: '100%',
    maxWidth: 360,
    marginTop: "5px",
    marginBottom: "10px",
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    color: 'white',
  },
};


const FormPrompt = ({ startLoading, headers, onClose, setProcessedHeaders }: FormProps) => {
  const drop = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [formHeaders, setFormHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setFormHeaders(headers);
    console.log("Headers received: ", headers);
  }, [headers]);

  const handleInsert = () => {
    console.log("Inserting form");
    processHeaders();
  }

  const handleModify = () => {
    console.log("Modifying form");
    
  }

  const handleDelete = () => {
    console.log("Deleting form");
    
  }

  const processHeaders = async () => {
    setIsProcessing(true);
    try {
        const response = await axios.post('http://localhost:8080/api/headers', formHeaders);
        
        console.log("API response:", response);
        console.log("Response data:", response.data);

        // Assuming response.data is a string of comma-separated header values
        const headerString = response.data;
        const headerArray = headerString.split(',').map((header: string) => header.trim());

        // Map to the desired format
        const headersData: ProcessedFormHeaders[] = headers.map((headerName, index) => {
            return {
                headerName: headerName,
                headerValue: headerArray[index] || '', // Use empty string if no corresponding value
            };
        });
        console.log("Mapped Headers:", headersData);
        setProcessedHeaders(headersData);
    } catch (error) {
        console.error("Error processing headers:", error);
    } finally {
        setIsProcessing(false);
        onClose(); 
    }
  };


  return (
    <Box sx={modalStyle}>
      <div ref={drop} className="dropArea">
      <div className="uploadTextContainer">
        <Typography variant="h6">
          SELECT FORM TYPE
        </Typography>
        <Divider sx={styles.divider}/>
      <Button
          variant="contained"
          color="primary"
          component="label"
          style={styles.uploadButton}
        >
          Insert
          <input onClick={handleInsert} style={{ display: "none" }} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          component="label"
          style={styles.uploadButton}
        >
          Modify
          <input onClick={handleModify} style={{ display: "none" }} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          component="label"
          style={styles.uploadButton}
        >
          Delete
          <input onClick={handleDelete} style={{ display: "none" }} />
        </Button>
        </div>
      </div>
      {isProcessing && (
        <div style={styles.processingOverlay as React.CSSProperties}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Processing Headers...
          </Typography>
        </div>
      )}
    </Box>
  );
};

export default styled(FormPrompt)({});

export {}; // Add this empty export statement
