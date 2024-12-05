import axios from "axios";

// Set the API URL dynamically with a fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

class DatabaseService {
  // Helper function to handle API responses
  private handleResponse<T>(response: { data: T }): T {
    return response.data;
  }

  // Helper function to handle API errors
  private handleError(error: any): void {
    console.error("DatabaseService Error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || "An error occurred while processing your request.");
  }

  // Post a new database
  async postDatabase(dbName: string, userId: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/postDB`, {
        databaseName: dbName,
        user: {
          userId: userId,
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get database by name and user
  async getDBByNameAndUser(name: string, userId: number): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/getUserDBs`, {
        params: {
          dbName: name,
          userId: userId,
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get all databases for a user
  async getDBsByUser(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/getUserDBs/${userId}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export default new DatabaseService();
