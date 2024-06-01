import React from "react";
import Popover from "@mui/material/Popover";
import { Typography } from "@mui/material";
import { FileEntity, ResponseFile, User } from "../api/dataTypes";

interface FileDetailsProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  file: FileEntity;
  user: User;
}

const FileDetails: React.FC<FileDetailsProps> = ({
  open,
  anchorEl,
  onClose,
  file,
  user,
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <ul style={{ listStyleType: "none", padding: "10px" }}>
        <li>
          <strong>File Name:</strong> {file.fileName}
        </li>
        <li>
          <strong>File Size:</strong> {file.fileSize}
        </li>
        <li>
          <strong>Upload Date:</strong> {file.uploadDate}
        </li>
        <li>
          <strong>Latest Date Modified:</strong> {file.latestDateModified}
        </li>
        {/* <li>
          <strong>Owner: </strong>{" "}
          {user && user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Unknown"}
        </li> */}
      </ul>
    </Popover>
  );
};

export default FileDetails;
