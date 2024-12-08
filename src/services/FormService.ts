import axios, { AxiosResponse } from "axios";
import { FormEntity } from "../api/dataTypes";
//FORM SERVICE NEEDS REWORK


// const API_URL = 'https://datamate-api.onrender.com'
interface InsertPayload {
    tableName: string;
    headers: string[];
    values: string[];
}

interface ModifyPayload {
    tableName: string;
    headers: string[];
    values: string[];
    conditions: string;
}

interface ProcessedFormHeaders {
    headerName: string;
    headerValue: string;
  }

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

class FormService {
    async postForm(formData: Omit<FormEntity, 'formId'>): Promise<FormEntity> {
        try {
            const response = await axios.post<FormEntity>(`${API_URL}/postForms`, formData, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to create form: ${error.response?.data?.message || error.message}`);
            }
            throw new Error('An unexpected error occurred while creating the form');
        }
    }

    async getFormsByUser(userid: string){
        return axios.get(`${API_URL}/getUserForms/${userid}`)
        .then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        })
    }

    async getAllIds(idkeyColumn: string, tableName: string){
        return axios.get(`${API_URL}/getAllIds?idKeyColumn=${idkeyColumn}&tableName=${tableName}`)
        .then((res)=>{
            if (res.data) {
                return res.data;
            }
        }).catch((err)=>{
            console.log(err);
        })
    }

    async getRowDataById(tableName: string, idKeyColumn: string, idValue: string) {
        try {
            const response = await axios.post(`${API_URL}/getRowData`, {
                tableName: tableName,
                idColumn: idKeyColumn,
                idValue: idValue
            });
    
            if (response.data) {
                return response.data;
            } else {
                return null; // Handle the case when no data is found
            }
        } catch (error) {
            console.error('Error fetching row data:', error);
            throw error; // Re-throw or handle the error based on your needs
        }
    }
    
    async getFormById(formId: string) {
        try {
            const response = await axios.get(`${API_URL}/getForms/${formId}`);
            if (response.data) {
                // Remove quotation marks from formName if they exist
                if (response.data.formName) {
                    response.data.formName = response.data.formName.replace(/^"|"$/g, "");
                }
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching form:', error);
            throw error;
        }
    }

    async checkIfIdExists(tableName: string, idColumn: string, idValue: string): Promise<boolean> {
        try {
            const response = await axios.get(`${API_URL}/check-id`, {
                params: {
                    tableName,
                    idColumn,
                    idValue
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking ID existence:', error);
            throw error;
        }
    }

    async insertValues(payload: InsertPayload): Promise<AxiosResponse<any>> {
        try {
            const response = await axios.post(`${API_URL}/insert`, payload);
            // Check for a 2xx status code instead of checking `response.data`.
            if (response.status >= 200 && response.status < 300) {
                return response;
            } else {
                throw new Error(`Failed to insert values: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error inserting values:', error);
            throw error;
        }
    }    

    async modifyValues(payload: ModifyPayload): Promise<AxiosResponse<any>> {
        try {
            const response = await axios.post(`${API_URL}/modify`, payload);
            // Check for a 2xx status code instead of checking `response.data`.
            if (response.status >= 200 && response.status < 300) {
                return response;
            } else {
                throw new Error(`Failed to modify values: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error modifying values:', error);
            throw error;
        }
    }

    async deleteRow(
        tableName: string,
        idColumn: string,
        idValue: string
    ): Promise<AxiosResponse<any>> {
        try {
            const response = await axios.post(`${API_URL}/deleteRow`, {
                tableName,
                idColumn,
                idValue
            });
    
            // Check for a 2xx status code instead of checking `response.data`.
            if (response.status >= 200 && response.status < 300) {
                return response;
            } else {
                throw new Error(`Failed to delete row: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error deleting row:', error);
            throw error;
        }
    }
    

    async processHeaders(formHeaders: string[]): Promise<ProcessedFormHeaders[]> {
        try {
            const response = await axios.post<string>(`${API_URL}/api/headers`, formHeaders, {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            console.log("API response:", response);
            console.log("Response data:", response.data);

            const headerString = response.data;
            const headerArray = headerString
                .split(",")
                .map((header: string) => header.trim());

            // Map to the desired format
            const headersData: ProcessedFormHeaders[] = formHeaders.map((headerName, index) => {
                return {
                    headerName: headerName,
                    headerValue: headerArray[index] || "", // Use empty string if no corresponding value
                };
            });
            console.log("Mapped Headers:", headersData);

            return headersData;
        } catch (error) {
            console.error("Error processing headers:", error);
            throw new Error('Failed to process headers');
        }
    }

    async deleteForm(formId: number): Promise<string> {
        try {
            const response = await axios.delete(`${API_URL}/deleteForm`, {
                params: { formId },
            });
            return response.data; // Return the success message from the backend
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    `Failed to delete form: ${error.response?.data?.message || error.message}`
                );
            }
            throw new Error('An unexpected error occurred while deleting the form.');
        }
    }

}
export default new FormService();