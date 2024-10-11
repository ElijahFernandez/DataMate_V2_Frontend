import axios from "axios";

type CustomSettings = {
  theme: string;
  form_title_fontsize: string;
  form_title_align: "center" | "left" | "right";
  submit_button_width: string;
  submit_button_align: "center" | "left" | "right";
  [key: string]: string | number; // to allow more custom settings dynamically
};
const API_URL = "http://localhost:8080";
class CustomSettingsManager {
  private settings: CustomSettings;

  constructor() {
    this.settings = {} as CustomSettings; // Initialize as an empty object
  }

  // Fetch settings from the backend
  async fetchSettings(formId: number): Promise<void> {
    try {
      const response = await axios.get(`${API_URL}/getCustomSettingsByFormId/${formId}`);
      if (response.data) {
        this.settings = response.data;
        console.log("Fetched settings: ", this.settings);
      } else {
        console.warn("No settings found for Form ID:", formId);
      }
    } catch (error) {
      console.error(`Error fetching settings for Form ID ${formId}:`, error);
    }
  }
  

  // Update an existing setting
  updateSetting(key: keyof CustomSettings, value: string | number): void {
    if (this.settings[key] !== undefined) {
      this.settings[key] = value;
      console.log(`Updated setting: ${key} = ${value}`);
    } else {
      console.log(`Setting '${key}' does not exist.`);
    }
  }

  // Insert a new setting
  insertSetting(key: string, value: string | number): void {
    if (this.settings[key] === undefined) {
      this.settings[key] = value;
      console.log(`Inserted new setting: ${key} = ${value}`);
    } else {
      console.log(
        `Setting '${key}' already exists. Use updateSetting instead.`
      );
    }
  }

  // Delete an existing setting
  deleteSetting(key: keyof CustomSettings): void {
    if (this.settings[key] !== undefined) {
      delete this.settings[key];
      console.log(`Deleted setting: ${key}`);
    } else {
      console.log(`Setting '${key}' does not exist.`);
    }
  }

  // Function to get the current settings
  getSettings(): CustomSettings {
    return this.settings;
  }

  // Send the updated settings back to the backend
  async saveSettings(formId: number): Promise<void> {
    try {
      const response = await axios.post(
        `/updateCustomSettingsByFormId/${formId}`,
        this.settings
      );
      console.log("Settings saved successfully!", response.data);
    } catch (error) {
      console.error(`Error saving settings for Form ID ${formId}:`, error);
    }
  }
}
export type { CustomSettings };

export default new CustomSettingsManager();