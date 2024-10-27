import axios, { AxiosResponse } from "axios";
import { FileEntity, ResponseFile } from "./dataTypes";

// const FILE_BASE_URL = "https://datamate-api.onrender.com";
const FILE_BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : "http://localhost:8080";

const FileService = {
  //upload FIle
  uploadFile: async (file: File): Promise<FileEntity | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response: AxiosResponse<FileEntity> = await axios.post(
        `${FILE_BASE_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  },

  // updateFile by ID
  updateFile: async (id: number, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response: AxiosResponse<string> = await axios.put(
        `${FILE_BASE_URL}/updateFile/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Update error:", error);
      return "Update Failed!";
    }
  },

  // download file by ID
  downloadFile: async (id: number): Promise<void> => {
    try {
      const response: AxiosResponse<ArrayBuffer> = await axios.get(
        `${FILE_BASE_URL}/downloadFile/${id}`,
        {
          responseType: "arraybuffer",
        }
      );
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "downloadedFile";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  },

  getFilesByUserId: async (userId: string): Promise<ResponseFile[]> => {
    try {
      const response: AxiosResponse<ResponseFile[]> = await axios.get(
        `${FILE_BASE_URL}/filesByUserId/${userId}`
      );
      console.log("res:", response);
      return response.data;
    } catch (error) {
      console.error("Get files by user ID error:", error);
      return [];
    }
  },

  // fetch file by ID
  getFile: async (id: number): Promise<FileEntity | null> => {
    try {
      const response: AxiosResponse<FileEntity> = await axios.get(
        `${FILE_BASE_URL}/file?id=${id}`
      );

      return response.data;
    } catch (error) {
      console.error("Get file error:", error);
      return null;
    }
  },

  // fetch all files
  getAllFiles: async (): Promise<ResponseFile[]> => {
    try {
      const response: AxiosResponse<ResponseFile[]> = await axios.get(
        `${FILE_BASE_URL}/files`
      );

      return response.data;
    } catch (error) {
      console.error("Get list of files error:", error);
      return [];
    }
  },

  // delete by ID
  deleteFile: async (id: number): Promise<string> => {
    try {
      const response: AxiosResponse<string> = await axios.delete(
        `${FILE_BASE_URL}/deleteFile/${id}`
      );

      return response.data;
    } catch (error) {
      console.error("Delete error:", error);
      return "Delete Failed!";
    }
  },

  //get all deleted files
  getDeletedFiles: async (): Promise<FileEntity[]> => {
    try {
      const response: AxiosResponse<FileEntity[]> = await axios.get(
        `${FILE_BASE_URL}/getAllDeletedFiles`
      );

      return response.data;
    } catch (error) {
      console.error("Get deleted files error:", error);
      return [];
    }
  },

  // restore file by id
  restoreFile: async (id: number): Promise<string> => {
    try {
      const response: AxiosResponse<string> = await axios.put(
        `${FILE_BASE_URL}/restoreFile/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Restore error:", error);
      return "Restore Failed!";
    }
  },

  // permanent delete by id
  permanentDeleteFile: async (id: number): Promise<string> => {
    try {
      const response: AxiosResponse<string> = await axios.delete(
        `${FILE_BASE_URL}/deleteFilePermanent/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Permanent delete error:", error);
      return "Permanent Delete Failed!";
    }
  },

  // get deleted files by user id
  getDeletedFilesById: async (userId: string): Promise<FileEntity[]> => {
    try {
      const response: AxiosResponse<FileEntity[]> = await axios.get(
        `${FILE_BASE_URL}/deletedFilesByUserId?userId=${userId}`
      );

      return response.data;
    } catch (error) {
      console.error("Get deleted files by user ID error:", error);
      return [];
    }
  },
};

export default FileService;
