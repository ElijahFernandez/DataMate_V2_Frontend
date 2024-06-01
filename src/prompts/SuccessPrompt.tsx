import { useNavigate } from "react-router-dom";
import FileService from "../services/FileService";
import { Box, Button, styled } from "@mui/material";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";

const styles = {
  dialogPaper: {
    backgroundColor: "#DCF1EC",
    padding: "25px",
  },
  uploadButton: {
    marginTop: "5px",
    borderRadius: "50px",
    width: "250px",
    background: "#71C887",
  },
};

type SuccessProps = {
  toggleImportSuccess: (status: boolean) => void;
  fileId: number;
  reset: () => void;
  workbook: XLSX.WorkBook | null | undefined;
  sdata: Object;
  startLoading: () => void,
  stopLoading: () => void,
};

interface WorkbookData {
  [sheet: string]: Object[];
}

interface TableRow {
  [key: string]: string | number;
}

const SuccessPrompt = ({
  fileId,
  toggleImportSuccess,
  reset,
  workbook,
  sdata,
  startLoading, 
  stopLoading,
}: SuccessProps) => {
  const nav = useNavigate();
  const [fileName, setFName] = useState("");

  useEffect(() => {
    startLoading();
    FileService.getFile(fileId)
      .then((res) => {
        stopLoading();
        setFName(res.fileName);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function getFileType(filename: string) {
    var re = /(?:\.([^.]+))?$/;
    var res = re.exec(filename) as unknown;
    return res as String;
  }

  //workbook to Array Buffer method
  function s2ab(s: String) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf); //create uint8array as viewer
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
    return buf;
  }

  function okFunction() {
    console.log(workbook);
    if (workbook !== undefined && workbook !== null) {
      var wopts: XLSX.WritingOptions = {
        bookType: getFileType(fileName)
          ? "xlsx"
          : (getFileType(fileName) as XLSX.BookType),
        type: "binary",
      };
      const wbString = XLSX.write(workbook, wopts);
      var blob = new Blob([s2ab(wbString)], {
        type: "application/octet-stream",
      });
      startLoading();
      FileService.putFile(fileId, blob as File, fileName)
        .then((res) => {
          reset();
          toggleImportSuccess(false);
          stopLoading();
          nav("/files/file", {
            state: {
              fileid: fileId,
            },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      alert("ERROR: Workbook is NULL or undefined");
    }
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 798,
        maxHeight: 594,
        bgcolor: "#71C887",
        boxShadow: 24,
        p: 2,
      }}
    >
      <div
        style={{ marginTop: "3%", padding: "2em", backgroundColor: "#DCF1EC" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "Center",
            flexDirection: "column",
            margin: "2em",
          }}
        >
          <p
            style={{
              fontSize: "24px",
              padding: 0,
              margin: 0,
              textAlign: "center",
            }}
          >
            No detected Inconsistencies,
          </p>
          <p
            style={{
              fontSize: "24px",
              padding: 0,
              margin: 0,
              textAlign: "center",
            }}
          >
            Data is imported successfully!
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Button
            disableElevation
            onClick={okFunction}
            variant="contained"
            sx={{
              fontSize: "24px",
              backgroundColor: "#71C887",
              color: "white",
              borderRadius: 50,
              paddingInline: 7,
              margin: "5px",
            }}
          >
            OK
          </Button>
        </div>
      </div>
    </Box>
  );
};

export default styled(SuccessPrompt)({});

export {}; // Add this empty export statement
