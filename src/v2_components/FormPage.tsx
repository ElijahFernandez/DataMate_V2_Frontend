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
  Select,
  SelectChangeEvent,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CustomSettingsManager from "../services/CustomSettingsService";
import { CustomSettings } from "../api/dataTypes";
import FormService from "../services/FormService";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


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
  const [fetchedTblName, setFetchedTblName] = useState<string>("");
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
  const [dates, setDates] = useState<string[]>([]);
  const [allIds, setAllIds] = useState<string[]>([]); // State to store IDs

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
  
    const fetchData = async () => {
      if (!formId) return;
      
      setIsLoading(true);
      
      try {
        const [, fetchedFormEntity] = await Promise.all([
          settingsManagerRef.current.fetchSettings(Number(formId)),
          FormService.getFormById(formId)
        ]);
  
        if (signal.aborted) return;
  
        if (fetchedFormEntity) {
          // Destructure to simplify the code
          const { 
            headers, 
            tblName, 
            formType, 
            formName, 
            customSettings 
          } = fetchedFormEntity;
  
          // Process form entity
          setFormEntity(fetchedFormEntity);
          initializeFormData(headers);
          setFetchedTblName(tblName);
  
          const parsedHeaders = JSON.parse(headers);
          const fetchedColumnNameId = Object.keys(parsedHeaders).find(
            (key) => parsedHeaders[key] === "ID"
          );
  
          if (fetchedColumnNameId) {
            setColumnNameId(fetchedColumnNameId);
          }
  
          // Simplified form type setting
          setIsInsert(formType === "Insert");
          setIsModify(formType === "Modify");
          setIsDelete(formType === "Delete");
  
          // Clean form name
          const cleanedFormName = formName?.replace(/^"|"$/g, "");
  
          // Merge settings
          const parsedCustomSettings = customSettings 
            ? JSON.parse(customSettings) 
            : {};
          
          const combinedSettings = {
            ...parsedCustomSettings,
            ...(settingsManagerRef.current.getSettings() || {})
          };
  
          setCustomSettings(combinedSettings);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Error fetching data:", error);
          toast.error("Failed to fetch form details.");
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };
  
    fetchData();
    
    return () => {
      controller.abort();
    };
  }, [formId]);
  // useEffect(() => {
  //   let isMounted = true;

  //   const fetchSettings = async () => {
  //     try {
  //       await settingsManagerRef.current.fetchSettings(Number(formId));
  //       if (isMounted) {
  //         const fetchedSettings = settingsManagerRef.current.getSettings();
  //         setCustomSettings(fetchedSettings);
  //       }
  //     } catch (error) {
  //       if (isMounted) {
  //         console.error("Error fetching custom settings:", error);
  //       }
  //     }
  //   };

  //   fetchSettings();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [formId]); // Add formId to dependency array if it's used

  // useEffect(() => {
  //   let isMounted = true;

  //   const fetchFormEntity = async () => {
  //     if (!formId) return;
  //     setIsLoading(true);
  //     try {
  //       // const response = await axios.get(
  //       //   `http://localhost:8080/getForms/${formId}`
  //       // );
  //       const fetchedFormEntity = await FormService.getFormById(formId);
  //       if (isMounted) {
  //         if (!fetchedFormEntity) {
  //           toast.error("Form not found.");
  //           return;
  //         }
  //         setFormEntity(fetchedFormEntity);
  //         initializeFormData(fetchedFormEntity.headers);
  //         setFetchedTblName(fetchedFormEntity.tblName);

  //         console.log("Fetched Form Entity:", fetchedFormEntity);
  //         // console.log("Fetched Form Table name:", response.data.tblName);
  //         console.log("Fetched Form Headers: ", fetchedFormEntity.headers);
  //         const headers = JSON.parse(fetchedFormEntity.headers);

  //         const fetchedColumnNameId = Object.keys(headers).find(
  //           (key) => headers[key] === "ID"
  //         );
  //         console.log("ID Key for Column: ", fetchedColumnNameId);

  //         if (fetchedColumnNameId) {
  //           setColumnNameId(fetchedColumnNameId);
  //         } else {
  //           console.error("ID Key for Column not found");
  //         }

  //         const fetchedColumnDate = Object.keys(headers).find(
  //           (key) => headers[key] === "date"
  //         );
  //         console.log("ID Key for Column with date: ", fetchedColumnDate);

  //         setIsInsert(fetchedFormEntity.formType === "Insert");
  //         setIsModify(fetchedFormEntity.formType === "Modify");
  //         setIsDelete(fetchedFormEntity.formType === "Delete");

  //         // Check if FormName has any quotation marks and remove them
  //         if (fetchedFormEntity.formName) {
  //           fetchedFormEntity.formName = fetchedFormEntity.formName.replace(
  //             /^"|"$/g,
  //             ""
  //           );
  //         }
  //         // Parse and set custom settings
  //         if (fetchedFormEntity.customSettings) {
  //           const parsedSettings = JSON.parse(fetchedFormEntity.customSettings);
  //           setCustomSettings((prevSettings) => ({
  //             ...prevSettings,
  //             ...parsedSettings,
  //           }));
  //         }
  //       }
  //     } catch (error) {
  //       if (isMounted) {
  //         console.error("Error fetching form entity:", error);
  //         toast.error("Failed to fetch form details.");
  //       }
  //     } finally {
  //       if (isMounted) {
  //         setIsLoading(false);
  //       }
  //     }
  //   };

  //   fetchFormEntity();
  // }, [formId]);

  useEffect(() => {
    if (loc.state?.settingsSaved) {
      toast.success("Form Settings saved!");
      // Clear the state so the toast doesn't show again on refresh
      navigate(loc.pathname, { replace: true, state: {} });
    }
  }, [loc, navigate]);

  useEffect(() => {
    // Fetch IDs if in modify mode and columnNameId is set
    if ((isModify || isDelete) && columnNameId) {
      fetchAllIds(columnNameId, fetchedTblName);
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

  const convertDateFormat = (
    dateString: string,
    fromFormat: string,
    toFormat: string
  ) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    if (toFormat === "yyyy-MM-dd") {
      return date.toISOString().split("T")[0];
    } else if (toFormat === "MM/dd/yyyy") {
      return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
        .getDate()
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    }

    return dateString;
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
    const headerType = JSON.parse(formEntity?.headers || "{}")[name];

    setFormData((prevData) => ({
      ...prevData,
      [name]:
        headerType === "date"
          ? convertDateFormat(value, "yyyy-MM-dd", "MM/dd/yyyy")
          : value,
    }));
    // if (headerType === "date") {
    //   // Convert from yyyy-MM-dd to MM/dd/yyyy for storage
    //   const convertedValue = convertDateFormat(
    //     value,
    //     "yyyy-MM-dd",
    //     "MM/dd/yyyy"
    //   );
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     [name]: convertedValue,
    //   }));
    // } else {
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     [name]: value,
    //   }));
    // }
  };

  const handleSelectChange = async (
    event: SelectChangeEvent<string>,
    key: string
  ) => {
    const selectedId = event.target.value as string;
    setFormData((prevData) => ({
      ...prevData,
      [key]: selectedId,
    }));

    try {
      const rowData = await FormService.getRowDataById(
        fetchedTblName,
        columnNameId,
        selectedId
      );
      console.log("Fetched row data:", rowData);
      if (rowData) {
        const updatedRowData = Object.entries(rowData).reduce(
          (acc, [key, value]) => {
            if (
              typeof value === "string" &&
              value.match(/^\d{2}\/\d{2}\/\d{4}$/)
            ) {
              // Convert date from MM/dd/yyyy to yyyy-MM-dd for display
              acc[key] = convertDateFormat(value, "MM/dd/yyyy", "yyyy-MM-dd");
            } else if (typeof value === "string" && value.match(/\$\d+/)) {
              // Remove any special characters and keep only integers
              acc[key] = value.replace(/[^\d]/g, "");
            } else {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, any>
        );

        setFormData((prevData) => ({
          ...prevData,
          ...updatedRowData,
        }));
      }
    } catch (error) {
      console.error("Error fetching row data:", error);
    }
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

      const idExists = await FormService.checkIfIdExists(
        formEntity?.tblName || "",
        columnNameId,
        idValue
      );

      if (idExists) {
        toast.error("The ID already exists. Please use a unique ID.");
        return;
      }

      const response = await FormService.insertValues({
        tableName: formEntity?.tblName || "",
        headers: Object.keys(formData),
        values: Object.values(formData),
      });

      if (response.status === 200) {
        toast.success("Form submitted successfully!");
      } else {
        toast.error(`Failed to submit form: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const handleModifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Modify form data to submit:", formData);

    if (!formEntity) {
      toast.error("Form entity is not available.");
      return;
    }

    const headers = Object.keys(formData);
    const values = Object.values(formData);

    // Create the condition for the WHERE clause
    const condition = `${columnNameId} = '${formData[columnNameId]}'`;

    const payload = {
      tableName: formEntity.tblName || "",
      headers: headers,
      values: values,
      conditions: condition,
    };
    console.log("Payload", payload)
    try {
      const response = await FormService.modifyValues(payload);
      if (response.status === 200) {
        toast.success("Form modified successfully!");
        console.log("API Response:", response);
      } else {
        toast.error("Failed to modify form.");
        console.log("API Response:", response);
      }
    } catch (error) {
      console.error("Error modifying form:", error);
      toast.error("An error occurred while modifying the form.");
    }
  };

  const handleDeleteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Delete form data to submit:", formData);

    if (!formEntity) {
      toast.error("Form entity is not available.");
      return;
    }

    const idToDelete = formData[columnNameId];
    if (!idToDelete) {
      toast.error("Please select an ID to delete.");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete the record with ID ${idToDelete}?`
      )
    ) {
      try {
        const response = await FormService.deleteRow(
          formEntity.tblName,
          columnNameId,
          idToDelete
        );

        if (response.status === 200) {
          toast.success("Record deleted successfully!");
          setFormData({});
          fetchAllIds(columnNameId, fetchedTblName);
        } else {
          toast.error("Failed to delete record.");
        }
      } catch (error) {
        console.error("Error deleting record:", error);
        toast.error("An error occurred while deleting the record.");
      }
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
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const headers = JSON.parse(formEntity.headers);

  const formatDate = (date: string): string => {
    const parsedDate = new Date(date);
    console.log(parsedDate);
    const year = parsedDate.getFullYear();
    console.log(year);

    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    console.log(month);

    const day = String(parsedDate.getDate()).padStart(2, "0");
    console.log(day);
    console.log(`${year}-${month}-${day}`);

    return `${year}-${month}-${day}`;
  };

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
          <Typography variant="body2" gutterBottom>
            {formEntity.tblName +
              " | " +
              formEntity.createdAt +
              " | " +
              formEntity.formType}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {customSettings.definition}
          </Typography>

          <form onSubmit={handleSubmit}>
            {Object.entries(headers).map(([key, value]) =>
              key === columnNameId && (isModify || isDelete) ? (
                <Select
                  key={key}
                  fullWidth
                  margin="dense"
                  value={formData[key] || ""}
                  onChange={(e) => handleSelectChange(e, key)}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5 + 8,
                        width: "20ch",
                      },
                    },
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select {formatLabel(key)}
                  </MenuItem>
                  {allIds.map((id) => (
                    <MenuItem key={id} value={id}>
                      {id}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
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
                  value={
                    value === "date" && formData[key]
                      ? formatDate(formData[key])
                      : formData[key] || ""
                  }
                  onChange={handleInputChange}
                  // type={value as string}
                  type={value === "date" ? "date" : (value as string)}
                  onKeyDown={(e) => {
                    if (value === "date") {
                      e.preventDefault(); // Prevent typing for date fields
                    }
                  }}
                  helperText={
                    value === "date"
                      ? "Please select a date from the calendar"
                      : ""
                  }
                    InputProps={{
                    startAdornment: value === "date" && (
                      <InputAdornment position="start">
                      <CalendarTodayIcon />
                      </InputAdornment>
                    ),
                    style: {
                      color: value === "date" && !formData[key] ? "gray" : "inherit",
                    },
                    }}
                  disabled={isDelete && key !== columnNameId}
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
                  // InputProps={{
                  //   startAdornment: value === "date" && (
                  //     <InputAdornment position="start">
                  //       <CalendarTodayIcon />
                  //     </InputAdornment>
                  //   ),
                  // }}
                />
              )
            )}
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
        {/* Edit Button */}
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
                      const response = await FormService.deleteForm(formEntity?.formId);
                      console.log(response); // Log the success message
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
