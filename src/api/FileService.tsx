import axios, { AxiosResponse } from "axios";
import { FileEntity, ResponseFile } from "./dataTypes";

const FILE_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const axiosInstance = axios.create({
  baseURL: FILE_BASE_URL,
});

const createFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
};

const FileService = {
  // Upload File
  uploadFile: async (file: File): Promise<FileEntity | null> => {
    try {
      const response: AxiosResponse<FileEntity> = await axiosInstance.post(
        "/upload",
        createFormData(file),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error.message);
      return null;
    }
  },

  // Update File by ID
  updateFile: async (id: number, file: File): Promise<string> => {
    try {
      const response: AxiosResponse<string> = await axiosInstance.put(
        `/updateFile/${id}`,
        createFormData(file),
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Update error:", error.response?.data || error.message);
      return "Update Failed!";
    }
  },

  // Download File by ID
  downloadFile: async (id: number): Promise<void> => {
    try {
      const response: AxiosResponse<ArrayBuffer> = await axiosInstance.get(
        `/downloadFile/${id}`,
        { responseType: "arraybuffer" }
      );
      const fileName =
        response.headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || "downloadedFile";
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Download error:", error.response?.data || error.message);
    }
  },

  // Fetch Files by User ID
  getFilesByUserId: async (userId: string): Promise<ResponseFile[]> => {
    try {
      const response: AxiosResponse<ResponseFile[]> = await axiosInstance.get(
        `/filesByUserId/${userId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Get files by user ID error:", error.response?.data || error.message);
      return [];
    }
  },

  // Fetch File by ID
  getFile: async (id: number): Promise<FileEntity | null> => {
    try {
      const response: AxiosResponse<FileEntity> = await axiosInstance.get(
        `/file?id=${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Get file error:", error.response?.data || error.message);
      return null;
    }
  },

  // Fetch All Files
  getAllFiles: async (): Promise<ResponseFile[]> => {
    try {
      const response: AxiosResponse<ResponseFile[]> = await axiosInstance.get(
        "/files"
      );
      return response.data;
    } catch (error: any) {
      console.error("Get list of files error:", error.response?.data || error.message);
      return [];
    }
  },

  // Delete File by ID
  deleteFile: async (id: number): Promise<string> => {
    try {
      const response: AxiosResponse<string> = await axiosInstance.delete(
        `/deleteFile/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Delete error:", error.response?.data || error.message);
      return "Delete Failed!";
    }
  },

  // Fetch All Deleted Files
  getDeletedFiles: async (): Promise<FileEntity[]> => {
    try {
      const response: AxiosResponse<FileEntity[]> = await axiosInstance.get(
        "/getAllDeletedFiles"
      );
      return response.data;
    } catch (error: any) {
      console.error("Get deleted files error:", error.response?.data || error.message);
      return [];
    }
  },

  // Restore File by ID
  restoreFile: async (id: number): Promise<string> => {
    try {
      const response: AxiosResponse<string> = await axiosInstance.put(
        `/restoreFile/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Restore error:", error.response?.data || error.message);
      return "Restore Failed!";
    }
  },

  // Permanently Delete File by ID
  permanentDeleteFile: async (id: number): Promise<string> => {
    try {
      const response: AxiosResponse<string> = await axiosInstance.delete(
        `/deleteFilePermanent/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Permanent delete error:", error.response?.data || error.message);
      return "Permanent Delete Failed!";
    }
  },

  // Fetch Deleted Files by User ID
  getDeletedFilesById: async (userId: string): Promise<FileEntity[]> => {
    try {
      const response: AxiosResponse<FileEntity[]> = await axiosInstance.get(
        `/deletedFilesByUserId?userId=${userId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Get deleted files by user ID error:", error.response?.data || error.message);
      return [];
    }
  },
};

export default FileService;
