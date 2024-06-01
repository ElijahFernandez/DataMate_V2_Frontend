import { useEffect, useState } from "react";
import FileService from "../services/FileService";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  Modal,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { start } from "repl";
import styled from "@emotion/styled";
import axios from "axios";
import Topbar from "../components/Topbar";
import Navbar from "../components/Navbar";

// type FileResponseType = {
//     fileId: number,
//     fileSize: number,
//     fileName: string,
//     uploadDate: string,
//     latestDateModified: string,
//     isdeleted: boolean,
//     data: Blob
// }

type FilePageProps = {
  startLoading: () => void;
  stopLoading: () => void;
};

export default function Filepage({ startLoading,stopLoading }: FilePageProps) {
  const loc = useLocation();
  const nav = useNavigate();
  const fileId = loc.state.fileid;
  const [tblCtr, setTblCtr] = useState<number>(0);
  const [workbook, setWB] = useState<XLSX.WorkBook | null>();
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [visibleSheetNames, setVSheets] = useState<string[]>([]);
  const [sheetData, setSData] = useState<Object>({});
  const [currentSheet, setCurrentSheet] = useState("");
  const [startCount, setStart] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [HeaderArr, setHArr] = useState<[][] | undefined>(undefined);
  const [BodyArr, setBArr] = useState<[][] | undefined>(undefined);
  const [fileName, setFileName] = useState("");

  //function to remove empty rows in Sheet Object Data
  function sheetjs_cleanEmptyRows(sd: XLSX.SheetType) {
    const data = [];
    for (var row = 0; row < sd.length; row++) {
      var i = sd[row].length;
      var j = 0;
      for (var cell = 0; cell < sd[row].length; cell++) {
        if (sd[row][cell].length == 0) {
          j++;
        }
      }
      if (j < i) {
        data.push(sd[row]);
      }
    }
    return data;
  }

  const readData = (wb: XLSX.WorkBook) => {
    setSheetNames(wb.SheetNames);
    let sheetdata: Object = {};
    sheetNames.map((sheet, i) => {
      const worksheet = wb.Sheets[sheet];
      const jsondata = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: "",
      }) as unknown;
      const sd = sheetjs_cleanEmptyRows(jsondata as XLSX.SheetType);
      const js = sd as Object;
      sheetdata = { ...sheetdata, [sheet]: js };
    });
    setSData(sheetdata);
    //typing currentSheet as key of sheetData
    const currSheet = currentSheet as keyof typeof sheetData;
    //typing object value as unknown before converting to row
    const row = sheetData[currSheet] as unknown;
    let rowArr = row as [][];
    setHArr(rowArr);
    console.log(sheetNames);
    console.log(visibleSheetNames);
  };

  //call backend for xlsx data
  const fetchData = async () => {
    FileService.getFile(fileId)
      .then((res) => {
        const wb = XLSX.read(res.data);
        setFileName(res.fileName);
        setWB(wb);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const downloadFile = async () => {
    startLoading();
    axios({
      // url: "https://datamate-api.onrender.com/downloadFile/" + fileId,
      url: "http://localhost:8080/downloadFile/" + fileId,
      method: "GET",
      responseType: "arraybuffer",
    }).then(async (response) => {
      const blobData: Blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml;charset=UTF-8",
      });
      stopLoading();
      const href = URL.createObjectURL(blobData);

      // create "a" HTML element with href to file & click
      const link = document.createElement("a");
      link.href = href;
      // const name = JSON.stringify(fileName)
      link.setAttribute("download", "file.xlsx"); //or any other extension
      document.body.appendChild(link);
      link.click();

      // clean up "a" element & remove ObjectURL
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    });
  };

  //fetch data on load
  useEffect(() => {
    setVSheets([]);
    fetchData();
  }, []);

  //read workbook and toggle start count if workbook state and sheetnames state is changed
  //only start count if sheetname is more than 0
  useEffect(() => {
    if (workbook !== undefined) {
      readData(workbook!);
    }
    if (sheetNames.length > 0) {
      setStart(true);
    }
  }, [workbook, sheetNames]);

  //start counting sheet amount once start count boolean is changed
  useEffect(() => {
    if (startCount) {
      let ctr = 0;
      sheetNames.map((sheet, i) => {
        const sheetAttr = sheet as keyof typeof sheetData;
        const row = sheetData[sheetAttr] as unknown;
        let rowArr = row as [][];
        ctr++;
      });
      setTblCtr(ctr);
      sheetNames.map((name) => {
        visibleSheetNames.push(name);
      });
      setCurrentSheet(visibleSheetNames[0]);
    }
  }, [startCount]);

  //alert once table counter is changed and start count is true
  useEffect(() => {
    if (startCount) {
      stopLoading();
    }
  }, [tblCtr]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const changeSheet = (stringevent: React.SyntheticEvent, newValue: string) => {
    setCurrentSheet(newValue);
  };

  useEffect(() => {
    //typing currentSheet as key of sheetData
    const currSheet = currentSheet as keyof typeof sheetData;
    //typing object value as unknown before converting to row
    const row = sheetData[currSheet] as unknown;
    let rowArr = row as [][];
    setHArr(rowArr);
  }, [currentSheet]);

  useEffect(() => {
    if (HeaderArr !== undefined) {
      let rowsArr = [];
      //copy rowArr
      rowsArr = HeaderArr.slice(0);
      console.log("Before", rowsArr);
      //remove header values
      rowsArr.splice(1 - 1, 1);
      console.log("After", rowsArr);
      setBArr(rowsArr);
    }
    console.log("BArr", BodyArr);
  }, [HeaderArr]);

    const handleConvert = () => {
        nav('/convert',{
            state:{
              fileid: fileId
            }
        });
    }
    

    return(
        <>
        {HeaderArr !== undefined && BodyArr !== undefined? <>
            <div style={{marginRight:'50px', marginLeft:'50px', height:'80vh', marginTop:'100px'}}>
            <h1>{fileName}</h1>
                <div style={{marginTop:"1em"}}>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 470, width: '90vw'}}>
                        <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <tr>
                                {
                                HeaderArr[0].map((col,i) => <TableCell
                                key={i}
                                align='left'
                                style={{ minWidth: 100 }}><b>{col}</b></TableCell>)
                                }
                            </tr>
                        </TableHead>
                        <TableBody>
                            {BodyArr
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, i) => {
                                return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                                    {row.map((cell, j) => {
                                    return (
                                        <>
                                        {cell !== ""?
                                        <TableCell key={j} align='left'>
                                        {cell === true? "TRUE": cell === false? "FALSE":cell}
                                        </TableCell>:
                                        <TableCell key={j} align='left'>
                                        </TableCell>
                                        }
                                        </>
                                    );
                                    })}
                                </TableRow>
                                );
                            })}
                        </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={BodyArr.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                        </Paper>
                        <Box sx={{ width: '100%', marginBottom:'1em', marginTop:'1px' }}>
                        <Tabs
                        value = {currentSheet}
                        onChange={changeSheet}
                        TabIndicatorProps={{sx:{backgroundColor:'rgba(0,0,0,0)'}}}
                        sx={{
                        "& button":{borderRadius: 2, color: 'black', backgroundColor: 'white'},
                        "& button.Mui-selected":{backgroundColor: '#D9D9D9', color: 'black'},
                        }}
                        aria-label="secondary tabs example"
                        >
                        {visibleSheetNames.length > 0? visibleSheetNames.map((sheet,i) =>{
                            return(                                
                                <Tab sx={{backgroundColor:"#D9D9D9"}}value={sheet} label={sheet} />
                            )
                        }):<></>}
                    </Tabs>
                    </Box>
                        <div style={{display:"flex", flexDirection:'row'}}>
                            <Button variant="contained" 
                            onClick={handleConvert}
                            sx={{fontWeight: 'bold', backgroundColor: '#347845', color:'white', paddingInline: 4, margin:'5px'}}>Convert to Database</Button>
                            <Button
                            onClick={downloadFile} 
                            sx={{fontWeight: 'bold', color:'black', paddingInline: 4, margin:'5px'}} >Download</Button>
                        </div>            
                </div>
            </div>
        </>:<></>}
        </> 
    )
}
