import axios, { AxiosResponse } from "axios";
import { FileActivityLogEntity } from "./dataTypes";


// const FILELOGS_BASE_URL = "https://datamate-api.onrender.com";
const FILELOGS_BASE_URL = "http://localhost:8080";

const FileLogsService = {

    getFileActivityLogsByUserId: async (userId: string): Promise<FileActivityLogEntity[]> => {
        try {
          const response: AxiosResponse<FileActivityLogEntity[]> = await axios.get(
            `${FILELOGS_BASE_URL}/getFileActivityLogsByUserId?userId=${userId}`
          );
    
          return response.data;
        } catch (error) {
          console.error("Get logs by user ID error:", error);
          return [];
        }
      },
    

}

export default FileLogsService;