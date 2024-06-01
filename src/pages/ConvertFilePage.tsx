import { useEffect, useState } from "react";
import FileService from "../services/FileService";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { start } from "repl";
import styled from "@emotion/styled";
import axios from "axios";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";
import "@inovua/reactdatagrid-community/theme/green-light.css";
import ConvertService from "../services/ConvertService";
import DatabaseService from "../services/DatabaseService";
import TableService from "../services/TableService";
import { RootState } from "../helpers/Store";
import { useSelector } from "react-redux";
import CryptoJS from 'crypto-js';


type ConvertProps = {
    startLoading: () => void,
    updateNorm: (item:string) => void,
    normSheets: string[],
    toggleNormalized: (status:boolean, id: number) => void,
}
interface HeaderConfig {
  name: string;
  header: string;
  defaultVisible?: boolean;
  defaultFlex: number;
  headerProps?: {
    style: {
      backgroundColor: string;
      color: string;
      fontWeight: string;
    };
  };
}

interface TableRow {
  [key: string]: string | number | boolean | Date;
}

interface WorkbookData {
    [sheet: string]: Object[];
}

type ConvertCommand = {
    tblName: string;
    tblColumns: string;
    insertValues: string;
}

type DatabaseResponse = {
  databaseId: number;
  databaseName: string;
  user: Object;
};

type TableResponse = {
  tableId: number;
  tableName: string;
  database: Object;
  user: Object;
};

export default function ConvertFilePage({startLoading, normSheets, updateNorm, toggleNormalized}:ConvertProps) {
    const loc = useLocation();
    const nav = useNavigate();
    const fileId = loc.state.fileid;
    const [tblCtr, setTblCtr] = useState<number>(0)
    const [workbook, setWB] = useState<XLSX.WorkBook | null>()
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [visibleSheetNames, setVSheets] = useState<string[]>([]);
    const [sheetData, setSData] = useState<Object>({});
    const [currentSheet, setCurrentSheet] = useState("");
    const [currSheetID, setCurrSheetID] = useState("");
    const [startCount, setStart] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [HeaderArr, setHArr] = useState<[][] | undefined>(undefined)
    const [BodyArr, setBArr] = useState<[][] | undefined>(undefined)
    const [isLoading, setLoading] = useState(true);
    const [convertToDS, setConvertToDS] = useState(false);
    const [dataCols, setDataCols] = useState<HeaderConfig[]>();
    const [dataSrc, setDataSrc] = useState<Object[]>();
    const [SQLCommands, setSQLCmds] = useState<ConvertCommand[]>([]);
    const gridstyle = {
        fontSize:"10px",
        height:"50vh",
    }
    const [fileName, setFileName] = useState("");
    const [databaseId, setDatabaseId] = useState(-1);
    const [isDone, setDone] = useState(false);
    const userId = useSelector((state: RootState) => state.auth.userId);



  // Sheet Data functions -----------------------------------------------------------------------
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
    console.log("and this workbook is passed ", wb);
    setSheetNames(wb.SheetNames);
    let sheetdata: Object = {};
    wb.SheetNames.map((sheet, i) => {
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
    console.log("sheetdata on readData: ", sheetdata);
    setSData(sheetdata);
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

  //fetch data on load
  useEffect(() => {
    setVSheets([]);
    fetchData();
  }, []);

  //read workbook and toggle start count if workbook state and sheetnames state is changed
  useEffect(() => {
    if (workbook !== undefined) {
      console.log("this is called");
      readData(workbook!);
    }
  }, [workbook]);

  useEffect(() => {
    if (sheetNames !== undefined && sheetNames !== null) {
      sheetNames.map((name) => {
        if (!visibleSheetNames.includes(name)) {
          visibleSheetNames.push(name);
        }
      });
      setCurrentSheet(visibleSheetNames[0]);
      console.log("sheetData state: ", sheetData);
    }
  }, [sheetData]);

  const changeSheet = (event: SelectChangeEvent) => {
    setCurrSheetID(event.target.value);
    let SheetName =
      workbook!.SheetNames[event.target.value as unknown as number];
    setCurrentSheet(SheetName!);
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
  }, [HeaderArr]);

  useEffect(() => {
    if (HeaderArr !== undefined && BodyArr !== undefined) {
      setConvertToDS(true);
    }
  }, [BodyArr]);
  //-----------------------------------------------------------------------------------------------------

    //Data Grid Functions----------------------------------------------------------------------------------
    useEffect(()=>{
        if(convertToDS){
            let sdata = JSON.parse(JSON.stringify(sheetData[currentSheet as keyof typeof sheetData] as unknown as [][]));
            console.log("Setting data columns to ", createColumns(sdata[0]));
            setDataCols([]);
            setDataCols(createColumns(sdata[0]));
        }
    }, [convertToDS, currentSheet])

    useEffect(()=>{
        if(dataCols !== null && dataCols !== undefined){
            let sdata = JSON.parse(JSON.stringify(sheetData[currentSheet as keyof typeof sheetData] as unknown as [][]));
            sdata.shift();
            let datasrc = createDataSrc(dataCols, sdata);
            console.log("setting dataSrc to ", datasrc);
            setDataSrc([]);
            setDataSrc(datasrc);
        }
    },[dataCols])
    
    
    function createDataSrc(headerConfigs: HeaderConfig[], values:[][]): TableRow[]{
        console.log("values are ", values);
        const table:TableRow[] = [];
        const headers: string[] = headerConfigs.map(config => config.name);
    

        values.forEach(rowValues => {
            console.log("rowvalues: ", rowValues.length, " === headers:", headers.length);
          if (rowValues.length !== headers.length) {
            throw new Error('Number of values does not match number of headers.');
          }
          const row: TableRow = {};
          
          headers.forEach((header, index) => {
            const value = rowValues[index] as string;
            if (!isNaN(value as unknown as number) && !isNaN(parseFloat(value))) {
                // Check if the value is a valid number
                row[header] = parseFloat(value);
            } else if (!isNaN(Date.parse(value))) {
                // Check if the value is a valid date
                row[header] = new Date(value).toISOString().split('T')[0];
            }else {
                // If not a number, date, or boolean, keep it as a string
                row[header] = value;
            }       
          });
    
          table.push(row);
        });
        return table;
      }
    
    function createColumns(strings: string[]): HeaderConfig[] {
        let strArr:HeaderConfig[] = [];
    
        strings.map((str, i)=>
        {
          strArr.push({
            name: str,
            header: str,
            defaultFlex: 1,
            headerProps:{
              style: { backgroundColor: '#71C887', color:"white", fontWeight: 'bold' 
            },
            }
          } 
          );
        });
      
        return strArr;
    }
    
    //-----------------------------------------------------------------------------------------------------
    //Normalization functions ------------------------------------------------------------------------------

    //function for checking if a table has a primary key
    function hasPossiblePrimaryKey(table: TableRow[]): boolean {
    console.log("Checking table: ", table);
    if (table.length === 0) {
      console.log("There is no table, returning false...");
      return false; // The table is empty
    }
  
    let isFirstIteration = true;
    const firstColumnValues: Set<number> = new Set();

    for (const row of table) {
      if (isFirstIteration) {
        isFirstIteration = false;
        continue; // Skip the first iteration (headers)
      }

      const firstColumnValue = row[Object.keys(row)[0]]; // Get the value of the first column in each row

      if (Number.isNaN(Number(firstColumnValue)) || firstColumnValues.has(firstColumnValue as number)) {
        console.log(firstColumnValue,":", Number.isNaN(Number(firstColumnValue))," is non-numeric or duplicate, returning false...");
        return false; // The first column has a non-numeric value or a duplicate value
      }

      firstColumnValues.add(firstColumnValue as number);
    }
    
  
  
    console.log("First column is a primary key, returning true...");
    return true; // The first column has unique numeric values
  }

  //getting a string array of a column name and its dependencies
  function getColumnDependencies(columnName: string, table: (string | number)[][], doneSearching: string[]): string[] {
  const columnIndex = table[0].indexOf(columnName);

  if (columnIndex === -1) {
    return [];
  }

  const numRows = table.length;
  const dependencies: string[] = [columnName];

  for (let col = 1; col < table[0].length; col++) {
    if (col !== columnIndex) {
      const otherColumn = table[0][col];
      let isDependency = true;

      for (let row = 1; row < numRows; row++) {
        const targetValue = table[row][columnIndex];
        const otherValue = table[row][col];

        if (!hasCorrespondingValue(table, columnName, otherColumn as string, targetValue, otherValue)) {
          isDependency = false;
          break;
        }
      }

      if (isDependency && !doneSearching.includes(otherColumn as string)) {
        dependencies.push(otherColumn as string);
      }
    }
  }

  return dependencies;
}

function hasCorrespondingValue(table: (string | number)[][], columnName1: string, columnName2: string, targetValue: any, currentValue: any): boolean {
  const columnIndex1 = table[0].indexOf(columnName1);
  const columnIndex2 = table[0].indexOf(columnName2);

  if (columnIndex1 === -1 || columnIndex2 === -1) {
    return false;
  }

  for (let row = 1; row < table.length; row++) {
    if (table[row][columnIndex1] === targetValue && table[row][columnIndex2] !== currentValue) {
      return false;
    }
  }

  return true;
}

  function canBeNormalized(rows: (string | number)[][]): boolean {
    let doNotSearch:string[] = [];
    const numCols = rows[0].length;
    let res = false;

    for (let col = 0; col < numCols; col++) {
      const columnName = rows[0][col];
      if(!doNotSearch.includes(columnName as string)){
        let depArr = getColumnDependencies(columnName as string, rows, doNotSearch);
        if(depArr.length > 1 && depArr.length !== numCols - col){
          for(const col in depArr){
            //inserting the column and the dependencies into do not search
            doNotSearch.push(depArr[col]); 
          } 
          //concat the columns in the depArr as table
          console.log("can be normalized returning true...");
          res = true;
          break;
        }else{
          doNotSearch.push(columnName as string);
        }
      }
    }
    console.log("cannot be normalized returning false...");
    return res;
  }

    //-----------------------------------------------------------------------------------------------------
    //Button functions ------------------------------------------------------------------------------------
    function handleBack(){
        nav('/files/file',{
            state:{
              fileid: fileId
            }
        });
    }

    // function getFileType(filename:string){
    //     var re = /(?:\.([^.]+))?$/;
    //     var res = re.exec(filename) as unknown;
    //     return res as string;
    // }

    //workbook to Array Buffer method
    // function s2ab(s:String) { 
    // var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    // var view = new Uint8Array(buf);  //create uint8array as viewer
    // for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    // return buf;    
    // }

  function getColumnType(value: any): string {
    console.log("Type of ", value, " is ", typeof value);
    if (typeof value === "string") {
      return "VARCHAR(255)";
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        if (value > 2000000000) {
          return "VARCHAR(255)";
        } else {
          return "INTEGER";
        }
      } else {
        return "DECIMAL";
      }
    } else if (typeof value === "boolean") {
      return "BOOLEAN";
    } else if (value instanceof Date) {
      return "TIMESTAMP";
    } else {
      throw new Error(`Unsupported data type: ${typeof value}`);
    }
  }

    function generateConvertCommandObject(jsonData: TableRow[], tableName: string): ConvertCommand {
        if (jsonData.length === 0) {
            throw new Error("JSON array is empty.");
        }
        const columns: string[] = Object.keys(jsonData[0]);
        let newTblName = tableName.replace(/[^a-zA-Z0-9]/g,'_'); 
        console.log("new name: ",newTblName)
        const tblColsQuery = `(${columns.map(col => `${col.replace(/[^a-zA-Z0-9]/g,'_')} ${getColumnType(jsonData[0][col])}`).join(', ')});`;
    

        const insertValues = jsonData.map(record => `(${columns.map(col => {
            const value = record[col];
            if(value === "NULL"){
                return 'NULL';
            }
            if (typeof value === "string") {
                return `'${value}'`;
              } else if (value instanceof Date) {
                // Format date as 'YYYY-MM-DD'
                return `'${value.toISOString().split("T")[0]}'`;
              } else {
                if ((value as number) > 2000000000) {
                  return `'${value}'`;
                } else {
                  return value;
                }
            }
        }).join(', ')})`).join(', ');
    
        let SQLcolumns: string[] = Object.keys(jsonData[0]).map(key => key.replace(/[^a-zA-Z0-9]/g,'_'));
        console.log("join: ", SQLcolumns.join(', '));
        const valsQuery = `(${SQLcolumns.join(', ')}) VALUES ${insertValues};`;
        
        return {
            tblName: `${newTblName}`,
            tblColumns:`${tblColsQuery}`,
            insertValues: `${valsQuery}`
        };
    }

    const uid = function(){
        return Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9*Math.pow(10, 12)).toString(36);
    }

    function handleConfirm(){
        const sd = sheetData as WorkbookData;
        let isNormalized = true;
        for (const s in visibleSheetNames){
            console.log("checking sheet:", visibleSheetNames[s]);
            console.log("result: ", hasPossiblePrimaryKey(sd[visibleSheetNames[s]] as TableRow[]) && !canBeNormalized(sd[visibleSheetNames[s]] as [][]));
            console.log(visibleSheetNames[s]," has possible pk: ", hasPossiblePrimaryKey(sd[visibleSheetNames[s]] as TableRow[]), "can be normalized: ", canBeNormalized(sd[visibleSheetNames[s]] as [][]));
            //if block for normalized prompt
            console.log("prompt condition:", (!(hasPossiblePrimaryKey(sd[visibleSheetNames[s]] as TableRow[])) && canBeNormalized(sd[visibleSheetNames[s]] as [][])));
            if(!(hasPossiblePrimaryKey(sd[visibleSheetNames[s]] as TableRow[])) || canBeNormalized(sd[visibleSheetNames[s]] as [][])){
              console.log("this happened for ", visibleSheetNames[s]);
              isNormalized = false;
              console.log("current normList:", normSheets);
              if(!normSheets.includes(visibleSheetNames[s])){
                updateNorm(visibleSheetNames[s]);  
                }
            }
        }
        console.log("is it normalized? ",isNormalized)
        if(isNormalized){
            getSQLQuery();
        }else{
            console.log("normalized prompt: ", toggleNormalized);
            toggleNormalized(true, fileId);
        }
    }

    function getSQLQuery(){
        if(dataCols !== undefined && sheetData !== undefined){
            let sql2dArr:ConvertCommand[] = [...SQLCommands];
            let dbname = fileName.replace(/\.[^/.]+$/, "");
            console.log("dbname val: ", dbname);
            startLoading();

            const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';
            const decryptedUserId = CryptoJS.AES.decrypt(userId, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

            DatabaseService.postDatabase(dbname, decryptedUserId).then((res)=>{
                    console.log("post res:", res);
                    let dbres = res as unknown as DatabaseResponse;
                    let dbId = dbres.databaseId;
                    setDatabaseId(dbId);
                    visibleSheetNames.map((sheet, i) =>{
                        let sheetSD = JSON.parse(JSON.stringify(sheetData[sheet as keyof typeof sheetData] as unknown as [][]));
                        let headers = sheetSD.shift();
                        let dataCols = createColumns(headers);
                        let dataSrc = createDataSrc(dataCols, sheetSD);
                        let uniquetblName = sheet.replace(/[^a-zA-Z0-9]/g,'_') + "_" + uid();
                        TableService.postTable(uniquetblName, dbId, decryptedUserId, headers)
                        .then((res)=>{
                            console.log("post table res:", res);
                        }).catch((err)=>{
                            console.log(err);
                        })
                        sql2dArr.push(generateConvertCommandObject(dataSrc as TableRow[], uniquetblName));
                    })
                    setSQLCmds(sql2dArr);
            }).catch((err)=>{
                console.log(err);
            });
      }
    }
    // using SQLizer API
    // if(workbook !== undefined && workbook !== null){
    //     let type = getFileType(fileName);
    //     var wopts:XLSX.WritingOptions = { bookType:getFileType(fileName)? 'xlsx': getFileType(fileName) as XLSX.BookType, type:'binary' };
    //     const wbString = XLSX.write(workbook, wopts);
    //     var blob = new Blob([s2ab(wbString)],{type:"application/octet-stream"});

    //     let dataID = "";
    //     ConvertService.postFileEntity(fileName, type)
    //     .then((res)=>{
    //         console.log("postFileEntity RES:", res);
    //         ConvertService.uploadFile(blob as File, res.ID)
    //         .then((res)=>{
    //             console.log("uploadFile RES:", res);
    //             if(res.Status === "Ok"){
    //                 ConvertService.putFileEntity(dataID)
    //                 .then((res)=>{
    //                     console.log("putFileEntity RES:", res);
    //                     //set state of doneUploading to true
    //                 }).catch((err)=>{
    //                     console.log("PuFE",err);
    //                 })
    //             }else{
    //                 alert("API Error in uploading file!");
    //                 nav("/");
    //             }
    //         }).catch((err)=>{
    //             console.log("UF", err);
    //         })
    //     }).catch((err)=>{
    //         console.log("PFE",err);
    //     })
    //   }else{
    //     alert("ERROR: Workbook is NULL or undefined");
    // }

    useEffect(()=>{
        if(SQLCommands !== null && SQLCommands.length > 0){
            console.log("SQL Commands are: ", SQLCommands);
            let i = 0;
            SQLCommands.map((com, i)=>{
            ConvertService.postCommand(com.tblName, com.tblColumns, 1)
            .then((res)=>{
                console.log("Table Created!");
                ConvertService.postCommand(com.tblName, com.insertValues, 2)
                .then((res)=>{
                    i++;
                    console.log("Values Inserted!");
                    if(i === SQLCommands.length){
                        setDone(true);
                    }            
                }).catch((err)=>{
                    console.log(err);
                })
            }).catch((err)=>{
                console.log(err);
            })
            })
        }
    }, [SQLCommands])

    useEffect(()=>{
        if(isDone){
           nav('/database',{
            state:{
              dbid: databaseId
            }
            }); 
        }
        
    }, [isDone])
    //-----------------------------------------------------------------------------------------------------
    return(
        <>
            <div style={{marginRight:'50px', marginLeft:'50px', maxHeight:'80vh', marginTop:'100px'}}>
            <h1 style={{textAlign:'center'}}>Convert Spreadsheet to Database?</h1>
                <div style={{marginTop:"1em"}}>
                    <div style={{marginLeft:"10%"}}>
                        <FormControl fullWidth>
                            <InputLabel id="input-label0id">Table</InputLabel>
                                <Select
                                labelId="select-table"
                                id="select-table-id"
                                value={currSheetID}
                                label="Table"
                                onChange={changeSheet}
                                sx={{width: 200, color:"black"}}
                                >
                                {visibleSheetNames.length > 0? 
                                visibleSheetNames.map((sheet, i) =>{
                                    return <MenuItem value={i} key={i}>{sheet}</MenuItem>
                                }):<MenuItem value={0} key={0}>None</MenuItem>   
                                }
                                </Select>
                        </FormControl>
                    </div>
                    <Box sx={{ width: '100%', display:"flex", justifyContent:"center"}}>
                        <Paper style={{width: '80%'}}>
                        <div style={{width: '100%'}}>
                        {/* for table preview */}
                        {dataCols !== undefined && dataSrc !== undefined? <>
                            <Paper elevation={0} sx={{ maxHeight:'500px', overflow: 'auto', border:"5px", borderRadius: 0}}>
                            {/* //code for the table */}
                            <ReactDataGrid
                                idProperty="id"
                                style={gridstyle}
                                columns={dataCols}
                                dataSource={dataSrc}
                                theme="green-light"
                            />
                            </Paper>     
                            </>:
                            <><CircularProgress size="10rem" 
                            color="success" />
                            </>}
                        </div>
                        </Paper>
                    </Box>
                    <div>
                        <p style={{fontStyle:"italic", fontSize:"14px", textAlign:"center"}}>Preview</p>
                    </div>
                    <div style={{display:"flex", flexDirection:'row', justifyContent:"space-around"}}>
                            <Button
                            onClick={handleBack}
                            sx={{fontWeight: 'bold', color:'black', paddingInline: 4, margin:'5px', boxShadow:5, borderRadius:5}}>
                                Back
                            </Button>
                            <Button variant="contained" 
                            onClick={handleConfirm}
                            sx={{fontWeight: 'bold', backgroundColor: '#347845', color:'white', paddingInline: 4, margin:'5px', boxShadow:5, borderRadius:5}}>
                                Confirm
                            </Button>
                    </div>            
                </div>
            </div>
        </> 
    )
}
