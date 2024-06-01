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


export interface FileActivityLogEntity {
  logId: number;
  activity: string;
  timestamp: string;
  fileId: number;
  userId: string;
}