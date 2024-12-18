import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { styled } from "@mui/system";
import modalStyle from "../styles/ModalStyles";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import { Height, Opacity } from "@mui/icons-material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

type FormProps = {
  startLoading: () => void;
  headers: string[];
  onClose: () => void;
  setProcessedHeaders: React.Dispatch<
    React.SetStateAction<ProcessedFormHeaders[] | undefined>
  >; // Correct type
  setFormType: (formType: string) => void;
};

interface ProcessedFormHeaders {
  headerName: string;
  headerValue: string;
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#DCF1EC",
    padding: "25px",
    borderRadius: "10px",
    position: "relative",
    maxWidth: "500px",
    width: "90%",
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
    width: "100%",
    maxWidth: 360,
    marginTop: "5px",
    marginBottom: "10px",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    color: "white",
  },
  closeButton: {
    position: "absolute",
    color: "black",
    top: "10px",
    right: "10px",
  },
};

const FormPrompt = ({
  startLoading,
  headers,
  onClose,
  setProcessedHeaders,
  setFormType,
}: FormProps) => {
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
    setFormType("Insert");
  };

  const handleModify = () => {
    console.log("Modifying form");
    processHeaders();
    setFormType("Modify");
  };

  const handleDelete = () => {
    console.log("Deleting form");
    processHeaders();
    setFormType("Delete");
  };

  const processHeaders = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post(
        // "http://localhost:8080/api/headers",
        `${API_URL}/api/headers`,

        formHeaders
      );

      console.log("API response:", response);
      console.log("Response data:", response.data);

      const headerString = response.data;
      const headerArray = headerString
        .split(",")
        .map((header: string) => header.trim());

      // Map to the desired format
      const headersData: ProcessedFormHeaders[] = headers.map(
        (headerName, index) => {
          return {
            headerName: headerName,
            headerValue: headerArray[index] || "", // Use empty string if no corresponding value
          };
        }
      );
      console.log("Mapped Headers:", headersData);
      setProcessedHeaders(headersData);
    } catch (error) {
      console.error("Error processing headers:", error);
    } finally {
      setIsProcessing(false);
      onClose();
      // show modal
    }
  };

  return (
    <div style={styles.modalOverlay as React.CSSProperties}>
      <div style={styles.modalContent as React.CSSProperties}>
        <Box sx={modalStyle}>
          <IconButton
            style={styles.closeButton as React.CSSProperties}
            onClick={onClose}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <div ref={drop} className="dropArea">
            <div className="uploadTextContainer">
              <Typography variant="h6">SELECT FORM TYPE</Typography>
              <Divider sx={styles.divider} />
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
              <Typography variant="h6" style={{ marginTop: "20px" }}>
                Processing Headers...
              </Typography>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
};

export default styled(FormPrompt)({});

export {}; // Add this empty export statement