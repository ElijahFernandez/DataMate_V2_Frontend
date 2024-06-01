import { Snackbar as SnackbarBase, IconButton } from "@mui/material";
import { useContext } from "react";
import { Close } from "@mui/icons-material";
import {
  SnackbarContext,
  SnackbarContextType,
} from "../helpers/SnackbarContext";

const Snackbar = () => {
  const { message, handleSetMessage } = useContext(
    SnackbarContext
  ) as SnackbarContextType;

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    handleSetMessage(null);
  };

  return (
    <SnackbarBase
      open={message !== null}
      autoHideDuration={3000}
      onClose={handleClose}
      message={message}
      action={
        <IconButton onClick={handleClose} color="inherit">
          <Close fontSize="small" />
        </IconButton>
      }
    />
  );
};

export default Snackbar;
export {};
