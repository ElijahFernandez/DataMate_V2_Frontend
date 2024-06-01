import { useNavigate } from "react-router-dom";
import FileService from "../services/FileService";
import { Box, Button, CircularProgress, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, styled } from "@mui/material";
import * as XLSX from 'xlsx';
import { useEffect, useState } from "react";
import wordsToNumbers from "words-to-numbers";

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

type IncProps = {
    toggleInconsistentDetect: (status:boolean) => void,
    toggleImportSuccess: (status:boolean) => void,
    fileId: number,
    workbook: XLSX.WorkBook | null | undefined, 
    sheets:string[], 
    vsheets:string[],
    inclist:string[],
    sheetdata: object,
    reset: () => void,
    updateSData: (data:Object) => void,
    startLoading: () => void,
    stopLoading: () => void,
  }
type IncSheet ={
  sheetIndex: number,
  incCols: string[],
}
interface WorkbookData {
    [sheet: string]: Object[];
}

interface TableRow {
    [key: string]: string | number | Date;
}

interface ColumnTypes {
    [columnName: string]: string[];
}

const InconsistentDetectPrompt = ({startLoading, stopLoading, fileId, toggleImportSuccess, toggleInconsistentDetect, reset, workbook, sheets, vsheets, sheetdata, inclist, updateSData}: IncProps) => {  
  const nav = useNavigate();
  const [currentSheet, setCurrentSheet] = useState("");
  const [currentSheetIndex, setCurrSheetIndex] = useState(-1);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [HeaderArr, setHArr] = useState<[][] | undefined>(undefined)
  const [BodyArr, setBArr] = useState<[][] | undefined>(undefined)
  const [filteredData, setFData] = useState<Object>({});
  const [incSheetArr, setISArr] = useState<IncSheet[]>([]);
  const [majTypeArr, setMajTypeArr] = useState<string[]>([])
  const [isFilterDone, setFilterDone] = useState(false);

  useEffect(()=>{
    //create copy of sheetdata
    const data = JSON.parse(JSON.stringify(sheetdata))
    let tempIS = [...incSheetArr];
    for(const s in inclist){
       tempIS.push({
        sheetIndex: Number(s),
        incCols: findColumnsWithInconsistentTypes(data[inclist[s]]),
       })
    }
    setISArr(tempIS);
    setCurrSheetIndex(0);
  },[])

  useEffect(()=>{
    if(incSheetArr.length > 0){
    const fdata = JSON.parse(JSON.stringify(sheetdata))
    for(const s in inclist){
      fdata[inclist[s]] = filterColsWithIncValues(fdata[inclist[s]] as TableRow[]); 
    }
     setFilterDone(true);
     setFData(fdata);
  }
  }, [incSheetArr])

  //set currentSheet and header array on load based from props
  useEffect(()=>{ 
    if(isFilterDone){
    setCurrentSheet(inclist[0]);
    //typing currentSheet as key of sheetData
    const currSheet = currentSheet as keyof typeof filteredData
    //typing object value as unknown before converting to row
    const row =  filteredData[currSheet] as unknown
    let rowArr = row as [][]
    setHArr(rowArr)
    }
    
  },[filteredData])

  //useEffect for re-assigning the header array for the table when currentSheet state has changed
  useEffect(()=>{
    if(isFilterDone){
    //typing currentSheet as key of sheetData
    const currSheet = currentSheet as keyof typeof filteredData
    //typing object value as unknown before converting to row
    const row =  filteredData[currSheet] as unknown
    let rowArr = row as [][]
    console.log("fdata", filteredData);
    setMajTypeArr(createMajTypeArr(filteredData[currSheet] as unknown as TableRow[]))
    setHArr(rowArr)}
  },[currentSheet])

//useEffect for re-assigning the body array for the table when Header array state has changed
useEffect(()=>{
    console.log("fd atp:", filteredData)
    if(isFilterDone){
        const fdcpy =  JSON.parse(JSON.stringify(filteredData));
        console.log("copy", fdcpy)  
        //typing currentSheet as key of sheetData
        const currSheet = currentSheet as keyof typeof fdcpy
        //typing object value as unknown before converting to row
        const row =  fdcpy[currSheet] as unknown
        let rowArr = row as [][]
        rowArr.shift()
        setBArr(rowArr)
    }
  },[HeaderArr])

  useEffect(()=>{
    console.log("maj array: ", majTypeArr);
  },[majTypeArr])

  //function to convert words to number using wordtonumber library
  function convertToNumber(value: string): string | number{
    console.log("conversion called");
    if (typeof value === "number") {
      return value;
    } else if (typeof value === "string") {
      const numericValue = wordsToNumbers(value) as number;
      return isNaN(numericValue) ? value: numericValue;
    } else {
      return value;
    }
  }

  function findColumnsWithInconsistentTypes(table: TableRow[]): string[] {
    const columns: { [key: string]: Set<string> } = {};
    const headers = table[0] as unknown as string[];

    // Iterate through rows to determine data types for each column
    for (let rowIndex = 1; rowIndex < table.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < headers.length; columnIndex++) {
            const columnName = table[0][columnIndex] as string;
            const cellValue = table[rowIndex][columnIndex];
            //console.log("checking...", cellValue, " of column ",  columnName);
            if (!columns[columnName]) {
                columns[columnName] = new Set();
            }

            if (typeof cellValue === 'boolean'){
              // console.log("IT's bool"); 
              columns[columnName].add('boolean');
            }
            else if(typeof cellValue === 'string') {
              //console.log("IT's str");  
              columns[columnName].add('string');
            } else if (typeof cellValue === 'number') {
              //console.log("IT's num");
              columns[columnName].add('number');
            } else if (cellValue instanceof Date) {
              //console.log("IT's date");
              columns[columnName].add('date');
            }
        }
    }

    // Find columns with inconsistent data types
    const inconsistentColumns: string[] = [];
    for (const columnName in columns) {
      console.log("result ",columns[columnName])
        if (columns[columnName].size > 1) {
            inconsistentColumns.push(columnName);
        }
    }

    return inconsistentColumns;
  }

  //find the dominant data type in column
  function findMajorityDataType(values: (string | number | boolean)[]): string {
    const typeCounts: Record<string, number> = {};

    let isFirst = true;

    values.forEach(value => {
      if (!isFirst) {
        typeCounts[value.toString()] = (typeCounts[value.toString()] || 0) + 1;
      }
      
      isFirst = false;
    });
  
    let majorityType = '';
    let majorityCount = 0;
  
    for (const type in typeCounts) {
      if (typeCounts[type] > majorityCount) {
        majorityType = type;
        majorityCount = typeCounts[type];
      }
    }
    console.log("the count is: ",typeCounts);
    console.log("the values are: ", values, "so the majority is: ", majorityType);
    return majorityType;
  }

  function convertToType(value: string | number | boolean | Date, targetType: string): string | number {
    switch (targetType) {
      case 'number':
        return convertToNumber(value as string);
      case 'boolean':
        const str = value.toString();  
        if(str.toLowerCase() === 'true' || str.toUpperCase() === 'TRUE' || str === '1'){
            return "TRUE";
        }else if(str.toLowerCase() === 'false' || str.toUpperCase() === 'FALSE' || str === '0'){
            return "FALSE";
        }else{
            return str;
        }
      case 'date':
        return Date.parse(value.toString()).toString();
      default:
        return value.toString();
    }
  }

  function filterColsWithIncValues(table: TableRow[]): TableRow[] {
    const headers = table[0] as unknown as string[]; 
    console.log("headers ",headers, "will be checked if they are here: ", incSheetArr);
    // Find the indices of columns in the inclist
    const includedColumnIndices: number[] = [];
    headers.forEach((header, index) => {
        if (incSheetArr[currentSheetIndex].incCols.includes(header)) {
            includedColumnIndices.push(index);
        }
    });
    
    console.log("list of indices: ",includedColumnIndices)
    
    // Filter columns
    const filteredTable: (string | number | Date)[][]= [];

    // Iterate through each row in the table
    table.forEach((row) => {
      const filteredRow: (string | number | Date)[] = [];

      // Iterate through each index in includedColumnIndices and push corresponding values to filteredRow
      includedColumnIndices.forEach((index) => {
          const header = Object.keys(row)[index];
          if (header !== undefined) {
              filteredRow.push(row[header]);
          }
      });

        // Add the filteredRow to the filteredTable
        filteredTable.push(filteredRow);
    });
    
    console.log("filter res:", filteredTable);
    return filteredTable as unknown as TableRow[];       
  }
  
  const cancelProcess = () => {
    startLoading();
        FileService.deleteFile(fileId).then((res)=>{
            toggleInconsistentDetect(false);
            reset();
            stopLoading();
            nav("/");
        }).catch((err)=>{
            console.log(err);
        })
    }

  function convertToMajorityType(table: TableRow[]): TableRow[] {
        const processedTable: TableRow[] = [];
        const columnTypes: ColumnTypes = {};
      
        table.forEach(row => {
          for (const columnName in row) {
            const value = row[columnName];
            const valueType = typeof value;
      
            if (!columnTypes[columnName]) {
              columnTypes[columnName] = [];
            }
      
            columnTypes[columnName].push(valueType);
          }
        });
        console.log("column type object: " , columnTypes);
      
        table.forEach(row => {
          const processedRow: TableRow = {};
      
          for (const columnName in row) {
            const value = row[columnName];
            const targetType = findMajorityDataType(columnTypes[columnName]);
            console.log("in column", columnName," the value", value, " convert to type ", targetType)
            const convertedValue = convertToType(value, targetType);
            processedRow[columnName] = convertedValue;
          }
      
          processedTable.push(processedRow);
        });
      
        return processedTable;
      }
  function createMajTypeArr(table: TableRow[]): string[] {
        const columnTypes: ColumnTypes = {};
        const majTypes: string[] = [];
      
        table.forEach(row => {
          for (const columnName in row) {
            const value = row[columnName];
            const valueType = typeof value;
      
            if (!columnTypes[columnName]) {
              columnTypes[columnName] = [];
            }
      
            columnTypes[columnName].push(valueType);
          }
        });
        console.log("column type object: " , columnTypes);
      
        table.forEach(row => {
          for (const columnName in row) {
            const majType = findMajorityDataType(columnTypes[columnName]);
            majTypes.push(majType);
          }
        });
      
        return majTypes;
  }    

  function continueFunction(){
    const sd = sheetdata as WorkbookData;
    //use algorithm for replacing empty values with NULL
    for (const sheet in inclist){
        sd[inclist[sheet]] = convertToMajorityType(sd[inclist[sheet]] as TableRow[]); 
        workbook!.Sheets[inclist[sheet]] = XLSX.utils.json_to_sheet(sd[inclist[sheet]], {skipHeader:true});
      }
    updateSData(sd as Object);
    //clean inconsistent list
    while(inclist.length > 0){
        inclist.pop();
    }
    console.log("result: ", sd);
    toggleInconsistentDetect(false);
    toggleImportSuccess(true);  
  }

  function keepIncFunction(){
    //clean inconsistent list
    while(inclist.length > 0){
        inclist.pop();
    }
    toggleInconsistentDetect(false);
    toggleImportSuccess(true);  
  }

  const changeSheet = (stringevent: React.SyntheticEvent, newValue: string) =>{
    const sIndex = inclist.indexOf(newValue);
    if(sIndex !== -1){
      setCurrSheetIndex(sIndex);
      setCurrentSheet(newValue);
    }
    else{
      alert("Index out of bounds");
    }
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
          <p style={{fontSize:"32px", padding:0, margin:0}}>DataMate has detected inconsistencies in your data.</p>
          <p style={{fontSize:"16px", padding:0, margin:0, textAlign:"left"}}> Datamate can fix some of the inconsistencies in your data by 
          making changes to your data.</p>
          <div style={{display:"flex", flexDirection:"row"}}>
            <div style={{width: '85%'}}>
              {/* for table preview */}
              {HeaderArr !== undefined && BodyArr !== undefined? <>
                          <Paper elevation={0} sx={{ maxHeight:'270px', overflow: 'auto', border:"5px solid #71C887", borderRadius: 0}}>
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
                                              { typeof cell === majTypeArr[j]?
                                              <TableCell style={{padding:5, width: '1px', whiteSpace: 'nowrap', fontSize:'10px'}}
                                              key={j} align='left' width="100px">
                                              {cell === true? "TRUE": cell === false? "FALSE":cell}
                                              </TableCell>:
                                              <TableCell style={{backgroundColor:"orange" ,padding:5, width: '1px', whiteSpace: 'nowrap', fontSize:'10px'}}
                                              key={j} align='left' width="100px">{cell === true? "TRUE": cell === false? "FALSE":cell}</TableCell>
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
              </>:
              <><CircularProgress size="10rem" 
              color="success" /></>}
            </div>
            <div style={{width: '15%'}}>
              {/* for table tabs */}
              <Tabs
                orientation="vertical"
                value= {currentSheet}
                onChange={changeSheet}
                TabIndicatorProps={{sx:{backgroundColor:'rgba(0,0,0,0)'}}}
                sx={{
                "& button":{borderRadius: 0, color: 'black', backgroundColor: '#DCF1EC'},
                "& button.Mui-selected":{backgroundColor: '#71C887', color: 'white'},
                }}
                aria-label="secondary tabs example"
                >
                {inclist.length > 0? inclist.map((sheet,i) =>{
                    return(                                
                        <Tab sx={{backgroundColor:"#D9D9D9"}}value={sheet} label={sheet} />
                    )
                }):<></>}
              </Tabs>
            </div>
          </div>
          <div style={{display:"flex", justifyContent:"space-between"}}>
            <Button disableElevation onClick={cancelProcess} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: 'white', color:'black', borderRadius:50 , paddingInline: 4, margin:'5px'}}>Cancel</Button>
            <div>
              <Button disableElevation onClick={keepIncFunction} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: '#71C887', color:'white', borderRadius:50 , paddingInline: 4,     margin:'5px'}}>Keep Inconsistency</Button>
              <Button disableElevation onClick={continueFunction} variant="contained" sx={{fontSize:'18px', textTransform:'none', backgroundColor: '#71C887', color:'white', borderRadius:50 , paddingInline: 4, margin:'5px'}}>Make Changes</Button>
            </div>
          </div>
        </div>
          
    </Box>
  );
};

export default styled(InconsistentDetectPrompt)({});

export {}; // Add this empty export statement