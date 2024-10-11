import {
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useEffect } from "react";
import { CustomSettings } from "../services/CustomSettingsService";

interface SidebarProps {
  selectedField: string | null; // Keep this for context
  selectedFieldType: string | null;
  styles: any;
  setStyles: (newStyles: any) => void;
  customSettings: CustomSettings;
  updateCustomSetting: (key: keyof CustomSettings, value: string | number) => void;
}

export default function Sidebar({
  selectedField,
  selectedFieldType,
  styles,
  setStyles,
  customSettings,
  updateCustomSetting,
}: SidebarProps) {
  
  const handleStyleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>,
    styleProp: string
  ) => {
    const value = e.target.value;
    setStyles({ [styleProp]: value });
  };

  const handleCustomSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>,
    key: keyof CustomSettings
  ) => {
    const value = e.target.value;
    updateCustomSetting(key, value);
  };

  useEffect(() => {
    console.log("Selected Field:", selectedField);
  }, [selectedField]);

  const renderFormTitleSettings = () => (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Form Title Settings
      </Typography>
      <TextField
        label="Font Size"
        type="number"
        value={customSettings.form_title_fontsize}
        onChange={(e) => handleCustomSettingChange(e, 'form_title_fontsize')}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Alignment</InputLabel>
        <Select
          value={customSettings.form_title_align || 'left'}
          onChange={(e) => handleCustomSettingChange(e, 'form_title_align')}
        >
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="center">Center</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>
      </FormControl>
    </>
  );

  const renderTextFieldSettings = () => (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Text Field Settings
      </Typography>
      <TextField
        label="Label Position"
        value={styles.labelPosition || ''}
        onChange={(e) => handleStyleChange(e, 'labelPosition')}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Field Width"
        value={styles.width || ''}
        onChange={(e) => handleStyleChange(e, 'width')}
        fullWidth
        margin="normal"
      />
    </>
  );

  const renderButtonSettings = () => (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Submit Button Settings
      </Typography>
      <TextField
        label="Button Width"
        value={customSettings.submit_button_width}
        onChange={(e) => handleCustomSettingChange(e, 'submit_button_width')}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Button Alignment</InputLabel>
        <Select
          value={customSettings.submit_button_align}
          onChange={(e) => handleCustomSettingChange(e, 'submit_button_align')}
        >
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="center">Center</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>
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

      {selectedFieldType === 'form title' && renderFormTitleSettings()}
      {selectedFieldType === 'textfield' && renderTextFieldSettings()}
      {selectedFieldType === 'button' && renderButtonSettings()}

      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Apply
      </Button>
    </Box>
  );
}
