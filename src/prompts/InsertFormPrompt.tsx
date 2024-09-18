import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, Button, Box, Typography, Divider } from "@mui/material";
import { styled } from "@mui/system";
import modalStyle from "../styles/ModalStyles";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import { Height, Opacity } from "@mui/icons-material";

type InsertFormProps = {
  toggleImport: () => void;
  startLoading: () => void;
};

const styles = {
  dialogPaper: {
    backgroundColor: "#DCF1EC",
    padding: "25px",
  },
  uploadButton: {
    marginTop: "10px",
    borderRadius: "20px",
    height: "45px",
    width: "160px",
    background: "#71C887",
  },
  divider: {
    py: 0,
    width: '100%',
    maxWidth: 360,
    marginTop: "5px",
    marginBottom: "10px",
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
  },
};

const InsertFormPrompt = () => {
  const drop = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const userId = useSelector((state: RootState) => state.auth.userId);

  return (
    <Box sx={modalStyle}>
      <div ref={drop} className="dropArea">
      <div className="uploadTextContainer">
        <Typography variant="h6">
          SELECT FORM TYPE
        </Typography>
        <Divider sx={styles.divider}/>
      <Button
          variant="contained"
          color="primary"
          component="label"
          style={styles.uploadButton}
        >
          Insert
          <input type="file" style={{ display: "none" }} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          component="label"
          style={styles.uploadButton}
        >
          Modify
          <input type="file" style={{ display: "none" }} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          component="label"
          style={styles.uploadButton}
        >
          Delete
          <input type="file" style={{ display: "none" }} />
        </Button>
        </div>
      </div>
    </Box>
  );
};

export default styled(InsertFormPrompt)({});

export {}; // Add this empty export statement
