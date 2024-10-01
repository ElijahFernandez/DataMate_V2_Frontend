/*add your dataTypes here*/

export type User = {
  userId: number,
  firstName: string,
  lastName: string,
  email: string,
  address: string,
  username: string,
  password: string,
  businessName: string,
  businessType: string,
  userImage: Blob | null,
}

export interface FileEntity {
  fileId: number;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  latestDateModified: string;
  isdeleted: boolean;
  data?: Uint8Array; // Make 'data' property optional
  userId: string;
}

export interface ResponseFile {
  fileId: number;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  latestDateModified: string;
  isdeleted: boolean;
  fileDownloadUri: string;
  userId: string;
  // thumbnailUrl: string;
}

export interface DatabaseEntity {
  databaseId: number;
  databaseName: string,
  userId: string;
}

export interface ReportEntity {
  reportId: number;
  reportName: string,
  userId: string;
}

export interface FormEntity {
  formId?: number;
  dbName: string;
  formName: string;
  headers: string;
  customSettings: string;
  userId: number;
  createdAt: string;
}

export interface FileActivityLogEntity {
  logId: number;
  activity: string;
  timestamp: string;
  fileId: number;
  userId: string;
}

export interface FormHeaders {
  headers: string[] | undefined;
}