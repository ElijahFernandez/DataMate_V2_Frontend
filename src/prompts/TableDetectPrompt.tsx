import { useLocation, useNavigate } from "react-router-dom";
import modalStyle from "../styles/ModalStyles";
import * as XLSX from 'xlsx'
import { Box, Button, Checkbox, CircularProgress, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, styled } from "@mui/material";
import { useEffect, useState } from "react";
import FileService from "../services/FileService";



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

type DetectProps = {
    toggleTableDetect: (status:boolean) => void,
    toggleSelect: (status:boolean, sheetIndex:number) => void,
    toggleEmptyDetect: (status:boolean) => void,
    toggleInconsistentDetect: (status:boolean) => void,
    // toggleNormalized:(status:boolean) => void,
    toggleImportSuccess: (status:boolean) => void,
    tblCount: number,
    fileId: number,
    vsheets:string[],
    sheetdata: object,
    updateEmpty: (sheet:string) => void,
    updateInc: (sheet:string) => void,
    // updateNorm: (sheet:string) => void,
    emptySheets: string[],
    incSheets: string[],
    // normSheets: string[],
    reset: () => void,
    updateSData: (data:Object) => void,
    startLoading: () => void,
    stopLoading: () => void,    
    wb: XLSX.WorkBook | null | undefined;
  }

interface WorkbookData {
    [sheet: string]: Object[];
}

interface TableRow {
    [key: string]: string | number;
}

interface ListItem {
  label: string;
  checked: boolean;
}

const TableDetectPrompt = ({startLoading, stopLoading, toggleTableDetect, toggleSelect, tblCount, fileId, vsheets, sheetdata, emptySheets, incSheets,
toggleEmptyDetect, toggleInconsistentDetect, toggleImportSuccess, updateEmpty, updateInc, reset, updateSData, wb}: DetectProps) => {  
  const [currentSheet, setCurrentSheet] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [HeaderArr, setHArr] = useState<[][] | undefined>(undefined);
  const [BodyArr, setBArr] = useState<[][] | undefined>(undefined);
  // const [SheetsWithEmpty, setSWE] = useState<string[]>([])
  // const [IncSheets, setIS] = useState<string[]>([])
  const [CheckboxList, setCBList] = useState<ListItem[]>([]);
  const [hasEmpty, SetEmpty] = useState(false);
  const [isInconsistent, SetInconsistent] = useState(false);
  // const [isNotNormalized, setNotNormalized] = useState(false);
  const [isCheckDone, setCheckDone] = useState(false);
  const nav = useNavigate();
  const TableHeight = (vsheets.length * 50).toString() + "px";


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

  function createListFromArray(): ListItem[] {
    const list: ListItem[] = [];

    vsheets.forEach(str => {
      list.push({ label: str, checked: true });
    });
    return list;
  }

  function toggleCheckbox(index: number): void {
    if (index >= 0 && index < CheckboxList.length) {
      let arr = [...CheckboxList]
      arr[index].checked = !arr[index].checked;
      setCBList(arr);
    }
  }
  
  function deleteUnchecked():boolean {
    let arr = CheckboxList.filter(item => !item.checked);
    let sd = sheetdata as WorkbookData;
    if(arr.length === vsheets.length){
      alert("Please leave at least one table checked");
      return false;
    }else{
      if(window.confirm("Delete Unchecked Tables? This action cannot be undone.")){
        for(const item in arr){
          const name = arr[item].label;
          const index = vsheets.indexOf(name);
          delete sd[name];
          if (index > -1) { 
            vsheets.splice(index, 1);
          }
          delete_ws(wb as XLSX.WorkBook, name);
        } 
        updateSData(sd as Object);
        return true;
      }
      return false;
    }
  }

  
  //set currentSheet and header array on load based from props
  //create a ListItem list from vsheets
  useEffect(()=>{
    setCurrentSheet(vsheets[0]);
    //typing currentSheet as key of sheetData
    const currSheet = currentSheet as keyof typeof sheetdata
    //typing object value as unknown before converting to row
    const row =  sheetdata[currSheet] as unknown
    let rowArr = row as [][]
    setHArr(rowArr)
    setCBList(createListFromArray());
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
    if(HeaderArr !== undefined){
        let rowsArr = []
        //copy rowArr
        rowsArr = HeaderArr.slice(0); 
        //remove header values
        rowsArr.splice(1 - 1, 1);
        setBArr(rowsArr)
    }
  },[HeaderArr])

//useEffect for detecting hasEmpty, isInconsistent changes
useEffect(()=>{
  if(isCheckDone){
    //Check hasEmpty
        //open empty value will be replaced with "NULL" prompt
        if(hasEmpty){
          toggleTableDetect(false);
          toggleEmptyDetect(true);
          console.log("Empty triggered");
        }else if(isInconsistent && !hasEmpty){
        //else if when hasEmpty is false but isInconsistent is true 
        //open fixing inconsistency prompts
          toggleTableDetect(false);
          toggleInconsistentDetect(true);
          console.log("Inconsistency triggered");
        }
        //open normalize table prompt
        // else if(isNotNormalized){
        //   toggleTableDetect(false);
        //   toggleNormalized(true);
        //   console.log("Normalized Prompt triggered");
        // }
        else{
          toggleTableDetect(false);
          toggleImportSuccess(true);
          console.log("Success Triggered")
        }
  }
    
},[isCheckDone])

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

  const cancelProcess = () => {
    startLoading();
      FileService.deleteFile(fileId).then((res)=>{
        toggleTableDetect(false);
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

    //for skipping headers
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

  // Normalization Functions ------------------------------------------------------------------------------
  //function for checking if a table has a primary key
  // function hasPossiblePrimaryKey(table: TableRow[]): boolean {
  //   if (table.length === 0) {
  //     return false; // The table is empty
  //   }
  
  //   let isFirstIteration = true;
  //   const firstColumnValues: Set<number> = new Set();

  //   for (const row of table) {
  //     if (isFirstIteration) {
  //       isFirstIteration = false;
  //       continue; // Skip the first iteration (headers)
  //     }

  //     const firstColumnValue = row[Object.keys(row)[0]]; // Get the value of the first column in each row

  //     if (typeof firstColumnValue !== "number" || firstColumnValues.has(firstColumnValue)) {
  //       return false; // The first column has a non-numeric value or a duplicate value
  //     }

  //     firstColumnValues.add(firstColumnValue);
  //   }
    
  
  
  //   return true; // The first column has unique numeric values
  // }

  //getting a string array of a column name and its dependencies
//   function getColumnDependencies(columnName: string, table: (string | number)[][], doneSearching: string[]): string[] {
//   const columnIndex = table[0].indexOf(columnName);

//   if (columnIndex === -1) {
//     return [];
//   }

//   const numRows = table.length;
//   const dependencies: string[] = [columnName];

//   for (let col = 1; col < table[0].length; col++) {
//     if (col !== columnIndex) {
//       const otherColumn = table[0][col];
//       let isDependency = true;

//       for (let row = 1; row < numRows; row++) {
//         const targetValue = table[row][columnIndex];
//         const otherValue = table[row][col];

//         if (!hasCorrespondingValue(table, columnName, otherColumn as string, targetValue, otherValue)) {
//           isDependency = false;
//           break;
//         }
//       }

//       if (isDependency && !doneSearching.includes(otherColumn as string)) {
//         dependencies.push(otherColumn as string);
//       }
//     }
//   }

//   return dependencies;
// }

// function hasCorrespondingValue(table: (string | number)[][], columnName1: string, columnName2: string, targetValue: any, currentValue: any): boolean {
//   const columnIndex1 = table[0].indexOf(columnName1);
//   const columnIndex2 = table[0].indexOf(columnName2);

//   if (columnIndex1 === -1 || columnIndex2 === -1) {
//     return false;
//   }

//   for (let row = 1; row < table.length; row++) {
//     if (table[row][columnIndex1] === targetValue && table[row][columnIndex2] !== currentValue) {
//       return false;
//     }
//   }

//   return true;
// }

  // function canBeNormalized(rows: (string | number)[][]): boolean {
  //   let doNotSearch:string[] = [];
  //   const numCols = rows[0].length;
  //   let res = false;

  //   for (let col = 0; col < numCols; col++) {
  //     const columnName = rows[0][col];
  //     console.log(`Column Name: ${columnName}`);
  //     if(!doNotSearch.includes(columnName as string)){
  //       console.log(columnName," not found in do not search");
  //       let depArr = getColumnDependencies(columnName as string, rows, doNotSearch);
  //       console.log("Dependency array: ", depArr);
  //       console.log("total cols left:", numCols - col)
  //       if(depArr.length > 1 && depArr.length !== numCols - col){
  //         for(const col in depArr){
  //           //inserting the column and the dependencies into do not search
  //           doNotSearch.push(depArr[col]); 
  //         } 
  //         //concat the columns in the depArr as table
  //         console.log("depArr", depArr)
  //         res = true;
  //         break;
  //       }else{
  //         doNotSearch.push(columnName as string);
  //       }
  //     }
  //   }

  //   return res;
  // }
  // ------------------------------------------------------------------------------------------------


  function togglePrompts(){
    const sd = sheetdata as WorkbookData;
    for(const s in vsheets){
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

      //checking if can be normalized
      // console.log("result: ", hasPossiblePrimaryKey(sd[vsheets[s]] as TableRow[]) && !canBeNormalized(sd[vsheets[s]] as [][]));
      // console.log("has possible pk: ", hasPossiblePrimaryKey(sd[vsheets[s]] as TableRow[]), "can be normalized: ", canBeNormalized(sd[vsheets[s]] as [][]));
      // //if block for normalized prompt
      // if(!(hasPossiblePrimaryKey(sd[vsheets[s]] as TableRow[]) && !canBeNormalized(sd[vsheets[s]] as [][]))){
      //   console.log("this happened");
      //   if(!normSheets.includes(vsheets[s])){
      //     updateNorm(vsheets[s]);
      //     setNotNormalized(true);
      //   }
        
      // }
    }
     setCheckDone(true);    
  }

  function nextFunction(){
    let arr = CheckboxList.filter(item => !item.checked);

    if(arr.length > 0){
      if(deleteUnchecked()){
        togglePrompts();
      }
    }else{
      togglePrompts();
    }

  }
  
  function switchToManual(): void {
    let index = vsheets.indexOf(currentSheet);
    toggleTableDetect(false);
    toggleSelect(true, index);
  }

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
          {tblCount > 1?  <p style={{fontSize:"32px", padding:0, margin:0}}> DataMate has detected <b>{tblCount}</b> possible tables</p>:
          <p style={{fontSize:"32px", padding:0, margin:0}}>DataMate has detected <b>{tblCount}</b> possible table</p>}
          <p style={{fontSize:"16px", paddingTop:'1em', paddingLeft:0, paddingBottom:'1em', margin:0}}>Please check the tables you want to include for processing.</p>
          <div style={{display:'flex', flexDirection:'row'}}>
            <div style={{width: '80%'}}>
              {/* for table preview */}
              {HeaderArr !== undefined && BodyArr !== undefined? <>
                          <Paper elevation={0} sx={{ height: vsheets.length > 3? {TableHeight}:"150px", overflow: 'auto', border:"5px solid #71C887", borderRadius: 0}}>
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
            <div style={{width: '20%', display:"flex", flexDirection:"row", justifyContent:"flex-start"}} >
              {/* for table tabs */}
              <Tabs
                orientation="vertical"
                value= {currentSheet}
                onChange={changeSheet}
                TabIndicatorProps={{sx:{backgroundColor:'rgba(0,0,0,0)'}}}
                sx={{
                display:"flex", 
                justifyContent:"flex-start",
                width:'100%',
                "& button":{borderRadius: 0, color: 'black', backgroundColor: '#DCF1EC'},
                "& button.Mui-selected":{backgroundColor: '#71C887', color: 'white'},
                }}
                aria-label="secondary tabs example"
                >
                {vsheets.length > 0 && CheckboxList.length !== 0? vsheets.map((sheet,i) =>{
                    return(
                        <Tab 
                          sx={{display:"flex", backgroundColor:"#D9D9D9", padding:"5px", maxHeight:"20px", justifyContent:"flex-start"}} 
                          value={sheet} 
                          label={
                            <span style={{display:"flex", flexDirection:"row", maxHeight:"20px", marginTop:"5px", width:"100%"}}>
                              <div style={{marginRight:"10px"}}>                        
                                <Checkbox sx={{margin:0, padding:0, backgroundColor:currentSheet === CheckboxList[i].label? '#71C887': '#DCF1EC',
                                "&:hover":{backgroundColor: currentSheet === CheckboxList[i].label? '#71C887': '#DCF1EC'}}} checked={CheckboxList[i].checked} onChange={()=>{toggleCheckbox(i);}} />  
                              </div>
                              <div style={{marginLeft:"5px"}}>
                                <p style={{margin:0, fontSize:"16px", textAlign:"left",display:"flex", alignItems:"center", overflow:"hidden", textOverflow:"ellipsis"}}>
                                  {sheet}        
                                </p>
                              </div>
                            </span> 
                          }/>
                          // <Tab disableRipple sx={{backgroundColor:"#D9D9D9", marginLeft:0, paddingLeft:0, textAlign:"left", textOverflow:"ellipsis"}}  value={sheet} label={sheet} />                     
                    )
                }):<></>}
              </Tabs>
            </div>
          </div> 
          <p onClick={switchToManual} style={{cursor:"pointer", fontSize:"16px", paddingTop:'1em', paddingLeft:0, paddingBottom:'1em', margin:0, textDecoration:"underline"}}>Highlight tables manually</p>
          <div style={{display:"flex", justifyContent:"space-between"}}>
          <Button disableElevation onClick={cancelProcess} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: 'white', color:'black', borderRadius:50 , paddingInline: 4, margin:'5px'}}>Cancel</Button>
          <Button disableElevation onClick={nextFunction} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: '#71C887', color:'white', borderRadius:50 , paddingInline: 4, margin:'5px'}}>Next</Button>
          </div>
        </div>
    </Box>
  );
};

export default styled(TableDetectPrompt)({});

export {}; // Add this empty export statement