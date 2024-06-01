import { useLocation, useNavigate } from "react-router-dom";
import modalStyle from "../styles/ModalStyles";
import * as XLSX from 'xlsx'
import { Box, Button, CircularProgress, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, styled } from "@mui/material";
import { useEffect, useState } from "react";
import FileService from "../services/FileService";
import { table } from "console";
import { tab } from "@testing-library/user-event/dist/tab";
import TableService from "../services/TableService";
import DatabaseService from "../services/DatabaseService";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import ConvertService from "../services/ConvertService";
import CryptoJS from 'crypto-js';



const styles = {
    dialogPaper: {
      backgroundColor: '#DCF1EC',
      padding: "25px",
    },
    uploadButton: {
        marginTop: '5px',
        borderRadius: '50px',
        width: '250px',
        background: '#71C887',
      },
};
interface TableRow {
  [key: string]: string | number | boolean | Date;
}
  
interface SheetData {
  [sheetName: string]: TableRow[];
}

type ConvertCommand = {
  tblName: string;
  tblColumns: string;
  insertValues: string;
}

type DatabaseResponse ={
  databaseId: number;
  databaseName: string;
  user: Object;
}

type TableResponse ={
  tableId: number;
  tableName: string;
  database: Object;
  user: Object;
}

interface HeaderConfig {
  name: string;
  header: string;
  defaultVisible?: boolean,
  defaultFlex: number,
  headerProps?: {
      style: {
      backgroundColor: string;
      color: string;
      fontWeight: string;
  };},
}

type NormalizeProps = {
    toggleNormalized: (status:boolean, id: number) => void,
    fileId: number,
    normList:string[],
    reset: () => void,
    startLoading: () => void,
  }

interface WorkbookData {
    [sheet: string]: Object[];
}

interface TableRow {
    [key: string]: string | number;
}

interface NewTable {
    tableName: string,
    tableValues: (string | number)[][],
}


const NormalizePrompt = ({toggleNormalized, fileId, startLoading, normList, reset}: NormalizeProps) => {  
  const [currentSheet, setCurrentSheet] = useState("");
  const [workbook, setWB] = useState<XLSX.WorkBook | null>()
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [vsheets, setVSheets] = useState<string[]>([]);
  const [sheetdata, setSData] = useState<Object>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [HeaderArr, setHArr] = useState<[][] | undefined>(undefined);
  const [BodyArr, setBArr] = useState<[][] | undefined>(undefined);
  const [newTablesArr, setTablesArr] = useState<NewTable[]>([])
  const [doneNormalizing, setNormDone] = useState(false);
  const [toReread, setReread] = useState(false);
  const [PrimaryTableCtr, setPTabCtr] = useState(0);
  const [origWB, setOrigWB] = useState<XLSX.WorkBook | null>();
  const [startProcess, setStartProcess] = useState(false);
  const [normWB, setNormWB] = useState<XLSX.WorkBook | null>();
  const nav = useNavigate();
  const [databaseId, setDatabaseId] = useState(-1);
  const [SQLCommands, setSQLCmds] = useState<ConvertCommand[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDone, setDone] = useState(false);
  var nameid = 1;
  const userId = useSelector((state: RootState) => state.auth.userId);
  const TableHeight = (vsheets.length * 50).toString() + "px";

//Helper functions ---------------------------------------------------------------------------------
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
function convertObjectToArray(obj: Record<string, string>[] | (number | string)[][]): (number | string)[][] {
  if (Array.isArray(obj[0])) {
    // If the first element is already an array, assume it's an array of arrays
    return obj as (number | string)[][];
  }

  const resultArray: (number | string)[][] = [];

  for (const item of obj) {
    if (typeof item === 'object') {
      const values = Object.values(item);
      resultArray.push(values);
    }
  }

  return resultArray;
}
function addPrimaryKey(table: (number | string)[][], tableName:string): void {
    // Check if the table is empty
    if (table.length === 0 || table[0].length === 0) {
      console.log("Table is empty. No modifications needed.");
      return;
    }
  
    // Assuming the first row contains the column names
    const headerRow = table[0];
    console.log("Header Row is: ", headerRow);
  
    // Check if the table already has an auto-increment primary key
    const hasNumberIDColumn = headerRow.some((columnName, columnIndex) => {
      if (typeof table[1][columnIndex] === 'number' || !Number.isNaN(Number(table[1][columnIndex]))) {
        console.log("checking", table[1][columnIndex])
        let uniqueVal: number[] = [];
        for(let i=1; i < table.length; i++){
          if(!uniqueVal.includes(table[i][columnIndex] as number)){
            uniqueVal.push(table[i][columnIndex] as number)
          }else{
            return false;
          }
        }
        return true;
      }
      return false;
    });
  
    if (hasNumberIDColumn) {
      console.log("Table already has a Number ID key. No modifications needed.");
      return;
    }
  
    // Find the first available index for the new 'id' column
    let idColumnIndex = 1;
    while (headerRow.includes(`${tableName}_id`)) {
      idColumnIndex++;
    }
  
    // Add the 'id' column to the header row at the beginning
    headerRow.unshift(`${tableName}_id`);
  
    // Add auto-incrementing values to each row
    for (let i = 1; i < table.length; i++) {
      table[i].unshift(i);
    }
  
    console.log("Added an auto-increment 'id' column to the table.");
}
function getUniquePrimaryTableName(): string{
  nameid++;
  return `PrimaryTable_${nameid - 1}`;
}
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
function hasRepeatingValues(columnName: string, table: (string | number)[][]): boolean {
  const columnIndex = table[0].indexOf(columnName);

  if (columnIndex === -1) {
    return false; // Column not found
  }

  const valuesSet = new Set<string | number>();

  for (let row = 1; row < table.length; row++) {
    const cellValue = table[row][columnIndex];

    if (valuesSet.has(cellValue)) {
      return true; // Found a repeating value
    }

    valuesSet.add(cellValue);
  }

  return false; // No repeating values found
}
function concatenateColumns(columnNames: string[], table: (string | number)[][]): (string | number)[][] {
  const columnIndexList: number[] = [];
  const newTable: (string | number)[][] = [];

  // Find the indices of the specified columns
  for (const columnName of columnNames) {
    const columnIndex = table[0].indexOf(columnName);
    if (columnIndex !== -1) {
      columnIndexList.push(columnIndex);
    }
  }

  // Add the header row to the new table
  const headerRow: (string | number)[] = [];
  for (const columnIndex of columnIndexList) {
    headerRow.push(table[0][columnIndex]);
  }
  newTable.push(headerRow);

  // Add rows from the specified columns to the new table
  for (let row = 1; row < table.length; row++) {
    const newRow: (string | number)[] = [];
    for (const columnIndex of columnIndexList) {
      newRow.push(table[row][columnIndex]);
    }
    newTable.push(newRow);
  }

  return newTable;
}
function removeRepeatingRows(table: (string | number)[][]): (string | number)[][] {
  const seenRows: Set<string> = new Set();
  const uniqueTable: (string | number)[][] = [table[0]]; // Copy the header row

  for (let row = 1; row < table.length; row++) {
    const rowValues = table[row].toString();

    if (!seenRows.has(rowValues)) {
      seenRows.add(rowValues);
      uniqueTable.push(table[row]);
    }
  }

  return uniqueTable;
}
function findPrimaryKey(table: (string | number)[][], columnName: string, searchValue: string | number): string | number {
  console.log("searching for ", searchValue, " at " , columnName)
  
  // Find the index of the specified column
  const columnIndex = table[0].indexOf(columnName);
  console.log("index of column is ", columnIndex);

  // If the column doesn't exist in the table, return null
  if (columnIndex === -1) {
    return -1;
  }

  // Iterate through the table's rows to find the primary key for the given value
  for (let i = 1; i < table.length; i++) {
    console.log(table[i][columnIndex], " === ", searchValue)
    if (table[i][columnIndex] === searchValue) {
      // Return the primary key value (assuming it's in the first column)
      return table[i][0];
    }
  }

  // If no match is found
  return -1;
}
function replaceWithFK(tableA: (string | number)[][], tableB: (string | number)[][]) {
  // Deep copy of tableA
  const mergedTable: (string | number)[][] = JSON.parse(JSON.stringify(tableA));

  // Identify common columns between Table A and Table B
  console.log("A: ",tableA, " and ", "B:", tableB)
  const commonColumns = tableA[0].filter((col) => tableB[0].includes(col));
  console.log("common cols:", commonColumns);
  if (commonColumns.length === 0) {
    // If no common columns, return the original Table A as is
    return mergedTable;
  }

  // Remove common columns (except for the primary key) from mergedTable
  const primaryKeyIndex = mergedTable[0].indexOf(commonColumns[0]);
  const removedCol: string[] = [];
  mergedTable[0] = mergedTable[0].filter((col, index) => {
    //if column is not found in tbl B return true
    if (!commonColumns.includes(col)) {   
      console.log("COLUMN:",col," returns true");
      return true;
    }
    //if column is found in tbl B return false and push index to removed Indexes
    console.log("COLUMN:",col," returns false", "with index ", tableB[0].indexOf(col));
    removedCol.push(col as string);
    return false;
  });

  // Create a mapping of primary key values in Table B to their corresponding rows
  const primaryKeyMap: { [key: string]: (string | number)[] } = {};
  for (let i = 1; i < tableB.length; i++) {
    const primaryKeyValue = tableB[i][primaryKeyIndex]?.toString();
    if (primaryKeyValue !== undefined) {
      primaryKeyMap[primaryKeyValue] = tableB[i];
    }
  }

  console.log("col to remove: ", removedCol)
  // get table A column names
  const headerRow = tableA[0];
  console.log("hr", headerRow);

  // Replace the first column in removedCol with the first column in tableB (primary key of tableB)
  let fColumnIndex = headerRow.findIndex((name) => name === removedCol[0]);
  headerRow[fColumnIndex] = tableB[0][0];
  console.log("new name: ",mergedTable[0][fColumnIndex]);
  
  for(let i = 1; i < mergedTable.length; i++){
    console.log("val", mergedTable[i][fColumnIndex])
    console.log("replacing with ",findPrimaryKey(tableB, removedCol[0], mergedTable[i][fColumnIndex]));
    mergedTable[i][fColumnIndex] = findPrimaryKey(tableB, removedCol[0], mergedTable[i][fColumnIndex]);
  }
  //remove first column
  removedCol.splice(0,1)

  console.log("after replacing col with fk col to remove: ", removedCol)

  // Remove values from mergedTable for common columns (except for the primary key)
  for(const col in removedCol){
    const columnIndex = headerRow.findIndex((name) => name === removedCol[col]);
    console.log("column index of ",removedCol[col], " is ", columnIndex);
    for (let i = 1; i < mergedTable.length; i++) {
    const foreignKeyValue = mergedTable[i][primaryKeyIndex]?.toString();
    console.log("Merged table after: ",mergedTable)
    if (primaryKeyMap[foreignKeyValue]) {
        console.log("Removing: ", mergedTable[i][columnIndex])
        mergedTable[i].splice(columnIndex, 1); // Splice removes the value at the specified index
    } else {
        console.log("Removing: ", mergedTable[i][columnIndex])
        mergedTable[i].splice(columnIndex, 1); // Splice removes the value at the specified index
    }
    }
    headerRow.splice(columnIndex, 1);
  }
  mergedTable[0] = headerRow;

  return mergedTable;
}
function normalizeTbl(inputTable: (string | number)[][]): void {
    let doNotSearch:string[] = [];
    const numCols = inputTable[0].length;
    let newPrimaryTable: (string | number)[][] = [...inputTable];
    let primaryTableName = getUniquePrimaryTableName();
    console.log("ptn is ", primaryTableName);
    
    
    for (let col = 0; col < numCols; col++) {
      const columnName = inputTable[0][col];
      console.log(`Column Name: ${columnName}`);
      if(!doNotSearch.includes(columnName as string)){
        console.log(columnName," not found in do not search");
        let depArr = getColumnDependencies(columnName as string, newPrimaryTable, doNotSearch);
        console.log("Dependency array: ", depArr);
        if(depArr.length > 1 && depArr.length < numCols - col){
          for(const col in depArr){
            //inserting the column and the dependencies into do not search
            doNotSearch.push(depArr[col]); 
          } 
          //concat the columns in the depArr as table
          console.log("depArr", depArr)
          let newTblVal =  concatenateColumns(depArr, newPrimaryTable);
          //remove repeating values
          newTblVal = removeRepeatingRows(newTblVal)
          //add primary key if not existing
          addPrimaryKey(newTblVal as [][], depArr[0]);
          console.log("updated val w/ key: ", newTblVal);
          //push new table to the newTablesArr
          if(!newTablesArr.some(newtab => newtab.tableName === depArr[0])){
            newTablesArr.push(
              {tableName:depArr[0], tableValues: newTblVal}
            )
          }        
          newPrimaryTable = replaceWithFK(newPrimaryTable, newTblVal)           
          console.log("npt:", newPrimaryTable) 
        
        }else{
          doNotSearch.push(columnName as string);
      }
    }
    console.log("----"); // Separator between columns
    if(!newTablesArr.some(newtab => newtab.tableName === primaryTableName)){
      newTablesArr.push(
        {tableName:primaryTableName, tableValues: newPrimaryTable}
      )
    }else{
      let pIndex = newTablesArr.findIndex(obj => { return obj.tableName === primaryTableName;})
      newTablesArr[pIndex].tableValues = newPrimaryTable;
    }  
    console.log("newtab Array: ", newTablesArr);
    setNormDone(true);
  }
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
const fetchData = async () =>{
  FileService.getFile(fileId).then((res)=>{
      const wb = XLSX.read(res.data);
      setFileName(res.fileName);
      setWB(wb);
  }).catch((err)=>{
      console.log(err);
  }) 
}
const readData = (wb: XLSX.WorkBook) => {
  console.log("and this workbook is passed ", wb);
  setSheetNames(wb.SheetNames)
  let sheetdata:Object = {}
  wb.SheetNames.map((sheet, i) => 
  {
      const worksheet = wb.Sheets[sheet];
      const jsondata = XLSX.utils.sheet_to_json(worksheet,{
          header: 1,
          raw: false,
          defval: "",
      }) as unknown;
      const sd = sheetjs_cleanEmptyRows(jsondata as XLSX.SheetType)
      const js = sd as Object
      sheetdata = {...sheetdata, [sheet]: js}            
  })
  console.log("sheetdata on readData: ",sheetdata)
  setSData(sheetdata)
  setStartProcess(true);
}
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
          row[header] = new Date(value).toDateString();
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
function getColumnType(value: any): string {
  console.log("Type of ", value, " is ", typeof value);
  if (typeof value === "string") {
      return "VARCHAR(255)";
  } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
         if(value > 2000000000){
          return "VARCHAR(255)";
         }else{
          return "INTEGER";
         }
      } else {
          return "DOUBLE";
      }
  } else if (typeof value === "boolean") {
      return "BOOLEAN";
  } else if (value instanceof Date) {
      return "DATE";
  } else {
      throw new Error(`Unsupported data type: ${typeof value}`);
  }}
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
          return `'${value.toISOString().split('T')[0]}'`;
      } else {
          if(value as number > 2000000000){
              return `'${value}'`;
          }else{
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
//--------------------------------------------------------------------------------------------------------------

//pagination functions ------------------------------------------
const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
  };
const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
  setRowsPerPage(+event.target.value);
  setPage(0);
  };
//---------------------------------------------------------------

  
//UseEffects ----------------------------------------------------------------------------------------------
  //for logging new tables array  
  useEffect(()=>{
    console.log("New Tables Array contains: ",newTablesArr);
  },[newTablesArr])

  //fetch data on load
  useEffect(()=>{
      setVSheets([]);
      fetchData();
  },[])

  //read workbook
  useEffect(()=>{
    if(workbook !== undefined){
      setOrigWB(workbook);
      readData(workbook!); 
    }
},[workbook])

  // old useEffect for setting startProcess to true 
  // useEffect(()=>{
  //     if(JSON.stringify(sheetdata) !== '{}' && sheetdata !== undefined){
  //       setStartProcess(true);
  //     }
  // },[workbook, sheetNames])


  useEffect(()=>{
    if(startProcess && JSON.stringify(sheetdata) !== '{}'){
      let sd = sheetdata as WorkbookData; 
      let newWB:XLSX.WorkBook = JSON.parse(JSON.stringify(workbook)) as XLSX.WorkBook;
      
      //clear sheets found in norm list in new work book copy
      console.log("normlist:", normList, " and newwb sheets:", newWB.SheetNames);
      let sheetCount = 0;
      for(const sheet in newWB.SheetNames){
        sheetCount++;
      }
      console.log("sheet count:", sheetCount);
      let k = 0;
      for(let i=0; i < sheetCount; i++){
        console.log("checking index ", i - k)
        console.log("checking...", newWB.SheetNames[i - k]);
         if(normList.includes(newWB.SheetNames[i - k])){
            console.log("Deleting ", newWB.SheetNames[i - k], "...")
            delete_ws(newWB, newWB.SheetNames[i - k])
            k++;
         }
         
      }

      for(const sheet in normList){ 
        //adding primary keys to the sheets w/ no keys
        addPrimaryKey(convertObjectToArray(sd[normList[sheet]] as [][]), normList[sheet]); 
        //appending the updated sheet to workbook
        workbook!.Sheets[normList[sheet]] = XLSX.utils.aoa_to_sheet(convertObjectToArray(sd[normList[sheet]] as [][]));
        //adding possible tables to newtablesArr
        normalizeTbl(convertObjectToArray(sd[normList[sheet]] as [][]));
        //appending each new possible table in array to workbook 
        for(const newtable in newTablesArr){
          let ws = XLSX.utils.aoa_to_sheet(newTablesArr[newtable].tableValues);
          
          /* Add the worksheet to the workbook */
          if(!newWB?.SheetNames.includes(newTablesArr[newtable].tableName)){
            XLSX.utils.book_append_sheet(newWB!, ws, newTablesArr[newtable].tableName);
          }          
        }
      }
      setSData(sd as Object);
      setNormWB(newWB);         
      console.log("setting normalization to done...")
      setNormDone(true);
    }
  },[startProcess])
  //useEffect for normalizing table on load;
  
  

  //useEffect once normalization process is done
  useEffect(()=>{
    if(doneNormalizing){
      while(vsheets.length > 0){
        vsheets.pop();
      }
      normWB?.SheetNames.map((sheet, i)=>{
        vsheets.push(sheet);
      })
      console.log("VS:",vsheets);
      setCurrentSheet(vsheets[0])
      console.log("sd:",sheetdata);
      console.log("setting read for re-read to true...")
      setReread(true);
    }
    
  },[doneNormalizing])

  useEffect(()=>{
    if(toReread){
      console.log("read this data:", normWB)
      readData(normWB!)
    }
    },[toReread])

  //useEffect once done re-reading data
  //set currentSheet and header array based from props
  useEffect(()=>{
    if(JSON.stringify(sheetdata) !== '{}')  {
      //typing currentSheet as key of sheetData
      const currSheet = currentSheet as keyof typeof sheetdata
      //typing object value as unknown before converting to row
      const row =  sheetdata[currSheet] as unknown
      let rowArr = row as [][]
      setHArr(rowArr)
    }
  },[sheetdata])

  //useEffect for re-assigning the header array for the table when currentSheet state has changed
  useEffect(()=>{
    //typing currentSheet as key of sheetData
    const currSheet = currentSheet as keyof typeof sheetdata
    //typing object value as unknown before converting to row
    const row =  sheetdata[currSheet] as unknown
    let rowArr = row as [][]
    setHArr(rowArr)
},[currentSheet])

//useEffect for re-assigning the body array for the table when Header array state has changed
useEffect(()=>{
    if(HeaderArr !== undefined){
        let rowsArr = []
        //copy rowArr
        rowsArr = HeaderArr.slice(0); 
        //remove header values
        rowsArr.splice(1 - 1, 1);
        setBArr(rowsArr)
    }
  },[HeaderArr])
  
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
    toggleNormalized(false, -1);
    nav('/database',{
      state:{
        dbid: databaseId
      }
    }); 
  }
},[isDone])
//-----------------------------------------------------------------------------------------------------------


  const changeSheet = (stringevent: React.SyntheticEvent, newValue: string) =>{
      setCurrentSheet(newValue);
  }
  
  const cancelProcess = () => {
    while(normList.length > 0){
      normList.pop();
    }
    toggleNormalized(false, -1); 
  }

  

  //Button and SQL functions -----------------------------------------------------------------------------------------------------
  
  function getSQLQuery(wb:XLSX.WorkBook){
    if(sheetdata !== undefined){
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
                wb.SheetNames.map((sheet, i) =>{
                    const ws = wb.Sheets[sheet];
                    const jsondata = XLSX.utils.sheet_to_json(ws,{
                        header: 1,
                        raw: false,
                        defval: "",
                    }) as unknown;
                    const JSSD = sheetjs_cleanEmptyRows(jsondata as XLSX.SheetType)
                    let sheetSD = JSON.parse(JSON.stringify(JSSD as unknown as [][]));
                    console.log("sheet data of workbook ", sheetSD)
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
        })
    }
  }

  function nextFunc(){
    if(normWB === undefined || normWB === null){
      alert("Please wait. Normalization still in progress");
    }else{
      console.log("turn this to SQL: ", normWB);
      getSQLQuery(normWB);
    }
  }

  function declineFunc(){
    console.log("turn this to SQL: ", origWB);
    getSQLQuery(origWB!);
  }
  //-----------------------------------------------------------------------------------------------------

  
  return (
    <Box sx={{
        position: "absolute",
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 798,
        maxHeight: 594,
        bgcolor: '#71C887',
        boxShadow: 24,
        p: 2,
    }}>
        <div style={{marginTop:"3%", padding:"2em", backgroundColor:"#DCF1EC"}}>
          <p style={{fontSize:"32px", padding:0, margin:0}}>DataMate has detected that your table can be normalized for easier transition to database.</p>
          <p style={{fontSize:"16px", paddingTop:'1em', paddingLeft:0, paddingBottom:'1em', margin:0}}>Will you accept this suggestions?</p>
          <div style={{display:'flex', flexDirection:'row'}}>
            <div style={{width: '85%'}}>
            {HeaderArr !== undefined && BodyArr !== undefined? <>
                          <Paper elevation={0} sx={{ height:vsheets.length > 3? {TableHeight}:150, overflow: 'auto', border:"5px solid #71C887", borderRadius: 0}}>
                          <TableContainer>
                              <Table stickyHeader aria-label="sticky table">
                              <TableHead >
                                  <tr>
                                      {
                                      HeaderArr[0].map((col,i) => <TableCell
                                      style={{padding:5, width: '1px', whiteSpace: 'nowrap', fontSize:'10px'}}
                                      key={i}
                                      align='left'
                                      ><b>{col}</b></TableCell>)
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
                                              <TableCell style={{padding:5, width: '1px', whiteSpace: 'nowrap', fontSize:'10px'}}
                                              key={j} align='left' width="100px">
                                              {cell === true? "TRUE": cell === false? "FALSE":cell}
                                              </TableCell>
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
              </>:
              <><CircularProgress size="10rem" 
              color="success" /></>}
            </div>
            <div style={{width: '20%'}}>
              {/* for table tabs */}
              <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    scrollButtons={vsheets.length < 4? false: "auto"}
                    value= {currentSheet}
                    onChange={changeSheet}
                    TabIndicatorProps={{sx:{backgroundColor:'rgba(0,0,0,0)'}}}
                    sx={{
                    width:"100%",
                    "& button":{borderRadius: 0, color: 'black', backgroundColor: '#DCF1EC'},
                    "& button.Mui-selected":{backgroundColor: '#71C887', color: 'white'},
                    }}
                    aria-label="secondary tabs example"
                    >
                    {vsheets.length > 0? vsheets.map((sheet,i) =>{
                        return(                                
                          <Tab disableRipple sx={{backgroundColor:"#D9D9D9", marginLeft:0, paddingLeft:0, textAlign:"left", textOverflow:"ellipsis"}}  value={sheet} label={sheet} />
                        )
                    }):<p></p>}
                  </Tabs>
              </div>
            </div> 
          </div> 
          <div style={{display:"flex", justifyContent:"space-between"}}>
          <Button disableElevation onClick={cancelProcess} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: 'white', color:'black', borderRadius:50 , paddingInline: 4, margin:'5px'}}>Cancel</Button>
          <div>
            <Button disableElevation onClick={declineFunc} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: '#71C887', color:'white', borderRadius:50 , paddingInline: 4, margin:'5px'}}>Decline</Button>
            <Button disableElevation onClick={nextFunc} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: '#71C887', color:'white', borderRadius:50 , paddingInline: 4, margin:'5px'}}>Accept</Button>
          </div>
          </div>
        </div>
    </Box>
  );
};

export default styled(NormalizePrompt)({});

export {}; // Add this empty export statement