import React, { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  InputProps,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { styled } from "@mui/system";
import modalStyle from "../styles/ModalStyles";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import { Height, Opacity } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

interface ProcessedFormHeaders {
  headerName: string;
  headerValue: string;
}

interface InsertFormPromptProps {
  processedHeaders: ProcessedFormHeaders[] | undefined;
  handleClose: () => void;
  tblName: string;
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
    width: "100%",
    maxWidth: 360,
    marginTop: "5px",
    marginBottom: "10px",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  },
};

const InsertFormPrompt: React.FC<InsertFormPromptProps> = ({
  processedHeaders,
  handleClose,
  tblName,

}) => {
  const drop = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [formValues, setFormValues] = useState<{
    [key: string]: string | boolean;
  }>({});
  
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the payload with the table name and form values
    console.log("Form values:", formValues);
    console.log("Table Name:", tblName);
    const payload = {
      tableName: tblName, // Include the table name in the payload
      headers: Object.keys(formValues), // Extract the headers from form values
      values: Object.values(formValues), // Extract the values from form values
    };

    try {
      const response = await fetch("http://localhost:8080/insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Form submitted successfully!");
        // Clear form values after submission
        setFormValues({});
      } else {
        toast.error("Failed to submit form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const getInputType = (
    headerValue: string
  ): {
    type: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    InputProps?: { startAdornment?: JSX.Element; endAdornment?: JSX.Element };
    isCheckbox?: boolean; // Added this flag to handle checkboxes differently
  } => {
    if (headerValue === "ID") {
      return {
        type: "text",
        InputProps: {
          startAdornment: <InputAdornment position="start">ID</InputAdornment>,
        },
      };
    }
    if (headerValue === "number") {
      return {
        type: "number",
        inputProps: { inputMode: "numeric", pattern: "[0-9]*", step: "any" },
        InputProps: {
          endAdornment: <InputAdornment position="end">#</InputAdornment>, // Icon or unit for number
        },
      };
    }
    if (headerValue === "checkbox") {
      return {
        type: "checkbox",
        isCheckbox: true, // Flag to handle checkbox
      };
    } else {
      return { type: headerValue };
    }
  };

  // Styling logic based on header type (can be extended)
  const getTextFieldStyles = (headerValue: string) => {
    switch (headerValue) {
      case "ID":
        return { border: "2px solid green", borderRadius: "8px" }; // Custom style for "ID" input
      case "number":
        return { backgroundColor: "#f0f0f0" }; // Custom background for numbers
      case "checkbox":
        return {}; // Style for checkboxes
      default:
        return {}; // Default style for other input types
    }
  };

  return (
    <Container maxWidth="md" sx={modalStyle}>
      <Paper elevation={3} sx={{ padding: 2, position: "relative" }}>
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ mb: 2, textAlign: "center" }}
        >
          Insert Form
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {processedHeaders ? (
              processedHeaders.map((header, index) => {
                const { type, inputProps, InputProps, isCheckbox } =
                  getInputType(header.headerValue);

                return (
                  <Grid item xs={12} key={index}>
                    {isCheckbox ? (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!formValues[header.headerName]} // Boolean check for checked state
                            onChange={(e) =>
                              setFormValues({
                                ...formValues,
                                [header.headerName]: e.target.checked,
                              })
                            }
                            name={header.headerName}
                            sx={{ marginLeft: "0px", padding: "10px" }} // Adjust only the checkbox itself
                          />
                        }
                        label={header.headerName}
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                        }} // Consistent height for the label
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label={header.headerName}
                        name={header.headerName}
                        variant="outlined"
                        value={formValues[header.headerName] || ""}
                        onChange={handleInputChange}
                        type={type}
                        inputProps={inputProps}
                        InputProps={InputProps}
                        sx={{ height: "56px" }} // Ensuring TextField height matches others
                      />
                    )}
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Typography>No processed headers available</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Toaster />
    </Container>
  );
};

export default styled(InsertFormPrompt)({});

export {}; // Add this empty export statement
