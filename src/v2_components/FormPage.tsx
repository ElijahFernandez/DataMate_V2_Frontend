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
  Popover,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import TrashIcon from "@mui/icons-material/Delete";

interface FormPageProps {
  startLoading: () => void;
  stopLoading: () => void;
}

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
  const [formEntity, setFormEntity] = useState<FormEntity | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [anchorElEdit, setAnchorElEdit] = useState<null | HTMLElement>(null);
  const openEdit = Boolean(anchorElEdit);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFormEntity = async () => {
      if (formId) {
        startLoading();
        setIsLoading(true);
        try {
          const response = await axios.get(`http://localhost:8080/getForms/${formId}`);
          setFormEntity(response.data);
          initializeFormData(response.data.headers); // Initialize form data here
          console.log("Fetched Form Entity:", response.data);
          console.log("Fetched Form Table name:", response.data.tblName);
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

    const emptyFields = Object.values(formData).some((value) => value.trim() === "");
    if (emptyFields) {
      toast.error("Please fill out all the fields before submitting.");
      return;
    }

    const payload = {
      tableName: formEntity?.tblName,
      headers: Object.keys(formData),
      values: Object.values(formData),
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
      } else {
        toast.error("Failed to submit form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEditClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElEdit(event.currentTarget);
  };

  const handleOnClickIcon = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseEditPop = () => {
    setAnchorElEdit(null);
  };

  const handleEditPopOverClick = () => {
    if (formEntity) {
      navigate(`/forms/${formEntity.formId}/edit`);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!formEntity) {
    return <Typography>Form not found</Typography>;
  }

  const headers = JSON.parse(formEntity.headers);

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 15 }}>
      <Toaster />
      <IconButton sx={{ position: "absolute", top: 80, right: 20 }} onClick={handleOnClickIcon}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            setOpenModal(true);
            handleCloseMenu();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
      <Paper elevation={3} sx={{ p: 3, position: "relative" }}>
        <Popover
          open={openEdit}
          anchorEl={anchorElEdit}
          onClose={handleCloseEditPop}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          sx={{
            ".MuiPaper-root": {
              borderRadius: "20px",
              p: 2,
            },
          }}
        >
          <Typography variant="body1">Do you want to edit?</Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              onClick={() => {
                handleEditPopOverClick();
                handleCloseEditPop();
              }}
              sx={{ mr: 2 }}
            >
              Edit
            </Button>
            <Button onClick={handleCloseEditPop} variant="outlined">
              Cancel
            </Button>
          </Box>
        </Popover>

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

      <Box
        onClick={handleEditClick}
        sx={{
          position: "absolute",
          bottom: 50,
          right: 50,
          bgcolor: "primary.main",
          borderRadius: "50%",
          p: 1,
          cursor: "pointer",
        }}
      >
        <IconButton sx={{ color: "white" }}>
          <EditIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Box>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
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
                  console.log(response.data);
                  setOpenModal(false);
                  navigate("/forms");
                } catch (error) {
                  console.error("Error deleting form:", error);
                }
              }}
              sx={{ mr: 2 }}
            >
              Yes
            </Button>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
