import { Box, CircularProgress, InputAdornment, Paper, Tab, Tabs, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TableService from "../services/TableService";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { EditIcon, TblIcon } from "../components/icons";
import { SaveAs } from "@mui/icons-material";

type DatabasePageProps = {
    stopLoading: () => void,
    startLoading: () => void,
  }

type DatabaseType = {
  databaseId: number,
  databaseName: string,
  user:Object
}

type TableType ={
  tableId: number,
  tableName: string,
  database: DatabaseType,
  columns:string[],
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

interface TableObj{
  tblName: string,
  data: Object[],
}

interface TableRow {
  [key: string]: string | number | boolean | Date;
}

export default function DatabasePage({stopLoading, startLoading}:DatabasePageProps) {
    const loc = useLocation();
    const nav = useNavigate();
    const dbId = loc.state.dbid;
    const [Tables, setTables] = useState<string[]>([]);
    const [tblData, setTblData] = useState<Object[]>([]);
    const [currentTbl, setCurrentTbl] = useState("");
    const [currentTblID, setCurrentTblID] = useState(0);
    const [colsData, setColsData] = useState<HeaderConfig[]>([]);
    const [Database, setDBName] = useState('');
    const [downloadWindow, setDLWindow] = useState(false);
    const [DBObj, setDBObj] = useState<TableObj[]>([])
    const tblHeight = tblData.length * 47;
    let sqlStr = "";
    let FirstColumns:string[] = [];


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

  function createObjects(keys: string[], arrayOfArrays: (number | string | Date | boolean)[][]): Object[] {
    console.log("received array of arrays", arrayOfArrays);
    if (keys.length === 0 || arrayOfArrays.length === 0) {
      return [];
    }
  
    if (keys.length !== arrayOfArrays[0].length) {
      throw new Error("Number of keys does not match the number of values in the arrays.");
    }
  
    return arrayOfArrays.map((arr) => {
      const obj: { [key: string]: (number | string | Date | boolean) } = {};
      keys.forEach((key, index) => {
        if(arr[index].toString().length > 9 &&  isValidDate(arr[index] as string)){
          console.log("arr[index] is ", arr[index]);
          let dateVar = new Date(arr[index] as string);
          obj[key] = dateVar.toISOString().slice(0, 10).replace('T', ' ');
          console.log("here:",obj[key])
        }else{
          obj[key] = arr[index];
        }
      });
      return obj;
    });
  }

  function isValidDate(dateString: string): boolean {
    const parsedDate = new Date(dateString);
    return !isNaN(parsedDate.getTime());
  }

  function getColumnType(value: (string | number | boolean | Date)): string {
    console.log("Type of ", value, " is ", typeof value);
    if (typeof value === "string") {
      if(isValidDate(value)){
        return "DATE";
      }else{
        return "VARCHAR(255)";
      }
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
    } else {
        throw new Error(`Unsupported data type: ${typeof value}`);
    }}
  
  function getCreateQuery(jsonData: TableRow[], tableName: string): String {
    if (jsonData.length === 0) {
        throw new Error("JSON array is empty.");
    }
    let dbSql = Database.replace(/ *\([^)]*\) */g, "");
    let ReturnStr = `CREATE TABLE ${dbSql}.${tableName}`;
    const columns: string[] = Object.keys(jsonData[0]);
    ReturnStr = ReturnStr + " " + `(${columns.map(col => `${col.replace(/[^a-zA-Z0-9]/g,'_')} ${getColumnType(jsonData[0][col])}`).join(', ')});`;
    
    return ReturnStr;
  }

  function getInsertQuery(jsonData: TableRow[], tableName: string): string {
    let dbSql = Database.replace(/ *\([^)]*\) */g, "");
    let returnStr = `INSERT INTO ${dbSql}.${tableName} `
    const columns: string[] = Object.keys(jsonData[0]);
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
    return returnStr + " " + valsQuery;
  }

  function compileDB(){
    //empty DBObj
    startLoading()
    while(DBObj.length > 0){
      DBObj.pop();
    }
    let tempArr = [...DBObj]
    let iniColumns:string[][] = [];
    let tblNames:string[] = [];
    for(const tbl in Tables){
      TableService.getTblByName(Tables[tbl])
      .then((res)=>{
        let tblRes = res as TableType
        iniColumns[tbl] = tblRes.columns;
        tblNames[tbl] = tblRes.tableName;
        console.log("iniColumns arr:", iniColumns);
        TableService.getTblData(Tables[tbl])
        .then((res)=>{
          tempArr.push({tblName:tblNames[tbl], data:createObjects(iniColumns[tbl],res as [][])})
          if(tempArr.length == Tables.length){
          console.log("compiling complete...", tempArr);
          stopLoading()
          setDBObj(tempArr);
          setDLWindow(true);
          }
        }).catch((err)=>{
          console.log(err);
        })
      }).catch((err)=>{
        console.log(err);
      })
    }
  }

  useEffect(()=>{
    if(DBObj.length === Tables.length && downloadWindow){
      //for create
      console.log("str before ", sqlStr);
      DBObj.map((tbl, t)=>{
        sqlStr = sqlStr + getCreateQuery(tbl.data as TableRow[], tbl.tblName) + "\n";
      })
      //for insert
      DBObj.map((tbl, t)=>{
        sqlStr = sqlStr + getInsertQuery(tbl.data as TableRow[], tbl.tblName) + "\n";
      })
      // console.log("str so far:", sqlStr);
      const finalStr = `CREATE DATABASE ${Database.replace(/ *\([^)]*\) */g, "")};` + "\n" + sqlStr;
      const sqlFile =  new Blob([`${finalStr}`],{type: 'text/plain;charset=utf-8'});
      const href = URL.createObjectURL(sqlFile);
  
      // create "a" HTML element with href to file & click
      const link = document.createElement('a');
      link.href = href;
      // const name = JSON.stringify(fileName)
      link.setAttribute('download', `${Database}.sql`); //or any other extension
      document.body.appendChild(link);
      link.click();
  
      // clean up "a" element & remove ObjectURL
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      setDLWindow(false);

    }
  },[DBObj])

    useEffect(()=>{
      //if(dbId !== undefined){
        TableService.getTblByDB(dbId).then(
            (res)=>{
                console.log("get res:", res);
                let tblResponse = res as TableType[];
                let tableArr = [...Tables];
                setDBName(tblResponse[0].database.databaseName);
                FirstColumns = tblResponse[0].columns;
                tblResponse.map((tbl, i)=>{
                  if(!tableArr.includes(tbl.tableName)){
                    tableArr.push(tbl.tableName);
                  }
                });
                setTables(tableArr);
                setCurrentTbl(Tables[0]);
                setCurrentTblID(0);
                setColsData(createColumns(tblResponse[0].columns))
                if(Tables[0] !== undefined){
                  TableService.getTblData(Tables[0])
                .then((res)=>{
                  console.log("get tbl data res:",res);
                  setTblData(createObjects(tblResponse[0].columns, res as [][]));
                }).catch((err)=>{
                  console.log(err);
                })
                }
                
              }
        ).catch((err)=>{
          console.log(err);
        })
      //}
        
    },[])

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTblID(newValue);
        setCurrentTbl(Tables[newValue]);
    };

    const handleExport = () => {
      compileDB();
    }

    useEffect(()=>{
      if(Tables[currentTblID] !== undefined || Tables[currentTblID] !== null){
        TableService.getTblByName(Tables[currentTblID])
        .then((res)=>{
          let tblRes:TableType = res as TableType;
          setColsData(createColumns(tblRes.columns));
          
            TableService.getTblData(Tables[currentTblID])
            .then((res)=>{
              setTblData(createObjects(tblRes.columns, res as [][]));
            })
          
        }).catch((err)=>{
          console.log(err);
        })
    }
    }, [currentTbl])

    function getTabProps(index: number) {
        return {
          id: `vertical-tab-${index}`,
          'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    useEffect(()=>{
      if(Tables.length > 0){
        TableService.getTblData(Tables[0])
        .then((res)=>{
          console.log("get tbl data res:",res);
          setTblData(createObjects(FirstColumns, res as [][]));
          stopLoading();
        }).catch((err)=>{
          console.log(err);
        })
      }
    },[Tables])
    useEffect(()=>{
      console.log("current table is ", currentTbl);
    }, [currentTbl])

    return(
        <>
        {tblData !== undefined? <>
            <Box sx={{height:"85vh", margin:'1em', marginTop:'5em'}}>
                <Box sx={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
                    <div style={{display:"flex", flexDirection:"row", padding:"5px"}}>
                        <h1 style={{margin:5}}>{Database}</h1>
                        <div className="iconTab" style={{height:"25px", width:"25px", 
                        backgroundColor:'#71C887', padding:"10px", borderRadius:10}}>
                            <EditIcon/>
                        </div>
                    </div>
                    <div className="iconTab"
                    onClick={handleExport}
                    style={{display:"flex", fontSize:"18px", alignSelf:"flex-end", cursor:"pointer"}}>
                        EXPORT AS SQL
                    </div>
                    
                </Box>
                <Box style={{display:"flex", flexDirection:"row", backgroundColor:"#BAD1BE", height:"100%"}}>
                    <Box sx={{width:"20%", display:"flex", flexDirection:"column", margin:".5em"}}>
                        <TextField
                        hiddenLabel
                        placeholder="Search Tables"
                        sx={{border: 'none', "& fieldset": { border: 'none' }, backgroundColor:"white", borderRadius:5
                        , marginBottom:".3em"}}
                        InputProps={{ startAdornment: (<InputAdornment position="start"> <SearchOutlinedIcon /> </InputAdornment>),
                        disableUnderline: true, }} 
                        />
                        <Box sx={{backgroundColor:"#347845", padding:".5em", color:"white"}}>Tables</Box>
                        <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={currentTblID}
                        onChange={handleChange}
                        aria-label="Vertical tabs example"
                        sx={{ borderRight: 1, borderColor: 'divider', backgroundColor:"white",
                        "& button.Mui-selected":{backgroundColor: '#91E09F'},
                        display:'flex', justifyContent:"left", height:'100%', width:"100%",
                        }}
                        
                        >
                          {Tables.map((tbl, i)=>{
                            return  <Tab
                            sx={{alignItems:"flex-start", textOverflow:"ellipsis"}} 
                            label={
                            <span style={{display:"flex", flexDirection:"row", maxHeight:"30px"}}>
                              <div style={{width:"20px", height:"20px", margin:"2px"}}>
                                <TblIcon/>
                              </div>
                              <p style={{margin:"4px", maxWidth:"265px", fontSize:"14px", overflow:"hidden", textOverflow:"ellipsis"}}>{tbl}</p>
                            </span> 
                            }{...getTabProps(i)} />
                          })}
                        </Tabs>
                    </Box>
                    <Box sx={{width:"80%", display:"flex", flexDirection:"column", margin:".5em"}}>
                        <Box sx={{backgroundColor:"#347845",maxWidth: '40%', padding:".3em", display:"flex", justifyContent:"center", color:"white"}}>
                            {currentTbl === "" || currentTbl === undefined? "Table" : currentTbl}
                        </Box>
                        <Box sx={{ width: '100%', display:"flex", justifyContent:"center", marginTop:0}}>
                            <Box style={{backgroundColor:"#347845",width: '100%', display:"flex" }}>
                                <div style={{width: '100%', display:"flex", justifyContent:"center"}}>
                                {/* for table preview */}
                                {colsData.length > 0 && tblData.length > 0? <>
                                    <Paper elevation={0} sx={{ maxHeight:'500px', width:"100%", margin:'.3em', borderColor:"#347845"}}>
                                    {/* //code for the table */}
                                    <ReactDataGrid
                                        idProperty="id"
                                        style={{width:"100%", height:tblHeight, maxHeight:450}}
                                        columns={colsData}
                                        dataSource={tblData}
                                        theme="green-light"
                                    />
                                    </Paper>     
                                    </>:
                                    <><CircularProgress size="10rem"/>
                                    </>}
                                </div>
                            </Box>
                        </Box>
                    </Box>
                    </Box>
            </Box>
        </>:<></>}
        </> 
    )
}