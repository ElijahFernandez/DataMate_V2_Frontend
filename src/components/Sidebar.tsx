import {
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CustomSettings } from "../api/dataTypes";

interface SidebarProps {
  selectedField: string | null; // Keep this for context
  selectedFieldType: string | null; 
  customSettings: CustomSettings;
  startLoading: () => void;
  stopLoading: () => void;
  setCustomSettings: (settings: CustomSettings) => void;
  updateFormName: (newName: string) => void; // Add this new prop
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

export default function Sidebar({
  selectedField,
  selectedFieldType,
  customSettings, // here customSettings came from the parent comp which came from the db
  startLoading,
  stopLoading,
  setCustomSettings,
  updateFormName, // Add this new prop
}: SidebarProps) {
  const { formId } = useParams<{ formId: string }>();
  const [formEntity, setFormEntity] = useState<FormEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buttonWidth, setButtonWidth] = useState<
    "small" | "medium" | "fullWidth"
  >("small");
  const [buttonAlign, setButtonAlign] = useState<"center" | "left" | "right">(
    "left"
  );

  const [shrinkForm, setShrinkForm] = useState<
    "true" | "false" | "trueWithPlaceholder" | "noShrink"
  >("noShrink");

  const [formTitleAlign, setFormTitleAlign] = useState<
    "center" | "left" | "right"
  >("left");

  const [formName, setFormName] = useState(
    formEntity ? formEntity.formName : ""
  );
  useEffect(() => {
    console.log("Selected Field Type:", selectedFieldType);
  }, [selectedFieldType]);

  const handleFormTitleChange = async (formId: number, newFormName: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/updateFormName/${formId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: newFormName,
        }
      );

      if (response.ok) {
        const result = await response.text();
        console.log(result); // Log success message
        updateFormName(newFormName); // Update the form name in the parent component
      } else {
        const error = await response.text();
        console.error("Error:", error);
      }
    } catch (error) {
      console.error("Error updating form name:", error);
    }
  };

  const handleFormTitleApply = () => {
    setCustomSettings({
      ...customSettings,
      form_title_align: formTitleAlign,
    });
    if (formEntity && formEntity.formId) {
      handleFormTitleChange(formEntity.formId, formName);
      console.log("New form name: ", formName);
    } else {
      console.error("Form ID not found");
    }
  };

  const handleThemeSelection = (primary: string, light: string) => {
    setCustomSettings({
      ...customSettings,
      theme: {
        primary: primary,
        light: light,
      },
    });
  };

  useEffect(() => {
    const fetchFormEntity = async () => {
      if (formId) {
        try {
          const response = await axios.get(
            `http://localhost:8080/getForms/${formId}`
          );
          setFormEntity(response.data);
          setFormName(response.data.formName);
          setFormTitleAlign(customSettings.form_title_align || "left");
          // console.log("Fetched Form Entity:", response.data);
          // console.log("Fetched Form Table name:", response.data.tblName);
        } catch (error) {
          console.error("Error fetching form entity:", error);
        }
      }
    };

    fetchFormEntity();
  }, [formId, customSettings.form_title_align]);

  useEffect(() => {
    console.log("Retrieved custom settings:", customSettings);
    // Initialize state values based on customSettings when component mounts
    if (customSettings) {
      setFormTitleAlign(customSettings.form_title_align || "left");
      setButtonWidth(customSettings.submit_button_width || "100");
      setButtonAlign(customSettings.submit_button_align || "left");
    }
  }, [customSettings]);

  useEffect(() => {
    console.log("Selected Field:", selectedField);
  }, [selectedField]);

  const renderFormTitleSettings = () => (
    <>
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <Typography variant="subtitle1" gutterBottom>
          Form Title Settings
        </Typography>
      </div>
      <Divider sx={{ my: 1 }} />
      <FormControl fullWidth margin="normal">
        <Typography variant="body2" sx={{ mb: 1 }}>
          Form Title Alignment
        </Typography>
        <Select
          value={formTitleAlign}
          onChange={(event: SelectChangeEvent<string>) =>
            setFormTitleAlign(event.target.value as "center" | "left" | "right")
          }
        >
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="center">Center</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>

        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          Change Form Name
        </Typography>
        <TextField
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleFormTitleApply}
        >
          Apply
        </Button>
        {/* <TextField value={formEntity ? formEntity.formName : ""}></TextField>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() =>
            setCustomSettings({
              ...customSettings,
              form_title_align: formTitleAlign, // you're stuck in here
            })
          }
        >
          Apply
        </Button> */}
      </FormControl>
    </>
  );

  const renderTextFieldSettings = () => (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Text Field Settings
      </Typography>
      <TextField label="Label Position" fullWidth margin="normal" />
      <TextField label="Field Width" fullWidth margin="normal" />
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Apply
      </Button>
    </>
  );

  const renderButtonSettings = () => (
    <>
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <Typography variant="subtitle1" gutterBottom>
          Submit Button Settings
        </Typography>
      </div>
      <Divider sx={{ my: 1 }} />
      <FormControl fullWidth margin="normal">
        <Typography variant="body2" sx={{ mb: 1 }}>
          Button Size
        </Typography>
        <Select
          value={buttonWidth}
          onChange={(event: SelectChangeEvent<string>) =>
            setButtonWidth(
              event.target.value as "small" | "medium" | "fullWidth"
            )
          }
        >
          <MenuItem value="small">Small</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="fullWidth">Full Width</MenuItem>
        </Select>

        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          Button Alignment
        </Typography>

        {/* <InputLabel>Button Alignment</InputLabel> */}
        <Select
          value={buttonAlign}
          onChange={(event: SelectChangeEvent<string>) =>
            setButtonAlign(event.target.value as "center" | "left" | "right")
          }
        >
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="center">Center</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() =>
            setCustomSettings({
              ...customSettings,
              submit_button_width: buttonWidth,
              submit_button_align: buttonAlign,
            })
          }
        >
          Apply
        </Button>
      </FormControl>
    </>
  );

  const renderFormFieldSettings = () => (
    <>
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <Typography variant="subtitle1" gutterBottom>
          Form Field Settings
        </Typography>
      </div>
      <Divider sx={{ my: 1 }} />
      <FormControl fullWidth margin="normal">
      <Typography variant="body2" sx={{ mb: 1 }}>
        Shrink Text Field
      </Typography>
        <Select
          value={shrinkForm}
          onChange={(event: SelectChangeEvent<string>) =>
            setShrinkForm(
              event.target.value as "true" | "false" | "trueWithPlaceholder"
            )
          }
        >
          <MenuItem value="noShrink">No Shrink</MenuItem>
          <MenuItem value="true">True</MenuItem>
          <MenuItem value="false">False</MenuItem>
          <MenuItem value="trueWithPlaceholder">TrueWithPlaceholder</MenuItem>
        </Select>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() =>
            setCustomSettings({
              ...customSettings,
              shrinkForm: shrinkForm,
            })
          }
        >
          Apply
        </Button>
      </FormControl>

      <Typography variant="body2" sx={{ mt: 3, mb: 1 }}>
        Choose Theme
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Box
            sx={{
              backgroundColor: "#ECDFCC",
              height: 50,
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() =>
              handleThemeSelection("#ECDFCC", "rgba(252, 250, 238, 0.6)")
            }
          />
        </Grid>
        <Grid item xs={4}>
          <Box
            sx={{
              backgroundColor: "#08C2FF",
              height: 50,
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() =>
              handleThemeSelection("#08C2FF", "rgba(8, 194, 255, 0.3)")
            }
          />
        </Grid>
        <Grid item xs={4}>
          <Box
            sx={{
              backgroundColor: "#1AA2A5",
              height: 50,
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() =>
              handleThemeSelection("#1AA2A5", "rgba(26, 162, 165, 0.3)")
            }
          />
        </Grid>
        <Grid item xs={4}>
          <Box
            sx={{
              backgroundColor: "#EF5A6F",
              height: 50,
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() =>
              handleThemeSelection("#EF5A6F", "rgba(239, 90, 111, 0.3)")
            }
          />
        </Grid>
        <Grid item xs={4}>
          <Box
            sx={{
              backgroundColor: "#6FCF66",
              height: 50,
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() =>
              handleThemeSelection("#6FCF66", "rgba(111, 207, 102, 0.3)")
            }
          />
        </Grid>
        <Grid item xs={4}>
          <Box
            sx={{
              backgroundColor: "#8967B3",
              height: 50,
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() =>
              handleThemeSelection("#8967B3", "rgba(137, 103, 179, 0.3)")
            }
          />
        </Grid>
      </Grid>
    </>
  );

  return (
    <Box
      sx={{
        borderRadius: 2,
        position: "fixed",
        left: 0,
        top: 0,
        width: 300,
        height: 700,
        bgcolor: "#f4f4f4",
        mt: 15,
        p: 4,
        borderRight: "1px solid #ddd",
        transition: 'left 0.3s', // Smooth transition
        zIndex: 1100,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ paddingTop: 8 }}>
          Edit Styles
        </Typography>
        <Divider sx={{ my: 2 }} />
        {!selectedField && (
          <Typography variant="body1" gutterBottom sx={{ pt: 3 }}>
            Select a field to edit
          </Typography>
        )}
        {selectedField && (
          <Typography variant="body2" gutterBottom>
            Editing: {selectedField}
          </Typography>
        )}
      </div>

      {selectedFieldType === "form title" && renderFormTitleSettings()}
      {/* {selectedFieldType === "textfield" && renderTextFieldSettings()} */}
      {selectedFieldType === "button" && renderButtonSettings()}
      {(selectedFieldType === "form" || selectedFieldType === "textfield") &&
        renderFormFieldSettings()}
      {/* <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 2 }}
        onClick={() => console.log("Form Title Alignment:", formTitleAlign)}
      >
        Print Form Title Alignment
      </Button> */}
    </Box>
  );
}
