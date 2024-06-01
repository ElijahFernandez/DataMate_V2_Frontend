import { Box, Button, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx'
import FileService from "../services/FileService";

type ProcessingPageProps = {
    stopLoading: () => void,
    startProcessing: () => void,
    toggleTable: (status:boolean) => void,
    toggleNoTable: (status:boolean) => void,
    setTblCount: (num:number) => void;
    setFileData: (wb: XLSX.WorkBook | null, sheets:string[], vsheets:string[] ,sheetdata: object ) => void,
    reset: () => void,
  }

  interface TableRow {
    [columnName: string]: string | number | boolean;
  }
  
  interface SheetData {
    [sheetName: string]: TableRow[];
  }


export default function ProcessingPage ({reset, stopLoading, startProcessing, toggleTable, toggleNoTable, setTblCount, setFileData}:ProcessingPageProps) {
    const loc = useLocation();
    const nav = useNavigate();
    const fileId = loc.state.fileid;
    const [tblCtr, setTblCtr] = useState<number>(0)
    const [workbook, setWB] = useState<XLSX.WorkBook | null>()
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [visibleSheetNames, setVSheets] = useState<string[]>([]);
    const [sheetData, setSData] = useState<Object>({});
    const [currentSheet, setCurrentSheet] = useState("");
    const [startCount, setStart] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [HeaderArr, setHArr] = useState<[][] | undefined>(undefined)
    const [BodyArr, setBArr] = useState<[][] | undefined>(undefined)
    const [fileName, setFileName] = useState('')
    const [isProcessing, setProcessing] = useState(true);

    //function to remove empty rows in Sheet Object Data
    function sheetjs_cleanEmptyRows(sd:XLSX.SheetType) {
        const data = []
            for (var row = 0; row < sd.length; row++) {
                  var i = sd[row].length;
                  var j = 0;
                for ( var cell = 0; cell < sd[row].length; cell++){
                    if (sd[row][cell].length == 0 ) { 
                        j++
                    }
                }
              if (j < i) {
                data.push(sd[row]);
              }
            }
            return data;
     }

     //function to check if sheet containts table
     function isValidTable(sheetData: SheetData, sheetName: string): boolean {
        const tableData = sheetData[sheetName];

        console.log("Table Data is: ", tableData, "while it's length is: ", tableData.length);
        if(!tableData || !Array.isArray(tableData) || tableData.length < 3) {
            console.log("and that's not a table");  
            return false;
          }
        
        // Checking if all rows have the same number of columns as the first row
        const numColumns = Object.keys(tableData[0]).length;
        for (let i = 1; i < tableData.length; i++) {
        if (Object.keys(tableData[i]).length !== numColumns) {
            console.log("and that's not a table");  
            return false;
        }
        }
        console.log("so it is a table");
        return true;
      }

    const readData = (wb: XLSX.WorkBook) => {
        setSheetNames(wb.SheetNames)
        let sheetdata:Object = {}
        sheetNames.map((sheet, i) => 
        {
            const worksheet = wb.Sheets[sheet];
            const jsondata = XLSX.utils.sheet_to_json(worksheet,{
                header: 1,
                raw: true,
                defval: "",
                dateNF:"YYYY-M-D"

            }) as unknown;
            const sd = sheetjs_cleanEmptyRows(jsondata as XLSX.SheetType)
            const js = sd as Object;
            let parsedJs = parseDatesToStrings(js as (string|number|boolean|Date)[][]);
            sheetdata = {...sheetdata, [sheet]: parsedJs}            
        })
        console.log(sheetdata, "this one right here");
        setSData(sheetdata)
         //typing currentSheet as key of sheetData
         const currSheet = currentSheet as keyof typeof sheetData
         //typing object value as unknown before converting to row
         const row =  sheetData[currSheet] as unknown
         let rowArr = row as [][]
         if(rowArr?.length > 500){
            cancelProcess();
            alert("Maximum amount of rows reached: 500");
         }else{
            setHArr(rowArr)
         }       
         console.log("Sheet Data: ",sheetData);
    }

    //call backend for xlsx data
    const fetchData = async () =>{
        FileService.getFile(fileId).then((res)=>{
            const wb = XLSX.read(res.data,{cellDates:true});
            setFileName(res.fileName);
            setWB(wb);
        }).catch((err)=>{
            console.log(err);
        }) 
    }

    const cancelProcess = () => {
        FileService.deleteFile(fileId).then((res)=>{
          reset();
          nav("/");
        }).catch((err)=>{
          console.log(err);
        })
        
    }

    //useEffect to fetch data on load
    useEffect(()=>{
        setVSheets([]);
        fetchData();
    },[])

    
    //useEffect triggers when workbook or sheetNames state is changed
    //read workbook and toggle start count if workbook state and sheetnames state is changed
    useEffect(()=>{
        if(workbook !== undefined){
           readData(workbook!) 
        }
        //only start count if sheetname is more than 0 
        if(sheetNames.length > 0){
            setStart(true);
        }
       
    },[workbook, sheetNames])

    function parseDatesToStrings(table: (string | number | boolean | Date)[][]): (string | number | boolean | string)[][] {
        const parsedTable: (string | number | boolean | string)[][] = [];
      
        for (const row of table) {
          const parsedRow: (string | number | boolean | string)[] = [];
      
          for (const cell of row) {
            if (cell instanceof Date) {
              // If the cell is a Date, convert it to a string
              parsedRow.push(cell.toISOString().split('T')[0]);
            } else {
              // If the cell is not a Date, keep its original value
              parsedRow.push(cell);
            }
          }
      
          parsedTable.push(parsedRow);
        }
      
        return parsedTable;
    }

    function delete_ws(wb:XLSX.WorkBook, wsname:string) {
        const sidx = wb.SheetNames.indexOf(wsname);
        if(sidx == -1) throw `cannot find ${wsname} in workbook`;
        
        // remove from workbook
        wb.SheetNames.splice(sidx,1);
        delete wb.Sheets[wsname];
      
        // // update other structures
        // if(wb.Workbook) {
        //   if(wb.Workbook.Views) wb.Workbook.Views.splice(sidx, 1);
        //   if(wb.Workbook.Names) {
        //     let names = wb.Workbook.Names;
        //     for(let j = names.length - 1; j >= 0; --j) {
        //       if(names[j]?.Sheet == sidx) names = names.splice(j,1);
        //       else if(names[j]?.Sheet > sidx) --names[j]?.Sheet;
        //     }
        //   }
        // }
    }

    //start counting sheet amount once start count boolean is changed
    useEffect(()=>{
        if(startCount){

            let ctr = 0
            console.log("sn: ",sheetNames);
            //push table sheets to vsheets
            sheetNames.map((sheet, i) => {
                const sheetAttr = sheet as keyof typeof sheetData
                if(isValidTable(sheetData as SheetData, sheetAttr)){
                    visibleSheetNames.push(sheet);
                    ctr++; 
                }               
            })
            //delete sheets that are not a table
            sheetNames.map((sheet, i) => {
                const sheetAttr = sheet as keyof typeof sheetData
                if(!isValidTable(sheetData as SheetData, sheetAttr)){
                    delete_ws(workbook!, sheet)
                }               
            })
            if(ctr != 0){
                setTblCtr(ctr)
                setCurrentSheet(visibleSheetNames[0]);
            }else{
                //open no table prompt here
                toggleNoTable(true);
                stopLoading();
                startProcessing();
            }
            
            // sheetNames.map((name) => {
            //     const sheetAttr = name as keyof typeof sheetData
            //         const sheetrow =  sheetData[sheetAttr] as unknown
            //         let sheetrowArr = sheetrow as [][]
            //         if(sheetrowArr[0].length > 2){
            //            visibleSheetNames.push(name);
            //         }
            // })
            
        }
    }, [startCount])

    //alert once table counter is changed and start count is true
    useEffect(()=>{
        if(startCount){
            if(tblCtr > 0){
                //open table prompt here
                setTblCount(tblCtr);
                toggleTable(true);
            }
            stopLoading();
            startProcessing();
        }
    },[tblCtr])


    //assign variables in the App scope once all values have been defined
    useEffect(()=>{
        if( workbook !== undefined &&
            sheetNames !== null &&
            visibleSheetNames !== null &&
            sheetData !== undefined){
                setFileData(workbook, sheetNames, visibleSheetNames, sheetData);
            }
    },[sheetData, visibleSheetNames])


    //pagination functions ------------------------------------------
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    };
    //---------------------------------------------------------------

    const changeSheet = (stringevent: React.SyntheticEvent, newValue: string) =>{
        setCurrentSheet(newValue);
    }
    
    
    //useEffect for re-assigning the header array for the table when currentSheet state has changed
    useEffect(()=>{
        //typing currentSheet as key of sheetData
        const currSheet = currentSheet as keyof typeof sheetData
        //typing object value as unknown before converting to row
        const row =  sheetData[currSheet] as unknown
        let rowArr = row as [][]
        setHArr(rowArr)
    },[currentSheet])

    //useEffect for re-assigning the body array for the table when Header array state has changed
    useEffect(()=>{
        if(HeaderArr !== undefined){
            let rowsArr = []
            //copy rowArr
            rowsArr = HeaderArr.slice(0); 
            console.log("Before", rowsArr)
            //remove header values
            rowsArr.splice(1 - 1, 1);
            console.log("After", rowsArr)
            setBArr(rowsArr)
        }
        console.log("BArr",BodyArr)
    },[HeaderArr])


    

    return(
        <>
            <div className="gradientbg" style={{paddingTop:"50px", paddingRight:"50px", width:'100%',height:'100vh'}}>
                {HeaderArr !== undefined && BodyArr !== undefined && !isProcessing ? <>
                <div style={{marginRight:'70px', marginLeft:'50px', padding:'15px', height:'80vh', opacity:.8}}>
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
                                            {cell === true? "TRUE": cell === false? "FALSE": cell}
                                            </TableCell>:
                                            <></>
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
                        {/* <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={BodyArr.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        /> */}
                            </Paper>
                            {/* <Box sx={{ width: '100%', marginBottom:'1em', marginTop:'1px' }}>
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
                        </Box>         */}
                    </div>
                </div>
                </>:<></>}
            </div>
        
        </> 
    )
}