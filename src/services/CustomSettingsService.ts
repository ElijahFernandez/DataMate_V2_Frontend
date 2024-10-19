import axios from "axios";
import { CustomSettings } from "../api/dataTypes"; // Import the CustomSettings interface

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
        console.log("Fetched settings from Service (\"CustomSettingsService.tsx\"): ", this.settings);
      } else {
        console.warn("No settings found for Form ID:", formId);
      }
    } catch (error) {
      console.error(`Error fetching settings for Form ID ${formId}:`, error);
    }
  }

  // Function to get the current settings
  getSettings(): CustomSettings {
    return this.settings;
  }

  // Send the updated settings back to the backend
  async saveSettings(formId: number, stringifiedSettings: string): Promise<void> {
    try {
      const response = await axios.post(
        `${API_URL}/updateCustomSettingsByFormId/${formId}`,
        stringifiedSettings,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("Settings saved successfully!", response.data);
    } catch (error) {
      console.error(`Error saving settings for Form ID ${formId}:`, error);
    }
  }
}

export default new CustomSettingsManager();
