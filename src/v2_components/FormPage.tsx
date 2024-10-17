import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
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

import CustomSettingsManager from "../services/CustomSettingsService";
import { CustomSettings } from "../api/dataTypes";

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

  const settingsManagerRef = useRef(CustomSettingsManager);
  const [customSettings, setCustomSettings] = useState<CustomSettings>({
    theme: {
      primary: "#ECDFCC", // Example primary color
      light: "rgba(252, 250, 238, 0.6)", // Example lighter color with opacity
    },
    form_title_fontsize: "",
    form_title_align: "left",
    submit_button_width: "",
    submit_button_align: "left",
    definition: "",
    shrinkForm: "false",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        await settingsManagerRef.current.fetchSettings(Number(formId)); // Wait for fetch to complete
        const fetchedSettings = settingsManagerRef.current.getSettings();
        setCustomSettings(fetchedSettings);
        console.log("Fetched and updated custom settings:", fetchedSettings); // Log right after setting the state
      } catch (error) {
        console.error("Error fetching custom settings:", error);
      }
    };

    fetchSettings();
  }, []);

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
          initializeFormData(response.data.headers); // Initialize form data here
          console.log("Fetched Form Entity:", response.data);
          console.log("Fetched Form Table name:", response.data.tblName);
          const fetchedFormEntity = response.data;
          if (fetchedFormEntity.formName) {
            fetchedFormEntity.formName = fetchedFormEntity.formName.replace(
              /^"|"$/g,
              ""
            );
          }
          // Parse and set custom settings
          if (fetchedFormEntity.customSettings) {
            const parsedSettings = JSON.parse(fetchedFormEntity.customSettings);
            setCustomSettings((prevSettings) => ({
              ...prevSettings,
              ...parsedSettings,
            }));
          }
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

  useEffect(() => {
    // Check if settings were just saved
    if (loc.state?.settingsSaved) {
      toast.success("Form Settings saved!");
      // Clear the state so the toast doesn't show again on refresh
      navigate(loc.pathname, { replace: true, state: {} });
    }
  }, [loc, navigate]);

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

    const emptyFields = Object.values(formData).some(
      (value) => value.trim() === ""
    );
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

  // utility function to parse headers
  function formatLabel(label: string): string {
    return label
      .split("_") // Split the string by underscores
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" "); // Join the words back together with spaces
  }

  const headers = JSON.parse(formEntity.headers);

  return (
    <Box
      sx={{
        backgroundColor: customSettings.theme.light,
        minHeight: "98vh",
        display: "flex",
        flexDirection: "column,",
      }}
    >
      <Box sx={{ maxWidth: 600, margin: "auto" }}>
        {/* <IconButton
        sx={{ position: "absolute", top: 80, right: 20 }}
        onClick={handleOnClickIcon}
      >
        <MoreVertIcon />
      </IconButton> */}
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
        <Paper
          elevation={3}
          sx={{
            p: 3,
            // position: "relative",
            // backgroundColor: "white",
          }}
        >
          <Toaster position="top-center" reverseOrder={false} />

          <Typography
            variant="h4"
            gutterBottom
            align={customSettings.form_title_align} // set form title dynamically
          >
            {formEntity.formName}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {customSettings.definition}
          </Typography>
          <form onSubmit={handleSubmit}>
            {Object.entries(headers).map(([key, value]) => (
              <TextField
                key={key}
                fullWidth
                margin="normal"
                name={key}
                placeholder={
                  customSettings.shrinkForm === "trueWithPlaceholder"
                    ? `Enter ${formatLabel(key as string)}`
                    : ""
                }
                label={formatLabel(key as string)}
                value={formData[key] || ""}
                onChange={handleInputChange}
                type={value as string}
                InputLabelProps={{
                  shrink:
                    value === "date"
                      ? true
                      : customSettings.shrinkForm === "true"
                      ? true
                      : customSettings.shrinkForm === "false"
                      ? false
                      : customSettings.shrinkForm === "trueWithPlaceholder"
                      ? true
                      : customSettings.shrinkForm === "noShrink"
                      ? undefined
                      : undefined,
                }}
              />
            ))}
            <Box
              sx={{
                display: "flex",
                // set button alignment dynamically
                justifyContent:
                  customSettings.submit_button_align === "left"
                    ? "flex-start"
                    : customSettings.submit_button_align === "right"
                    ? "flex-end"
                    : customSettings.submit_button_align === "center"
                    ? "center"
                    : "flex-start",
                mt: 2,
              }}
            >
              <Button
                onClick={handleSubmit}
                type="submit"
                variant="contained"
                sx={{
                  width: customSettings.submit_button_width,
                  backgroundColor: customSettings.theme.primary,
                  "&:hover": {
                    backgroundColor: customSettings.theme.primary, // Primary color on hover
                    color: "#fff", // White text color on hover
                  },
                  transition: "background-color 0.3s, color 0.3s", // Smooth transition effect
                }}
              >
                Submit
              </Button>
            </Box>
          </form> 
        </Paper>
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

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
    </Box>
  );
}
