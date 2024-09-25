import * as React from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Modal,
  Stack,
  TextField,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  CardContent,
  CircularProgress,
} from "@mui/material";

import { Toaster, toast } from 'react-hot-toast';
import noRecentFiles from "../images/noRecentFiless.png";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function GenerateForm() {
  const location = useLocation();
  
  const [editorHtml, setEditorHtml] = useState(""); // State for the HTML editor content
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query
  const [formOutput, setFormOutput] = useState(""); // State for the API response
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(""); // State for error handling
  

  // --------DataMate V2 Increment---------
  const [dirtyHeaders, setDirtyHeaders] = useState<string[]>([]);
  const navigate = useNavigate();
  const headers = location.state?.headers || [];
  const tblName = location.state?.tableName || "";

  
  // useEffect(() => {
  //   console.log("Headers:", headers);
  //   console.log("Table name:", tblName);
  //   if (headers.length > 0) {
  //     setIsLoading(true); // Set loading state to true before making the API call
  //     setError(""); // Reset error state

  //     axios
  //       .post("http://localhost:8080/api/headers", headers)
  //       .then((response) => {
  //         console.log("API Response:", response.data);
  //         setFormOutput(response.data);
  //         setIsLoading(false); // Set loading state to false after receiving the API response
  //       })
  //       .catch((error) => {
  //         console.error("There was an error!", error);
  //         setError("An error occurred while processing the headers."); // Set error state
  //         setIsLoading(false); // Set loading state to false if there's an error
  //       });
  //   }
  // }, [headers]);

  useEffect(() => {
    const savedHeaders = localStorage.getItem('headers');
    const savedFormOutput = localStorage.getItem('formOutput');

    console.log("Headers:", headers);
    console.log("Table name:", tblName);
    console.log("Dirty Headers:", dirtyHeaders);
    
    if (savedHeaders && JSON.parse(savedHeaders).toString() === headers.toString()) {
      // If headers haven't changed, use the saved form output
      setFormOutput(savedFormOutput || "");
    } else {
      if (headers.length > 0) {
      setIsLoading(true);
      setError("");

      axios
        .post("http://localhost:8080/api/headers", headers)
        .then((response) => {
          console.log("API Response:", response.data);
          setFormOutput(response.data);
          setIsLoading(false);

          // Make the second axios call for column headers
          axios
            .get(`http://localhost:8080/columns?tableName=${tblName}`)
            .then((response) => {
              console.log("Column headers:", response.data);
              setDirtyHeaders(response.data);
            })
            .catch((error) => {
              console.error("Error fetching column headers:", error);
            });
        })
        .catch((error) => {
          console.error("There was an error!", error);
          setError("An error occurred while processing the headers.");
          setIsLoading(false);
        });
      }
    }
  }, [headers, tblName]);


  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(formOutput)
      .then(() => {
        // alert("Copied to clipboard!");
        toast.success('Copied to clipboard!'); // Show success toast
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const handleSaveLocally = () => {
    navigate('/localform', { state: { tableName: tblName, headers: headers, dirtyHeaders: dirtyHeaders } });
  };


  return (
    <Grid container sx={{ mt: { xs: 7, sm: 8, md: 8 } }} direction="column">
      <Box className="gradientbg">
      <Toaster />
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ pt: 3 }}
        >
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: { xs: 30, sm: 45, md: 50 },
            }}
          >
            Embedded Form Generator
          </Typography>
          <Typography
            sx={{
              textAlign: "center",
              color: "white",
              fontSize: { xs: 16, sm: 18, md: 20 },
              py: 3,
              px: { xs: 5 },
            }}
          >
            Add some forms in your website!
          </Typography>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 2 }}
          ></Grid>
        </Stack>
      </Box>
      <Container maxWidth="xl">
        <Box sx={{ flexGrow: 1, mt: 3 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                HTML Editor
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 2, minHeight: "400px" }}>
              <Typography variant="h6">Generated Form for <b>{tblName}</b></Typography>

              <Button
                variant="contained"
                color="primary"
                onClick={handleCopyToClipboard}
                sx={{ mt: 2 }}
              >
                Copy to Clipboard
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveLocally}
                sx={{ mt: 2, marginLeft: 2 }}
              >
                Save Locally
              </Button>
              
              {isLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "300px",
                  }}
                >
                  <CircularProgress /> {/* Loading animation */}
                </Box>
              ) : error ? (
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ whiteSpace: "pre-wrap", marginTop: 2, color: "red" }}
                >
                  {error}
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ whiteSpace: "pre-wrap", marginTop: 2 }}
                >
                  {formOutput}
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 2, minHeight: "400px" }}>
              <Typography variant="h6">What it would look like:</Typography>
              {isLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "300px",
                  }}
                >
                  <CircularProgress /> {/* Loading animation */}
                </Box>
              ) : error ? (
                <Typography
                  variant="body1"
                  component="div"   
                  sx={{ whiteSpace: "pre-wrap", marginTop: 2, color: "red" }}
                >
                  {error}
                </Typography>
              ) : (
                <Box
                  sx={{ marginTop: 2 }}
                  dangerouslySetInnerHTML={{ __html: formOutput }}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
        
      </Container>
    </Grid>
  );
}