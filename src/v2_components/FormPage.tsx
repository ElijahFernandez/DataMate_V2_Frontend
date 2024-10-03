import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Modal,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // Add this for the triple-dot icon

// Define props interface to include startLoading and stopLoading
interface FormPageProps {
  startLoading: () => void;
  stopLoading: () => void;
}

// Define the FormEntity interface
interface FormEntity {
  formId: number;
  dbName: string;
  tblName: string;
  formName: string;
  headers: string;
  customSettings: string;
  userId: number;
  createdAt: string;
}

interface FormData {
  [key: string]: string;
}

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
};

export default function FormPage({ startLoading, stopLoading }: FormPageProps) {
  const loc = useLocation();
  const navigate = useNavigate();

  const formIdFromLocation = loc.state?.formid || null; // Get formId from location state
  const { formId } = useParams<{ formId: string }>();
  const [formData, setFormData] = useState<FormData>({});
  const [formEntity, setFormEntity] = useState<FormEntity | null>(null); // To store the fetched form data

  const [openModal, setOpenModal] = useState(false); // State for controlling the modal visibility

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFormEntity = async () => {
      if (formId) {
        startLoading();
        setIsLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8080/getForms/${formId}`
          );
          setFormEntity(response.data);
          console.log("Fetched Form Entity:", response.data);
          console.log("Fetched Form Entity:", response.data.tblName);

          initializeFormData(response.data.headers);
        } catch (error) {
          console.error("Error fetching form entity:", error);
        } finally {
          stopLoading();
          setIsLoading(false);
        }
      }
    };

    fetchFormEntity();
  }, [formId, startLoading, stopLoading]);

  const initializeFormData = (headersString: string) => {
    const headers = JSON.parse(headersString);
    const initialData: FormData = {};
    Object.keys(headers).forEach((key) => {
      initialData[key] = "";
    });
    setFormData(initialData);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form data to submit:", formData);

    const payload = {
      tableName: formEntity?.tblName,
      headers: Object.keys(formData),
      values: Object.values(formData),
    }

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
      } else {
        toast.error("Failed to submit form.");
      }
    } catch (error) {
    }
  };

  // Function to handle triple-dot icon click
  const handleOnClickIcon = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Open menu on click
  };
  const handleCloseMenu = () => {
    setAnchorEl(null); // Close menu
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!formEntity) {
    return <Typography>Form not found</Typography>;
  }

  const headers = JSON.parse(formEntity.headers);
  // Fetch the form entity from the API
  // async function getFormEntity(formId: number): Promise<FormEntity | null> {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:8080/getForms/${formId}`
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error fetching form entity:", error);
  //     return null;
  //   }
  // }

  // // useEffect to fetch the form data on component mount or when formId changes
  // useEffect(() => {
  //   const fetchFormEntity = async () => {
  //     console.log("form id: ", formId);
  //     if (formId) {
  //       // Only fetch if formId exists
  //       startLoading();
  //       const entity = await getFormEntity(formId);
  //       if (entity) {
  //         setFormEntity(entity); // Set the fetched form data to formEntity
  //         console.log("Fetched Form Entity:", entity);
  //       }
  //       stopLoading();
  //     }
  //   };

  //   fetchFormEntity();
  // }, [formId, startLoading, stopLoading]);

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 15 }}>
      <Paper elevation={3} sx={{ p: 3, position: "relative" }}>
        <IconButton
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={handleOnClickIcon}
        >
          <MoreVertIcon />
        </IconButton>

        {/* Menu for the triple-dot icon */}
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
          <MenuItem onClick={async () => {}}>Edit</MenuItem>
          <MenuItem
            onClick={() => {
              setOpenModal(true);
              handleCloseMenu();
            }}
          >
            Delete
          </MenuItem>
        </Menu>
        
        <Typography variant="h4" gutterBottom>
          {formEntity.formName}
        </Typography>
        <form onSubmit={handleSubmit}>
          {Object.entries(headers).map(([key, value]) => (
            <TextField
              key={key}
              fullWidth
              margin="normal"
              name={key}
              label={key as string}
              value={formData[key] || ""}
              onChange={handleInputChange}
              type={value as string}
            />
          ))}
          <Button
            onClick={handleSubmit}
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </form>
      </Paper>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)} // Close the modal on backdrop click
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Are you sure you want to delete this form?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={async () => {
                try {
                  const response = await axios.delete(
                    `http://localhost:8080/deleteForm`,
                    { params: { formId: formEntity?.formId } }
                  );
                  console.log(response.data); // Optionally log the success message
                  setOpenModal(false); // Close modal after deletion
                  navigate("/forms"); // Redirect to the /forms path
                } catch (error) {
                  console.error("Error deleting form:", error);
                  // You can handle the error (e.g., show a notification)
                }
              }}
              sx={{ mr: 2 }}
            >
              Yes
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenModal(false)} // Close modal without deleting
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
