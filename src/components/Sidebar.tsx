import {
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CustomSettings } from "../api/dataTypes";

interface SidebarProps {
  selectedField: string | null; // Keep this for context
  selectedFieldType: string | null;
  customSettings: CustomSettings;
  setCustomSettings: (settings: CustomSettings) => void;
}

export default function Sidebar({
  selectedField,
  selectedFieldType,
  customSettings, // here customSettings came from the parent comp which came from the db
  setCustomSettings,
}: SidebarProps) {
  const [formTitleAlign, setFormTitleAlign] = useState<
    "center" | "left" | "right"
  >("left");
  const [buttonWidth, setButtonWidth] = useState<string>("100");
  const [buttonAlign, setButtonAlign] = useState<"center" | "left" | "right">(
    "left"
  );

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
      <Typography variant="subtitle1" gutterBottom>
        Form Title Settings
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Alignment</InputLabel>
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
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() =>
            setCustomSettings({
              ...customSettings,
              form_title_align: formTitleAlign,
            })
          }
        >
          Apply
        </Button>
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
      <Typography variant="h6" gutterBottom sx={{ paddingTop: 8 }}>
        Edit Styles
      </Typography>

      {/* {selectedField === "button" && renderButtonSettings()} */}

      {selectedField && (
        <Typography variant="body1" gutterBottom>
          Editing: {selectedField}
        </Typography>
      )}

      {selectedFieldType === "form title" && renderFormTitleSettings()}
      {selectedFieldType === "textfield" && renderTextFieldSettings()}
      {selectedFieldType === "button" && renderButtonSettings()}
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
