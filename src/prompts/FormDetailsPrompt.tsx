import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import modalStyle from "../styles/ModalStyles";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import { Height, Opacity } from "@mui/icons-material";
import axios from "axios";
import { FormEntity } from "../api/dataTypes";
import { Toaster, toast } from "react-hot-toast";

interface ProcessedFormHeaders {
  headerName: string;
  headerValue: string;
}

type FormDetailsProps = {
  startLoading: () => void;
  stopLoading: () => void;
  onClose: () => void;
  setFormName: React.Dispatch<React.SetStateAction<string>>;
  formType: string;
  dbName: string;
  tblName: string;
  processedHeaders: ProcessedFormHeaders[] | undefined;
  userId: number;
};

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
};

const FormDetailsPrompt = ({
  startLoading,
  stopLoading,
  onClose,
  setFormName,
  dbName,
  tblName,
  formType,
  processedHeaders,
  userId,
}: FormDetailsProps) => {
  const drop = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  // const userId = useSelector((state: RootState) => state.auth.userId);
  const [isProcessing, setIsProcessing] = useState(false);
  const processInsertHeaders = async () => {};
  const [localFormName, setLocalFormName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!localFormName || !dbName) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    startLoading();
    setErrorMessage(null);

    try {
      // Convert processedHeaders to the format that worked in Postman
      const headersObject =
        processedHeaders?.reduce((acc, header) => {
          acc[header.headerName] = header.headerValue;
          return acc;
        }, {} as Record<string, string>) || {};

      const formData: FormEntity = {
        dbName: dbName,
        tblName: tblName,
        formName: localFormName,
        headers: JSON.stringify(headersObject),
        customSettings: JSON.stringify({ theme: "light" }), // You can modify this as needed
        userId: userId,
        createdAt: new Date().toISOString(), // Use current date-time
      };

      console.log("Sending form data:", formData);
      console.log("user id:", userId);
      const response = await axios.post<FormEntity>(
        "http://localhost:8080/postForms",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const createdFormId = response.data.formId;

      console.log("Form created successfully:", response.data);
      setFormName(localFormName);
      onClose();

      // Navigate to the newly created form
      nav(`/forms/${createdFormId}`); // Dynamic navigation based on the formId
    } catch (error) {
      console.error("Error creating form:", error);
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          `Failed to create form: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
      stopLoading();
    }
  };

  return (
    <Box sx={modalStyle}>
      <div ref={drop} className="dropArea">
        <div className="uploadTextContainer">
          <Typography variant="h6">
            CREATE {formType.toUpperCase()} FORM
          </Typography>
          <Typography variant="h6">Database selected: {dbName}</Typography>
          <Divider sx={styles.divider} />
          <TextField
            label="Form Name"
            variant="outlined"
            fullWidth
            onChange={(e) => setLocalFormName(e.target.value)} // Update local state on change
            sx={{ marginBottom: "10px" }}
          />
          <Button
            variant="contained"
            color="primary"
            component="label"
            style={styles.uploadButton}
            onClick={handleSubmit}
          >
            create form
          </Button>
        </div>
      </div>
      {isProcessing && (
        <div style={styles.processingOverlay as React.CSSProperties}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" style={{ marginTop: "20px" }}>
            Navigating to Form...
          </Typography>
        </div>
      )}
    </Box>
  );
};

export default styled(FormDetailsPrompt)({});

export {}; // Add this empty export statement
