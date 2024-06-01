import { useLocation, useNavigate } from "react-router-dom";
import modalStyle from "../styles/ModalStyles";
import * as XLSX from 'xlsx'
import { Box, Button, CircularProgress, IconButton, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField, styled } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import FileService from "../services/FileService";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import '@inovua/reactdatagrid-community/index.css';
import { CheckIcon, CloseIcon, EditIcon } from "../components/icons";



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

type SelectProps = {
    toggleSelect: (status:boolean, sheetIndex:number) => void,
    toggleTableDetect: (status:boolean) => void,
    toggleEmptyDetect: (status:boolean) => void,
    toggleInconsistentDetect: (status:boolean) => void,
    toggleImportSuccess: (status:boolean) => void,
    tblCount: number,
    fileId: number,
    vsheets:string[],
    sheetdata: object,
    updateEmpty: (sheet:string) => void,
    updateInc: (sheet:string) => void,
    emptySheets: string[],
    incSheets: string[],
    reset: () => void,
    updateSData: (data:Object) => void,
    wb: XLSX.WorkBook | null | undefined,
    sheetIndex: number,
    updateNorm: (sheet:string) => void,
    startLoading: () => void,
    stopLoading: () => void,
  }

interface WorkbookData {
    [sheet: string]: Object[];
}

interface TableRow {
    [key: string]: string | number;
}

interface HeaderConfig {
    name: string;
    header: string;
    defaultVisible?: boolean,
    defaultFlex: number;
}

interface Table{
    id: number;
    name: string;
    values: Object;
}
type TableMapRow = Record<string, string>;
type TableMap = TableMapRow[];
type SelectedCell = Record<string, boolean>;

const SelectTablePrompt = ({startLoading, stopLoading, toggleSelect, toggleTableDetect, tblCount, fileId, vsheets, sheetdata, emptySheets, incSheets,
    toggleEmptyDetect, toggleInconsistentDetect, toggleImportSuccess, updateEmpty, updateInc, reset, updateSData, wb,
  sheetIndex, updateNorm}: SelectProps) => {  
    const [currentSheet, setCurrentSheet] = useState("");
    const [currentTab, setCurrentTab] = useState("");
    const [currentTabID, setTabID] = useState(-1);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [HeaderArr, setHArr] = useState<[][] | undefined>(undefined);
    const [BodyArr, setBArr] = useState<[][] | undefined>(undefined);
    const [hasEmpty, SetEmpty] = useState(false);
    const [isInconsistent, SetInconsistent] = useState(false);
    const [notNormalized, setNotNormalized] = useState(false);
    const [isCheckDone, setCheckDone] = useState(false);
    const [createdSheets, setCSheets] = useState<Table[]>([]);
    const [createdTableCtr, setCCtr] = useState(0);
    const [cellSelection, setCellSelection] = useState({});
    const [columns, setColumns] = useState<HeaderConfig[]>([]);
    const [dataSource, setDataSrc] = useState<Object[]>([]);
    const [overwriteStatus, setOWStat] = useState(false);
    const dynamicHeight = (createdSheets.length * 60);
    const tabsRef = useRef<HTMLDivElement[]>([]);
    const [isEditing, setEditing] = useState(false);
  const nav = useNavigate();
  const gridstyle = {
    fontSize:"10px",
    height:dynamicHeight,
    maxHeight:520,
  }

  //set currentSheet and header array on load based from props
  useEffect(()=>{
    setCurrentSheet(vsheets[sheetIndex]);
    //typing currentSheet as key of sheetData
    const currSheet = currentSheet as keyof typeof sheetdata
    //typing object value as unknown before converting to row
    const row =  sheetdata[currSheet] as unknown
    let rowArr = row as [][]
    setHArr(rowArr)
  },[])

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
        let colArr = [...columns];
        colArr = createColumns(HeaderArr[0]);
        setColumns(colArr);
        let rowsArr = [];
        //copy rowArr
        rowsArr = HeaderArr.slice(0); 
        console.log("Before", rowsArr)
        //remove header values
        rowsArr.splice(1 - 1, 1);
        console.log("After", rowsArr)
        setBArr(rowsArr)
    }
  },[HeaderArr])

useEffect(()=>{
  if(sheetdata[currentSheet as keyof typeof sheetdata] !== undefined){
    let datasrc = [...dataSource];
    datasrc = createDataSrc(columns, sheetdata[currentSheet as keyof typeof sheetdata]);
    console.log("data source:", datasrc);
    setDataSrc(datasrc);
  }
}, [columns])

useEffect(()=>{
    if(createdTableCtr > 0){
        let name = "Table " + createdTableCtr;
        createdSheets.push({id: createdTableCtr, name: name, values:{}});
        setTabID(createdTableCtr);
    }
},[createdTableCtr])

//update createdsheets object value when cellSelection is changed
useEffect(()=>{
  if(createdTableCtr > 0){
    console.log("ID: ",currentTabID);
    let tablelist = [...createdSheets];
    const targetObject = tablelist.find(obj => obj.id === currentTabID);
    if (targetObject) {
    targetObject.values = cellSelection;
    console.log("Obj",targetObject);
    setCSheets(tablelist)
    }
    
  }
}, [cellSelection])


useEffect(()=>{
  console.log("ID: ",currentTabID);
  const targetObj = createdSheets.find(obj => obj.id === currentTabID);
  if(targetObj !== undefined){
    console.log("Obj",targetObj);
    setCellSelection(targetObj?.values);
  }
},[currentTabID])


//useEffect for detecting hasEmpty, isInconsistent changes
useEffect(()=>{
  if(isCheckDone){
    //Check hasEmpty
        //open empty value will be replaced with "NULL" prompt
        if(hasEmpty){
          toggleSelect(false,0);
          toggleEmptyDetect(true);
          console.log("Empty triggered");
        }else if(isInconsistent && !hasEmpty){
        //else if when hasEmpty is false but isInconsistent is true 
        //open fixing inconsistency prompts
          toggleSelect(false,0);
          toggleInconsistentDetect(true);
          console.log("Inconsistency triggered");
        }
        else{
          toggleSelect(false,0);
          toggleImportSuccess(true);
          console.log("Success Triggered")
        }
  }
    
},[isCheckDone])

useEffect(()=>{
  if(overwriteStatus){
    togglePrompts();
  }
},[overwriteStatus])

function createColumns(strings: string[]): HeaderConfig[] {
  let strArr:HeaderConfig[] = [];
  //for each string in strings parameter, create an object with the name "COLUMN" + index
  strings.forEach((str, i)=>
  {
    strArr.push({name:`COLUMN ${i + 1}` , header:`COLUMN ${i + 1}`, defaultFlex:1});
  });
    strArr.push({
      name: "id",
      header: "ID",
      defaultVisible: false,
      defaultFlex: 1,
    })

    return strArr;
  }

  function createDataSrc(headerConfigs: HeaderConfig[], values:[][]): TableRow[]{
    const table:TableRow[] = [];
    const headers: string[] = headerConfigs.map(config => config.name);

  let idVal = 0;
  values.forEach(rowValues => {
      if (rowValues.length !== headers.length - 1) {
        throw new Error('Number of values does not match number of headers.');
      }
      const row: TableRow = {};
      
      headers.forEach((header, index) => {
        if(header === 'id'){
          row[header] = idVal;
          idVal++;
        }else{
          if(typeof rowValues[index] === "boolean"){
            let strval = rowValues[index] as string;
            row[header] = strval.toString();
          }else{
            row[header] = rowValues[index]; 
          }          
        }
      });

      table.push(row);
    });
    let key = `0,${headers[0]}`;
    setCellSelection({...cellSelection, [key]:true });
    return table;
  }
  
  //pagination functions ------------------------------------------
    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
  setRowsPerPage(+event.target.value);
  setPage(0);
  };
  //---------------------------------------------------------------

  function newTable():void {
    if(createdSheets.length >= 10){
      alert("Maximum number of tables reached");
    }else{
      let newval = createdTableCtr + 1;
      setCCtr(newval);
    }
    
  }

  function handleNameChange(event:React.FormEvent, name:string): void{
    if(name !== null && name!== undefined){
      if(createdTableCtr > 0){
      let tablelist = [...createdSheets];
      const targetObject = tablelist.find(obj => obj.id === currentTabID);
      console.log("TargetObj ID is ", targetObject!.id - 1, "and the refs are", tabsRef);
      if (targetObject) {
        if(name === "" || name === " "){
          targetObject.name = "Table " + targetObject.id;
          setCSheets(tablelist);
        }else{
        targetObject.name = name;
        setCSheets(tablelist);  
        }
        }
      }
    }
  
    
  }

  function hasEmptyTable(array: Table[]): boolean {
    return array.some(table => {
      return Object.keys(table.values).length === 0;
    });
  }

  const changeTab = (event: React.SyntheticEvent, newValue: number) =>{
      setTabID(newValue)
  }


  
  const cancelProcess = () => {
    startLoading();
      FileService.deleteFile(fileId).then((res)=>{
        toggleSelect(false,0);
        setCSheets([]);
        reset();
        stopLoading();
        nav("/");
      }).catch((err)=>{
        console.log(err);
      })
      
  }
  //function for detecting empty values
  function hasEmptyValues(table: TableRow[]): boolean {
    for (const row of table) {
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          const value = row[key];
          if (value === null || value === undefined || value === "") {
            // Empty value found in the row
            return true;
          }
        }
      }
    }
    return false;
  }

  //function for detecting inconsistencies
  function hasInconsistentValues(table: TableRow[]): boolean {
    const columnDataTypes: { [key: string]: Set<string> } = {};

    let isFirst = true;
    for (const row of table) {
      if(isFirst){
        isFirst = false;
      }
      else{
          for (const column in row) {
            if (row.hasOwnProperty(column)) {
              const valueType = typeof row[column];
              if (!columnDataTypes[column]) {
                columnDataTypes[column] = new Set();
              }
              columnDataTypes[column].add(valueType);
      
              if (columnDataTypes[column].size > 1) {
                return true; // Inconsistent values found in this column
              }
            }
          }
      }
    }
    return false; // No inconsistent values found in any column
  }

   //function for checking if a table has a primary key
   function hasPossiblePrimaryKey(table: TableRow[]): boolean {
    if (table.length === 0) {
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

      if (typeof firstColumnValue !== "number" || firstColumnValues.has(firstColumnValue)) {
        return false; // The first column has a non-numeric value or a duplicate value
      }

      firstColumnValues.add(firstColumnValue);
    }
    
  
  
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
      console.log(`Column Name: ${columnName}`);
      if(!doNotSearch.includes(columnName as string)){
        console.log(columnName," not found in do not search");
        let depArr = getColumnDependencies(columnName as string, rows, doNotSearch);
        console.log("Dependency array: ", depArr);
        if(depArr.length > 1 && depArr.length !== numCols - col){
          for(const col in depArr){
            //inserting the column and the dependencies into do not search
            doNotSearch.push(depArr[col]); 
          } 
          //concat the columns in the depArr as table
          console.log("depArr", depArr)
          res = true;
          break;
        }else{
          doNotSearch.push(columnName as string);
        }
      }
    }

    return res;
  }


  //function to detect duplicates for tables
  function hasDuplicateNames(array:Table[]) {
    const nameOccurrences: Record<string, number> = {};
  
    for (const table of array) {
      const name = table.name.toLowerCase();
      nameOccurrences[name] = (nameOccurrences[name] || 0) + 1;
  
      if (nameOccurrences[name] >= 2) {
        return true;
      }
    }
  
    return false;
  }

  //convert cellSelection Data to an array for extraction 
  function getSelectionArray(selectedCell: SelectedCell): TableMapRow[] {
    const rows: TableMapRow[] = [];
  
    Object.keys(selectedCell).forEach(key => {
      const [rowIndexStr, columnName] = key.split(",");
      const rowIndex = parseInt(rowIndexStr, 10);
  
      if (!rows[rowIndex]) {
        rows[rowIndex] = {};
      }
      rows[rowIndex][columnName] = selectedCell[key] as unknown as string;
      
    });
  
    return rows;
  }

  //extract data values from data source with an array
  function extractValues(selectedRows: TableMapRow[], tableMap: TableMap): Object[] {
    const valuesArray:Object[] = [];

  selectedRows.forEach(selectedRow => {
    const rowValues: (string | boolean)[] = [];

    Object.keys(selectedRow).forEach(columnName => {
      const columnIndex = Object.keys(tableMap[0]).indexOf(columnName);
      if (columnIndex !== -1) {
        const value = tableMap[selectedRows.indexOf(selectedRow)][columnName];
        if (value === "true" || value === "false") {
          rowValues.push(value === "true");
        } else {
          rowValues.push(value);
        }
      }
    });
    valuesArray.push(rowValues);
  })

    return valuesArray;
  }

  function togglePrompts(){
    const sd = sheetdata as WorkbookData;
    for(const s in vsheets){
      console.log("remaining sheets", vsheets[s]);
      //check for empty values in tables
      if(hasEmptyValues(sd[vsheets[s]] as TableRow[])){
        //insert table names to SheetsWithEmpty Array 
        if(!emptySheets.includes(vsheets[s])){
          updateEmpty(vsheets[s]);
          SetEmpty(true);
        }          
      }
      //if block for inconsistent values
      if(hasInconsistentValues(sd[vsheets[s]] as TableRow[])){
        if(!incSheets.includes(vsheets[s])){
          updateInc(vsheets[s]);
          SetInconsistent(true);
        }
      }
    }
    setCheckDone(true);
  }
  function delete_ws(wb:XLSX.WorkBook, wsname:string) {
    const sidx = wb.SheetNames.indexOf(wsname);
    if(sidx == -1) throw `cannot find ${wsname} in workbook`;
    
    // remove from workbook
    wb.SheetNames.splice(sidx,1);
    delete wb.Sheets[wsname];

  }

  function deleteFromList(index:number){
    let copyList = [...createdSheets];
    if(index > -1){
      copyList.splice(index, 1);
    }
    console.log("created Tables: ", createdSheets)
    setCSheets(copyList);
  }

  function editName(id:number){
    console.log(currentTabID, " and ", id);
    if(isEditing && currentTabID === id){
      setEditing(false);
    }else{
      setEditing(true);
    }
    
  }
  function nextFunction(){
    if(createdSheets.length <= 0){
      alert("Please create at least one table");
    }else if(hasEmptyTable(createdSheets)){
      alert("One or more tables have no values highlighted")
    }else if(hasDuplicateNames(createdSheets)){
      alert("Two or more table names have the same name")
    }
    else{

      //deleting original data
      for(const sheet in vsheets){
        delete_ws(wb!, vsheets[sheet]);
      }
      while(vsheets.length > 0){
        vsheets.pop();
      }
      //appending of data in createdSheets to workbook
      for(const table in createdSheets){
        let sheetName = createdSheets[table].name;
        let cellValues = createdSheets[table].values;
        let selectedData = extractValues(getSelectionArray(cellValues as SelectedCell), dataSource as TableMap);
        let ws = XLSX.utils.aoa_to_sheet(selectedData as [][]);
        XLSX.utils.book_append_sheet(wb!, ws, sheetName);
        vsheets.push(sheetName);
        console.log("new sd:",sheetdata)
      }
      if(wb !== undefined && wb !== null){
      //update sheetdata
      let sheetdata:Object = {}
      vsheets.map((sheet, i) => 
      {
          const worksheet = wb.Sheets[sheet];
          const jsondata = XLSX.utils.sheet_to_json(worksheet,{
              header: 1,
              raw: true,
              defval: "",
          }) as unknown;
          const js = jsondata as Object
          sheetdata = {...sheetdata, [sheet]: js}            
      })
      updateSData(sheetdata);
      setOWStat(true);
      }
      
    }
    
  }

  function switchToAuto(): void {
    
    toggleSelect(false,0);
    toggleTableDetect(true);
    
  }
  
  return (
    <Box sx={{
        position: "absolute",
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 830,
        maxHeight: 800,
        bgcolor: '#71C887',
        boxShadow: 24,
        p: 2,
    }}>
        <div style={{marginTop:"3%", padding:"2em", backgroundColor:"#DCF1EC"}}>
          <p style={{fontSize:"32px", padding:0, margin:0}}>Please highlight the tables in your file</p>
          <div style={{display:'flex', flexDirection:'row'}}>
            <div style={{width: '80%'}}>
              {/* for table preview */}
              {HeaderArr !== undefined && BodyArr !== undefined? <>
                        <Paper elevation={0} sx={{ maxHeight:'500px', overflow: 'auto', border:"5px solid #71C887", borderRadius: 0}}>
                          {/* //code for the table */}
                        <ReactDataGrid
                            idProperty="id"
                            style={gridstyle}
                            cellSelection={cellSelection}
                            onCellSelectionChange={setCellSelection}
                            columns={columns}
                            dataSource={dataSource}
                        />
                        </Paper>     
              </>:
              <><CircularProgress size="10rem" 
              color="success" />
              </>}
            </div>
            <div style={{width: '20%'}}>
              <Button variant="text" onClick={newTable}>+ New Table</Button>
              {/* for table tabs */}
              <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    scrollButtons={createdSheets.length < 8? false: "auto"}
                    value= {currentTabID}
                    onChange={changeTab}
                    TabIndicatorProps={{sx:{backgroundColor:'rgba(0,0,0,0)'}}}
                    sx={{
                    maxHeight:dynamicHeight,
                    width:"100%",
                    "& button":{borderRadius: 0, color: 'black', backgroundColor: '#DCF1EC'},
                    "& button.Mui-selected":{backgroundColor: '#71C887', color: 'white'},
                    }}
                    aria-label="secondary tabs example"
                    >
                    {createdSheets.length > 0? createdSheets.map((sheet,i) =>{
                        return(                                
                          // <Tab ref={(element) => {element? tabsRef.current[i] = element: <></>}} 
                          // suppressContentEditableWarning={true} 
                          // contentEditable={i+1 === currentTabID? true: false} 
                          // onInput={(e)=> {handleNameChange(e,e.currentTarget.textContent!)}} 
                          // sx={{backgroundColor:"#D9D9D9"}} 
                          // value={i + 1} 
                          // label={sheet.name}/>
                          <Tab ref={(element) => {element? tabsRef.current[i] = element: <></>}} 
                          suppressContentEditableWarning={true}
                          sx={{backgroundColor:"#D9D9D9", width:"100%", padding:"5px", maxHeight:"20px"}} 
                          value={sheet.id} 
                          label={
                            <span style={{display:"flex", flexDirection:"row", maxHeight:"20px"}}>
                              <div style={{fontSize:"16px", textAlign:"center",display:"flex", alignItems:"center", width:"70px", textOverflow:"ellipsis"}}>
                              {isEditing && currentTabID === sheet.id ? <TextField variant="standard" onChange={(e)=>{handleNameChange(e, e.target.value)}} placeholder="Table Name"></TextField>:sheet.name}
                              </div>

                              <div style={{display:"flex", flexDirection:"row", width:"40px", marginLeft:"5px"}}>                        
                              <div className="iconTab" style={{width:"20px", height:"20px", margin:"2px"}}
                               onClick={()=>{editName(sheet.id)}}>
                                {isEditing && currentTabID === sheet.id ? <CheckIcon/>:<EditIcon/>}
                              </div>
                              <div className="iconTab" style={{width:"20px", height:"20px", margin:"2px"}}
                              onClick={()=>{deleteFromList(i)}}>
                                <CloseIcon/>
                              </div>
                              
                              </div>
                            </span> 
                          }/>

                        )
                    }):<p></p>}
                  </Tabs>
              </div>
            </div> 
          </div>
          <p onClick={switchToAuto} style={{fontSize:"16px", paddingTop:'1em', paddingLeft:0, paddingBottom:'1em', margin:0, textDecoration:"underline", cursor:"pointer"}}>Return to automatic table detection</p>
          <div style={{display:"flex", justifyContent:"space-between"}}>         
          <Button disableElevation onClick={cancelProcess} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: 'white', color:'black', borderRadius:50 , paddingInline: 4, margin:'5px'}}>Cancel</Button>
          <Button disableElevation onClick={nextFunction} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: '#71C887', color:'white', borderRadius:50 , paddingInline: 4, margin:'5px'}}>Next</Button>
          </div>
          
        </div>
    </Box>
  );
};

export default styled(SelectTablePrompt)({});

export {}; // Add this empty export statement