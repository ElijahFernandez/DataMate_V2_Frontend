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
  const [buttonWidth, setButtonWidth] = useState<string>("100");
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

  const [newFormName, setNewFormName] = useState<string>();

  const handleFormTitleChange = async (formId: number, newFormName: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/updateFormName/${formId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newFormName),
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
        {/* <InputLabel>Alignment</InputLabel> */}
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
      <Typography variant="subtitle1" gutterBottom>
        Submit Button Settings
      </Typography>
      <TextField label="Button Width" fullWidth margin="normal" />
      <FormControl fullWidth margin="normal">
        <InputLabel>Button Alignment</InputLabel>
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
      <Typography variant="subtitle1" gutterBottom>
        Form Field Settings
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Shrink Text Field</InputLabel>
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
    </>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 300,
        height: "100%",
        bgcolor: "#f4f4f4",
        p: 3,
        borderRight: "1px solid #ddd",
      }}
    >
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <Typography variant="h6" gutterBottom sx={{ paddingTop: 8 }}>
          Edit Styles
        </Typography>
      

      {!selectedField && (
        <Typography variant="body1" gutterBottom>
          Select a field to edit
        </Typography>
      )}
      {selectedField && (
        <Typography variant="body1" gutterBottom>
          Editing: {selectedField}
        </Typography>
      )}
      </div>

      {selectedFieldType === "form title" && renderFormTitleSettings()}
      {selectedFieldType === "textfield" && renderTextFieldSettings()}
      {selectedFieldType === "button" && renderButtonSettings()}
      {selectedFieldType === "form" && renderFormFieldSettings()}
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
