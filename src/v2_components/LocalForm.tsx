import * as React from "react";
import Logo from "../images/logowhite.png";
import { Toaster, toast } from 'react-hot-toast';

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
import noRecentFiles from "../images/noRecentFiless.png";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function LocalForm() {
  const location = useLocation();
  const headers = location.state?.headers || [];
  const tblName = location.state?.tableName || "";
  const dirtyHeaders = location.state?.dirtyHeaders || [];
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(""); // State for error handling
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  // --------DataMate V2 Increment---------
  // const [dirtyHeaders, setDirtyHeaders] = useState<string[]>([]);

  // const handleSubmit = (e: React.SyntheticEvent) => {
  //   e.preventDefault();
  //   // Here you can handle form submission, for example, sending data to the server
  //   console.log("Form values:", formValues);
  // };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log('Form values:', formValues);
    try {
      const response = await axios.post('http://localhost:8080/insert', {
        tableName: tblName,
        headers: dirtyHeaders,
        values: Object.values(formValues),
      });
  
      console.log('Data inserted successfully');
      toast.success('Record inserted successfully!'); // Show success toast
      setFormValues({}); // Reset form values
    } catch (error) {
      console.error('Error inserting data:', error);
      setError('An error occurred while inserting data.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log("Headers:", headers);
    console.log("Table Name:", tblName);
    console.log("Dirty Headers:", dirtyHeaders);
  }, [headers, tblName, dirtyHeaders]);

  return (
    <Grid container sx={{ mt: { xs: 7, sm: 8, md: 8 } }} direction="column">
      <Box className="gradientbg">{/* Your Logo and Text */}</Box>
      <Toaster />
      <Container maxWidth="md">
        <Box sx={{ flexGrow: 1, mt: 3 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, textAlign: "center" }}
              >
                <b>{tblName}</b>
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ padding: 2, minHeight: "400px" }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {dirtyHeaders.map((header: string, index: number) => (
                    <Grid item xs={12} key={index}>
                      <TextField
                        fullWidth
                        label={header} // Assuming header is the label for the input field
                        name={header}
                        variant="outlined"
                        onChange={handleInputChange}
                        // You can add more props based on the type of input field you want
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Submit
                    </Button>
                    {error && (
                      <Typography
                        variant="body1"
                        component="div"
                        sx={{ color: "red", marginTop: 2 }}
                      >
                        {error}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
