import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "../components/Sidebar"; // Import the Sidebar component
import SaveIcon from "@mui/icons-material/Save"; // Import the Edit icon
import CustomSettingsManager from "../services/CustomSettingsService"; // Import the CustomSettingsManager and CustomSettings
import { CustomSettings } from "../api/dataTypes";

import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // Add this for the triple-dot icon
import PlusIcon from "@mui/icons-material/Add"; // Add this for the plus icon
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

export default function FormEditPage({
  startLoading,
  stopLoading,
}: FormPageProps) {
  const loc = useLocation();
  const navigate = useNavigate();

  const formIdFromLocation = loc.state?.formid || null; // Get formId from location state
  const { formId } = useParams<{ formId: string }>();
  const [formData, setFormData] = useState<FormData>({});
  const [formEntity, setFormEntity] = useState<FormEntity | null>(null); // To store the fetched form data

  const [openModal, setOpenModal] = useState(false); // State for controlling the modal visibility
  const [openSaveModal, setOpenSaveModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [isLoading, setIsLoading] = useState(true);

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedFieldType, setSelectedFieldType] = useState<string | null>(
    null
  );
  const formRef = useRef<HTMLDivElement>(null);

  const [fieldStyles, setFieldStyles] = useState<any>({});

  const [addingDefinition, setAddingDefinition] = useState(false); // State to toggle the add definition input
  const [definition, setDefinition] = useState(""); // State to store the user's definition
  const [tempDefinition, setTempDefinition] = useState(""); // Temporary state for input

  const settingsManagerRef = useRef(CustomSettingsManager);

  const [customSettings, setCustomSettings] = useState<CustomSettings>({
    theme: {
      primary: "#ECDFCC", // Example primary color
      light: "rgba(252, 250, 238, 0.6)", // Example lighter color with opacity
    },
    form_title_align: "left",
    submit_button_width: "small",
    submit_button_align: "left",
    definition: "",
    shrinkForm: "false",
  });

  // useEffect to fetch custom settings and is stored to customSettings
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
  // useEffect to fetch form entity
  useEffect(() => {
    const fetchFormEntity = async () => {
      if (formId) {
        startLoading();
        setIsLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8080/getForms/${formId}`
          );
          const fetchedFormEntity = response.data;

          // Remove quotation marks from formName if they exist
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
          setFormEntity(fetchedFormEntity);
          // console.log("Fetched Form Entity:", formResponse.data);
        } catch (error) {
          console.error("Error fetching form entity or settings:", error);
        } finally {
          stopLoading();
          setIsLoading(false);
        }
      }
    };

    fetchFormEntity();
  }, [formId, startLoading, stopLoading]);

  // useEffect to handle clicks outside of form
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (formRef.current && !formRef.current.contains(event.target as Node)) {
  //       handleFieldClick("", "");
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  const handleAddClick = () => {
    // setAddingDefinition(true); // Show the input field
    // setTempDefinition(definition); // Set the initial input value to the current definition
    setAddingDefinition(true);
    setTempDefinition(customSettings.definition);
  };

  const handleCancelClick = () => {
    setAddingDefinition(false); // Revert to showing the plus icon and typography
  };

  // const handleOkClick = () => {
  //   setDefinition(tempDefinition); // Save the input as the new definition
  //   setAddingDefinition(false); // Revert to showing the definition as typography
  //   setCustomSettings({
  //     // sets definition to customSettings for db to store
  //     ...customSettings,
  //     definition: tempDefinition,
  //   });
  // };
  const handleOkClick = () => {
    setCustomSettings({
      ...customSettings,
      definition: tempDefinition,
    });
    setAddingDefinition(false);
  };

  const handleTextFieldClick = (event: React.MouseEvent, key: string) => {
    event.stopPropagation();
    handleFieldClick(key, "textfield");
  };

  const handleFieldClick = (
    fieldName: string,
    fieldType: string,
    event?: React.MouseEvent
  ) => {
    if (event) {
      event.stopPropagation();
    }
    console.log("Selected Field clicked:", fieldName);
    console.log("Selected Field type:", fieldType);
    setSelectedField(fieldName);
    setSelectedFieldType(fieldType);
  };

  const handleSave = async () => {
    console.log("Saving changes...");
    console.log("Will Save Custom Settings:", customSettings);

    // Stringify the customSettings
    const stringifiedSettings = JSON.stringify(customSettings);

    try {
      await CustomSettingsManager.saveSettings(
        Number(formId),
        stringifiedSettings
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
    navigate(`/forms/${formId}`, { state: { settingsSaved: true } });
    setOpenSaveModal(false);
  };

  const handleOnClickIcon = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Open menu on click
  };
  const handleCloseMenu = () => {
    setAnchorEl(null); // Close menu
  };

  const updateFormName = useCallback((newName: string) => {
    setFormEntity((prevEntity) => {
      if (prevEntity) {
        return { ...prevEntity, formName: newName };
      }
      return prevEntity;
    });
  }, []);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!formEntity) {
    return <Typography>Form not found</Typography>;
  }

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
      }}
    >
      <Box sx={{ maxWidth: 600, margin: "auto", pt: 15 }} ref={formRef}>
        <Paper
          onClick={(e) => handleFieldClick("form field", "form", e)}
          elevation={3}
          sx={{
            p: 3,
            borderTop: "10px solid" + customSettings.theme.primary,
            position: "relative",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "whitesmoke",
              transition: "background-color 0.5s ease", // Smooth transition effect
            },
          }}
        >
          <Box
            onClick={(e) => {
              e.stopPropagation();
              handleFieldClick(formEntity.formName, "form title");
            }}
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "lightgray",
              },
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              align={customSettings.form_title_align} // set form title dynamically
            >
              {formEntity.formName}
            </Typography>
          </Box>

          {/* Conditionally render the definition input or the plus icon */}
          {!addingDefinition ? (
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <IconButton onClick={handleAddClick}>
                <PlusIcon />
              </IconButton>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {customSettings.definition ||
                  "add a small definition for the form"}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", mb: 1.5 }}>
              <TextField
                fullWidth
                label="Form Definition"
                value={tempDefinition}
                onChange={(e) => setTempDefinition(e.target.value)}
                margin="normal"
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button variant="outlined" onClick={handleCancelClick}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleOkClick}>
                  OK
                </Button>
              </Box>
            </Box>
          )}

          {Object.entries(headers).map(([key, value]) => (
            <Box
              key={key}
              // onMouseEnter={(e) => e.stopPropagation()} // Prevent hover propagation from TextField
              // onClick={() => handleFieldClick(key, "textfield")}
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={(e) => e.stopPropagation()} // Stop hover propagation
              onMouseLeave={(e) => e.stopPropagation()} // Stop hover propagation
              sx={{
                position: "relative",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.05)", // Your hover color
                  paddingLeft: 2, // Extend left side
                  paddingRight: 2, // Extend right side
                  marginLeft: "-16px", // Adjust margin for left overlap
                  marginRight: "-16px", // Adjust margin for right overlap
                  borderRadius: "8px", // To have rounded corners
                  transition: "background-color 0.3s ease", // Smooth transition effect
                },
              }}
            >
              <TextField
                onClick={(e) => handleTextFieldClick(e, key)}
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
                // onChange={handleInputChange}
                // disabled
                type={value as string}
                InputProps={{
                  sx: {
                    backgroundColor: "background.paper", // Keeps the original background color
                    opacity: 1, // Ensures the text field is fully opaque
                    "& .MuiInputBase-input": {
                      WebkitTextFillColor: "inherit", // Keeps text color
                      // Add any other styles you want to maintain the appearance
                    },
                  },
                }}
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
            </Box>
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
              // onClick={handleSubmit}
              onClick={(e) => {
                e.stopPropagation(); // Prevent the event from bubbling
                handleFieldClick("submit", "button"); // Handle field click when TextField is clicked
              }}
              type="submit"
              variant="contained"
              color="primary"
              size={customSettings.submit_button_width === "fullWidth" ? "medium" : customSettings.submit_button_width}
              sx={{
                width: customSettings.submit_button_width === "fullWidth" ? "100%" : "auto",
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
        </Paper>

        {/* Modals, extensions, etc. */}
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
        {/* Sidebar for editing */}
        <Sidebar
          selectedField={selectedField}
          selectedFieldType={selectedFieldType}
          customSettings={customSettings}
          startLoading={startLoading}
          stopLoading={stopLoading}
          setCustomSettings={setCustomSettings}
          updateFormName={updateFormName} // Add this new prop
        />
        {/* Edit Icon */}
        <Box
          // onClick={handleEditClick}
          sx={{
            position: "absolute",
            bottom: 50,
            right: 50,
            bgcolor: "primary.main", // Background color (you can adjust this)
            borderRadius: "50%", // Circle shape
            p: 1, // Padding to create spacing around the icon
            cursor: "pointer", // Change cursor to pointer on hover
          }}
        >
          <Tooltip title="Save" placement="top" arrow>
            <IconButton
              onClick={() => setOpenSaveModal(true)}
              sx={{
                color: "white", // Icon color
              }}
            >
              <SaveIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </Tooltip>
        </Box>
        {/* Save Changes Modal */}
        <Modal open={openSaveModal} onClose={() => setOpenSaveModal(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>
              Do you want to save changes?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ mr: 2 }}
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                onClick={() => setOpenSaveModal(false)}
              >
                No
              </Button>
            </Box>
          </Box>
        </Modal>
        <IconButton
          onClick={() => console.log(customSettings)}
          sx={{
            color: "black", // Icon color
            ml: 2, // Margin left to separate from the save icon
          }}
        >
          <PlusIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
