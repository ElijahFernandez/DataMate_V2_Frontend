import { useLocation } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from "react";
import { Box, Button, Paper, CircularProgress, Modal, TextField } from "@mui/material";
import ReactDataGrid from "@inovua/reactdatagrid-community";

// Define props interface to include startLoading and stopLoading
interface ReportPageProps {
  startLoading: () => void;
  stopLoading: () => void;
}

interface ReportEntity {
    reportId: number;
    reportName: string;
    reportCode: string;
    userId: number;
}

interface HeaderConfig {
    name: string;
    header: string;
    defaultVisible?: boolean;
    defaultFlex: number;
    headerProps?: {
      style: {
        backgroundColor: string;
        color: string;
        fontWeight: string;
      };
    };
  }

export default function ReportPage({ startLoading, stopLoading }: ReportPageProps) {
  const loc = useLocation();
  const rprtId = loc.state.rprtid;
  const [reportId, setReportId] = useState<number | null>(null);
  const [reportName, setReportName] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);
  const rprtHeight = reportData.length * 47;
  const [colsData, setColsData] = useState<HeaderConfig[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const handleRenameModalOpen = () => setRenameModalOpen(true);
  const handleRenameModalClose = () => setRenameModalOpen(false);

  const [newName, setNewName] = useState("");

  const handleRenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
  };

  const handleRenameSubmit = () => {
    handleRenameReport();
    console.log("Rename: ", newName);
    handleDeleteModalClose(); // Close the modal after renaming
  };

  // Function to fetch the report entity from the backend
  async function getReportEntity(rprtid: number): Promise<ReportEntity | null> {
    try {
        const response = await axios.get(`http://localhost:8080/getReports?rprtId=${rprtid}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching report entity:", error);
      return null;
    }
  }

  const handleDeleteReport = async () => {
    try {
        const response = await axios.delete(`http://localhost:8080/deleteReport?rprtId=${reportId}`);
        console.log("Delete Report Response:", response.data);
        handleDeleteModalClose(); // Close the modal after deletion
        alert("Report successfully deleted!");
        window.location.href = "http://localhost:3000/reports"; 
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleRenameReport = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/rename/${reportId}`, {
        newReportName: newName, // Pass the new report name
      });
      console.log("Rename Report Response:", response.data);
      handleRenameModalClose(); // Close the modal after renaming
      alert("Report successfully renamed!");
      window.location.href = "http://localhost:3000/reports"; 
    } catch (error) {
      console.error("Error renaming report:", error);
    }
  };

//   // Function to fetch report data based on report ID
//   async function fetchReportData(reportId: number) {
//     try {
//       const response = await axios.get(`http://localhost:8080/executeReportQueryById/${reportId}`);
//       console.log("Report Data:", response.data);
//       setReportData(response.data);
//     } catch (error) {
//       console.error("Error fetching report data:", error);
//     }
//   }

   // Fetch the report entity once, and update the reportId and reportName
   useEffect(() => {
    const fetchReportEntity = async () => {
    //   startLoading();
      const entity = await getReportEntity(rprtId);
      if (entity) {
        setReportName(entity.reportName);
        setReportId(entity.reportId); // Update reportId here
        console.log("Fetched Report Entity:", entity);
      }
    //   stopLoading();
    };
    fetchReportEntity();
  }, [rprtId]);

//   // Fetch the report data only when reportId is set and not null
//   useEffect(() => {
//     if (reportId !== null) {
//       fetchReportData(reportId);
//     }
//   }, [reportId]);  // Trigger only when reportId is updated

useEffect(() => {
    // Fetching report data
    async function fetchReportData() {
      try {
        const response = await axios.get(`http://localhost:8080/executeReportQueryById/${reportId}`);
        const reportData = response.data; // Assume this is the structure you get
        console.log("Fetched Report Data:", reportData);
  
        // Set the columns based on the keys of the first report object
        if (reportData.length > 0) {
          const firstRow = reportData[0];
          const newColsData = Object.keys(firstRow).map((key) => ({
            name: key,
            header: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize header
            defaultFlex: 1, // Or set a specific flex value
          }));
          setColsData(newColsData);
        }
  
        // Set report data after defining columns
        setReportData(reportData);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    }
  
    fetchReportData();
  }, [reportId]); // Add any dependencies you need here
  

  return (
    <>
      <Box sx={{ height: "85vh", margin: "1em", marginTop: "5em" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <h1 style={{ margin: 5 }}>Report Name: {reportName}</h1>
              {/* <div className="iconTab" onClick={handleExport} style={{ display: "flex", fontSize: "18px", alignSelf: "flex-end", cursor: "pointer", }}>EXPORT AS SQL</div> */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <Button variant="outlined" onClick={handleRenameModalOpen} sx={{ margin: '10px' }}>
                    RENAME REPORT
                </Button>
                <Button variant="outlined" onClick={handleDeleteModalOpen} sx={{ margin: '10px' }}>
                    DELETE REPORT
                </Button>
              </Box>
            </Box>
            <Box
            sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginTop: 0,
            }}
            >
                <Box
                    style={{
                    backgroundColor: "#BAD1BE",
                    width: "100%",
                    display: "flex",
                    }}
                >
                    <div
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                    }}
                    >
                    {/* for table preview */}
                    {reportData.length > 0 ? (
                        <Paper
                        elevation={0}
                        sx={{
                            maxHeight: "500px",
                            width: "100%",
                            margin: ".3em",
                            borderColor: "#347845",
                        }}
                        >
                        <ReactDataGrid
                            idProperty="id"
                            style={{
                            width: "100%",
                            height: rprtHeight,
                            maxHeight: 450,
                            }}
                            columns={colsData}
                            dataSource={reportData}
                            theme="green-light"
                        />
                        </Paper>
                    ) : (
                        <CircularProgress size="10rem" />
                    )}
                    </div>
                </Box>
            </Box>
            <Modal
            open={deleteModalOpen}
            onClose={handleDeleteModalClose}
            aria-labelledby="delete-confirmation-title"
            aria-describedby="delete-confirmation-description"
            >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <Box sx={{ bgcolor: 'white', padding: '2em', borderRadius: '8px', boxShadow: 24 }}>
                <h2 id="delete-confirmation-title">Delete Report</h2>
                <p id="delete-confirmation-description">
                    Are you sure you want to delete this report? This can't be undone.
                </p>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleDeleteModalClose} variant="outlined" sx={{ marginRight: '1em' }}>
                    Cancel
                    </Button>
                    <Button onClick={handleDeleteReport} variant="contained" color="error">
                    Delete
                    </Button>
                </Box>
                </Box>
            </Box>
            </Modal>
            <Modal 
            open={renameModalOpen} 
            onClose={handleRenameModalClose} 
            aria-labelledby="rename-modal-title" 
            aria-describedby="rename-modal-description">
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <Box sx={{ bgcolor: "white", padding: "2em", borderRadius: "8px", boxShadow: 24, width: "400px" }}>
                  <h2 id="rename-modal-title">Rename Report</h2>
                  <p id="rename-modal-description">Enter a new name for the report below:</p>
                  <TextField
                    fullWidth
                    label="New Report Name"
                    value={newName}
                    onChange={handleRenameChange}
                    sx={{ marginBottom: "1.5em" }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button onClick={handleRenameModalClose} variant="outlined" sx={{ marginRight: '1em' }}>
                    Cancel
                    </Button>
                    <Button onClick={handleRenameSubmit} variant="contained" color="primary">
                      Rename
                    </Button>
                  </Box>  
                </Box>
              </Box>
            </Modal>
          </Box>
    </>
  );
}
