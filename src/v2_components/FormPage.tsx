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
import FormService from "../services/FormService";

interface FormPageProps {
  startLoading: () => void;
  stopLoading: () => void;
}

interface FormEntity {
  formId: number;
  dbName: string;
  tblName: string;
  formName: string;
  formType: string;
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
  const { formId } = useParams<{ formId: string }>();
  const formIdFromLocation = loc.state?.formid || null; // Get formId from location state
  const [formData, setFormData] = useState<FormData>({});
  const [formEntity, setFormEntity] = useState<FormEntity | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElEdit, setAnchorElEdit] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const open = Boolean(anchorEl);
  const openEdit = Boolean(anchorElEdit);

  const settingsManagerRef = useRef(CustomSettingsManager);

  const [customSettings, setCustomSettings] = useState<CustomSettings>({
    theme: {
      primary: "#ECDFCC",
      light: "rgba(252, 250, 238, 0.6)",
    },
    form_title_fontsize: "",
    form_title_align: "left",
    submit_button_width: "small",
    submit_button_align: "left",
    definition: "",
    shrinkForm: "false",
  });

  const [isInsert, setIsInsert] = useState(false);
  const [isModify, setIsModify] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const [columnNameId, setColumnNameId] = useState("");
  const [allIds, setAllIds] = useState<string[]>([]); // State to store IDs

  // const [availableIds, setAvailableIds] = useState<string[]>([]);

  // const fetchAvailableIds = async () => {
  //   try {
  //     const response = await axios.get(`http://localhost:8080/getAvailableIds?tableName=${formEntity?.tblName}`);
  //     setAvailableIds(response.data);
  //   } catch (error) {
  //     console.error("Error fetching available IDs:", error);
  //     toast.error("Failed to fetch available IDs");
  //   }
  // };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        await settingsManagerRef.current.fetchSettings(Number(formId));
        const fetchedSettings = settingsManagerRef.current.getSettings();
        setCustomSettings(fetchedSettings);
        console.log("Fetched and updated custom settings:", fetchedSettings);
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
          initializeFormData(response.data.headers);
          console.log("Fetched Form Entity:", response.data);
          console.log("Fetched Form Table name:", response.data.tblName);
          console.log("Fetched Form Headers: ", response.data.headers);

          const headersJson = JSON.parse(response.data.headers);
          const fetchedColumnNameId = Object.keys(headersJson).find(
            (key) => headersJson[key] === "ID"
          );
          console.log("ID Key for Column: ", fetchedColumnNameId);

          if (fetchedColumnNameId) {
            setColumnNameId(fetchedColumnNameId);
          } else {
            console.error("ID Key for Column not found");
          }

          const fetchedFormEntity = response.data;

          setIsInsert(fetchedFormEntity.formType === "Insert");
          setIsModify(fetchedFormEntity.formType === "Modify");
          setIsDelete(fetchedFormEntity.formType === "Delete");

          // Check if FormName has any quotation marks and remove them
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
    if (loc.state?.settingsSaved) {
      toast.success("Form Settings saved!");
      // Clear the state so the toast doesn't show again on refresh
      navigate(loc.pathname, { replace: true, state: {} });
    }
  }, [loc, navigate]);

  useEffect(() => {
    // Fetch IDs if in modify mode and columnNameId is set
    if (isModify && columnNameId) {
      fetchAllIds(columnNameId, "your_table_name"); // Replace 'your_table_name' with the actual table name
    }
  }, [isModify, columnNameId]);

  const fetchAllIds = async (idKeyColumn: string, tableName: string) => {
    try {
      const ids = await FormService.getAllIds(idKeyColumn, tableName);
      if (ids) {
        setAllIds(ids);
      }
    } catch (error) {
      console.error("Error fetching IDs: ", error);
    }
  };

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

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>, key: string) => {
    setFormData({
      ...formData,
      [key]: event.target.value as string,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    if (isInsert) {
      handleInsertSubmit(event);
    } else if (isModify) {
      handleModifySubmit(event);
    } else if (isDelete) {
      handleDeleteSubmit(event);
    } else {
      toast.error("Unknown form type");
    }
  };

  const handleInsertSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Insert form data to submit:", formData);

    const emptyFields = Object.values(formData).some(
      (value) => value.trim() === ""
    );
    if (emptyFields) {
      toast.error("Please fill out all the fields before submitting.");
      return;
    }

    const idValue = formData[columnNameId];

    const payload = {
      tableName: formEntity?.tblName,
      headers: Object.keys(formData),
      values: Object.values(formData),
    };

    try {
      const checkResponse = await fetch(
        `http://localhost:8080/check-id?tableName=${formEntity?.tblName}&idColumn=${columnNameId}&idValue=${idValue}`
      );

      const idExists = await checkResponse.json();
      
      if (idExists) {
        toast.error("The ID already exists. Please use a unique ID.");
        return;
      }

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
      toast.error("An error occurred while submitting the form.");
    }
  };

  const handleModifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Modify form data to submit:", formData);
    toast("Modify functionality not implemented yet.");
    // TODO: Implement modify logic
  };

  const handleDeleteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Delete form data to submit:", formData);
    toast("Delete functionality not implemented yet.");
    // TODO: Implement delete logic
  };

  // const handleSubmit = async (event: React.FormEvent) => {
  //   event.preventDefault();
  //   console.log("Form data to submit:", formData);

  //   const emptyFields = Object.values(formData).some(
  //     (value) => value.trim() === ""
  //   );
  //   if (emptyFields) {
  //     toast.error("Please fill out all the fields before submitting.");
  //     return;
  //   }

  //   const payload = {
  //     tableName: formEntity?.tblName,
  //     headers: Object.keys(formData),
  //     values: Object.values(formData),
  //   };

  //   try {
  //     const response = await fetch("http://localhost:8080/insert", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });
  //     if (response.ok) {
  //       toast.success("Form submitted successfully!");
  //     } else {
  //       toast.error("Failed to submit form.");
  //     }
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //   }
  // };

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
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
        <Paper
          elevation={3}
          sx={{
            p: 5,
            borderTop: "10px solid" + customSettings.theme.primary,
          }}
        >
          <Toaster position="top-center" reverseOrder={false} />

          <Typography
            variant="h4"
            gutterBottom
            align={customSettings.form_title_align}
          >
            {formEntity.formName}
          </Typography>
          {/* <Typography variant="body2" gutterBottom>
            {formEntity.tblName +
              " | " +
              formEntity.createdAt +
              " | " +
              formEntity.formType}
          </Typography> */}
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
                size={
                  customSettings.submit_button_width === "fullWidth"
                    ? "medium"
                    : customSettings.submit_button_width
                }
                sx={{
                  width:
                    customSettings.submit_button_width === "fullWidth"
                      ? "100%"
                      : "auto",
                  backgroundColor: customSettings.theme.primary,
                  "&:hover": {
                    backgroundColor: customSettings.theme.primary,
                    color: "#fff",
                  },
                  transition: "background-color 0.3s, color 0.3s",
                }}
              >
                {isInsert
                  ? "Submit"
                  : isModify
                  ? "Modify"
                  : isDelete
                  ? "Delete"
                  : "Submit"}
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

        {/* <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
          <MenuItem
            onClick={() => {
              setOpenModal(true);
              handleCloseMenu();
            }}
          >
            Delete
          </MenuItem>
        </Menu> */}
      </Box>
    </Box>
  );
}
