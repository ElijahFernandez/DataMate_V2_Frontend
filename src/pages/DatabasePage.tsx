import {
  Box,
  CircularProgress,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Button,
  Modal,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TableService from "../services/TableService";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { EditIcon, TblIcon } from "../components/icons";
import { SaveAs } from "@mui/icons-material";
import Chatbox from "../components/Chatbox";

import FormPrompt from "../prompts/FormPrompt";
import { FormHeaders } from "../api/dataTypes";
import ReportPrompt from "../prompts/ReportPrompt";
import FormDetailsPrompt from "../prompts/FormDetailsPrompt";

type DatabasePageProps = {
  stopLoading: () => void;
  startLoading: () => void;
};

type UserType = {
  userId: number;
};

type DatabaseType = {
  databaseId: number;
  databaseName: string;
  user: UserType;
};

type TableType = {
  tableId: number;
  tableName: string;
  database: DatabaseType;
  columns: string[];
};

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

interface TableObj {
  tblName: string;
  data: Object[];
}

interface TableRow {
  [key: string]: string | number | boolean | Date;
}

//
//
//
interface ProcessedFormHeaders {
  headerName: string;
  headerValue: string;
}
//
//
//

export default function DatabasePage({
  stopLoading,
  startLoading,
}: DatabasePageProps) {
  const loc = useLocation();
  const nav = useNavigate();
  const dbId = loc.state.dbid;
  // note: loc.state is getting the id from the prev page RIGHT HEREEE
  const [Tables, setTables] = useState<string[]>([]);
  const [tblData, setTblData] = useState<Object[]>([]);
  const [currentTbl, setCurrentTbl] = useState("");
  const [currentTblID, setCurrentTblID] = useState(0);
  const [userID, setUserID] = useState(0);
  const [colsData, setColsData] = useState<HeaderConfig[]>([]);
  const [Database, setDBName] = useState("");
  const [downloadWindow, setDLWindow] = useState(false);
  const [DBObj, setDBObj] = useState<TableObj[]>([]);
  const tblHeight = tblData.length * 47;
  let sqlStr = "";
  let FirstColumns: string[] = [];
  const [isChatboxOpen, setIsChatboxOpen] = useState<boolean>(false);

  //
  //
  //
  const [formHeaders, setFormHeaders] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  
  const handleOpen = () => setFormOpen(true);

  const handleClose = () => {
    setFormOpen(false);
    // setIsProcessing(true);
  };

  const handleDetailsClose = () => {
    setFormOpen(false);
    setShowDetailsForm(false);
  };

  const handleFormTypeChange = (newFormType: string) => {
    setFormType(newFormType);
    handleClose();
    // Only show the details form if a form type was selected
    if (newFormType !== "") {
      setShowDetailsForm(true);
    }
  };
  const handleInsertFormClose = (
    event: React.MouseEvent<HTMLElement>,
    reason: "backdropClick" | "escapeKeyDown" | "close"
  ) => {
    // Prevent the modal from closing on backdrop click
    if (reason !== "backdropClick") {
      setShowDetailsForm(false);
    }
  };

  const [reportOpen, setReportOpen] = useState(false);
  const handleReportOpen = () => setReportOpen(true);
  const handleReportClose = () => {
    setReportOpen(false);
  };

  useEffect(() => {
    if (isProcessing) {
      const timer = setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing]);

  const [processedHeaders, setProcessedHeaders] = useState<
    ProcessedFormHeaders[] | undefined
  >([]);

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setShowDetailsForm(true);

    // setShowDetailsForm(true);
    console.log("Show details form" + showDetailsForm);
  };

  // Function to convert formHeaders to JSON format
  const convertToJson = (): string => {
    // Convert the formHeaders array to JSON string
    return JSON.stringify({ headers: formHeaders });
  };

  const toggleChatbox = () => {
    setIsChatboxOpen((prev) => !prev);
  };

  function createColumns(strings: string[]): HeaderConfig[] {
    let strArr: HeaderConfig[] = [];
    setFormHeaders(strings);
    strings.map((str, i) => {
      strArr.push({
        name: str,
        header: str,
        defaultFlex: 1,
        headerProps: {
          style: {
            backgroundColor: "#71C887",
            color: "white",
            fontWeight: "bold",
          },
        },
      });
    });

    return strArr;
  }

  function createObjects(
    keys: string[],
    arrayOfArrays: (number | string | Date | boolean)[][]
  ): Object[] {
    console.log("received array of arrays", arrayOfArrays);
    if (keys.length === 0 || arrayOfArrays.length === 0) {
      return [];
    }

    if (keys.length !== arrayOfArrays[0].length) {
      throw new Error(
        "Number of keys does not match the number of values in the arrays."
      );
    }

    return arrayOfArrays.map((arr) => {
      const obj: { [key: string]: number | string | Date | boolean } = {};
      keys.forEach((key, index) => {
        if (
          arr[index].toString().length > 9 &&
          isValidDate(arr[index] as string)
        ) {
          console.log("arr[index] is ", arr[index]);
          let dateVar = new Date(arr[index] as string);
          obj[key] = dateVar.toISOString().slice(0, 10).replace("T", " ");
          console.log("here:", obj[key]);
        } else {
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

  function getColumnType(value: string | number | boolean | Date): string {
    console.log("Type of ", value, " is ", typeof value);
    if (typeof value === "string") {
      if (isValidDate(value)) {
        return "DATE";
      } else {
        return "VARCHAR(255)";
      }
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        if (value > 2000000000) {
          return "VARCHAR(255)";
        } else {
          return "INTEGER";
        }
      } else {
        return "DOUBLE";
      }
    } else if (typeof value === "boolean") {
      return "BOOLEAN";
    } else {
      throw new Error(`Unsupported data type: ${typeof value}`);
    }
  }

  // function getCreateQuery(
  //   jsonData: TableRow[],
  //   tableName: string,
  //   primaryKeyColumn?: string
  // ): string {
  //   if (jsonData.length === 0) {
  //     throw new Error("JSON array is empty.");
  //   }

  //   let dbSql = Database.replace(/ *\([^)]*\) */g, "");
  //   let returnStr = `CREATE TABLE ${dbSql}.${tableName}`;

  //   const columns: string[] = Object.keys(jsonData[0]);

  //   // Function to transform column names
  //   const transformColumnName = (col: string): string => col.replace(/[^a-zA-Z0-9]/g, "_");

  //   // Automatically identify primary key if none provided
  //   if (!primaryKeyColumn) {
  //     // Look for the leftmost column that contains 'id'
  //     primaryKeyColumn = columns.find(col => col.toLowerCase().includes('id')) || undefined;
  //   }

  //   // Transform primary key column if it was identified
  //   const transformedPrimaryKeyColumn = primaryKeyColumn ? transformColumnName(primaryKeyColumn) : undefined;

  //   // Construct the columns part of the query
  //   let columnsDefinition = columns
  //     .map(col => `${transformColumnName(col)} ${getColumnType(jsonData[0][col])}`)
  //     .join(", ");

  //   // Add primary key definition if found
  //   if (transformedPrimaryKeyColumn && columns.includes(primaryKeyColumn!)) {
  //     columnsDefinition += `, PRIMARY KEY (${transformedPrimaryKeyColumn})`;
  //   }

  //   returnStr += ` (${columnsDefinition});`;

  //   return returnStr;
  // }
  function getCreateQuery(
    jsonData: TableRow[],
    tableName: string,
    primaryKeyColumn?: string
  ): string {
    if (jsonData.length === 0) {
      throw new Error("JSON array is empty.");
    }

    let dbSql = Database.replace(/ *\([^)]*\) */g, "");
    let returnStr = `CREATE TABLE ${dbSql}.${tableName}`;

    const columns: string[] = Object.keys(jsonData[0]);

    // Function to transform column names
    const transformColumnName = (col: string): string =>
      col.replace(/[^a-zA-Z0-9]/g, "_");

    // Helper function to check if a column contains unique numeric values
    const isNumericAndUnique = (col: string): boolean => {
      const values = jsonData.map((row) => row[col]);
      const uniqueValues = new Set(values);
      // Check if all values are numbers and if they are unique
      return (
        values.every((val) => typeof val === "number") &&
        uniqueValues.size === values.length
      );
    };

    // Automatically identify primary key if none provided
    if (!primaryKeyColumn) {
      // Look for the leftmost column with numeric unique values
      primaryKeyColumn = columns.find((col) => isNumericAndUnique(col));

      // If no numeric unique column is found, fallback to the 'id' clause
      if (!primaryKeyColumn) {
        primaryKeyColumn =
          columns.find((col) => col.toLowerCase().includes("id")) || undefined;
      }
    }

    // Transform primary key column if it was identified
    const transformedPrimaryKeyColumn = primaryKeyColumn
      ? transformColumnName(primaryKeyColumn)
      : undefined;

    // Construct the columns part of the query
    let columnsDefinition = columns
      .map(
        (col) =>
          `${transformColumnName(col)} ${getColumnType(jsonData[0][col])}`
      )
      .join(", ");

    // Add primary key definition if found
    if (transformedPrimaryKeyColumn && columns.includes(primaryKeyColumn!)) {
      columnsDefinition += `, PRIMARY KEY (${transformedPrimaryKeyColumn})`;
    }

    returnStr += ` (${columnsDefinition});`;

    return returnStr;
  }

  // function getAlterQuery(tables: { tableName: string, columns: string[] }[]): string {
  //   let alterQueries = "";
  //   let dbSql = Database.replace(/ *\([^)]*\) */g, "");

  //   // Function to transform column names (clean them for SQL)
  //   const transformColumnName = (col: string): string => col.replace(/[^a-zA-Z0-9]/g, "_");

  //   // Determine primary keys for each table
  //   const primaryKeys: { [tableName: string]: string } = {};

  //   tables.forEach(table => {
  //     const idColumns = table.columns.filter(col => col.toLowerCase().includes('id'));
  //     if (idColumns.length > 0) {
  //       // Assume the leftmost id column is the primary key
  //       primaryKeys[table.tableName] = idColumns[0];
  //     }
  //   });

  //   // Build ALTER TABLE queries for foreign keys
  //   tables.forEach(table => {
  //     const primaryKey = primaryKeys[table.tableName];

  //     table.columns.forEach(col => {
  //       if (col.toLowerCase().includes('id') && col !== primaryKey) {
  //         // Find the table that has this column as a primary key
  //         const referencedTable = tables.find(tbl => primaryKeys[tbl.tableName] === col);

  //         if (referencedTable) {
  //           const transformedTableName = transformColumnName(table.tableName);
  //           const transformedColumn = transformColumnName(col);
  //           const transformedReferencedTableName = transformColumnName(referencedTable.tableName);

  //           // Append the ALTER TABLE query
  //           alterQueries += `ALTER TABLE ${dbSql}.${transformedTableName} ADD FOREIGN KEY (${transformedColumn}) REFERENCES ${transformedReferencedTableName}(${transformedColumn});\n`;
  //         }
  //       }
  //     });
  //   });

  //   return alterQueries;
  // }

  function getAlterQuery(
    tables: { tableName: string; columns: string[] }[]
  ): string {
    let alterQueries = "";
    let dbSql = Database.replace(/ *\([^)]*\) */g, "");

    // Function to transform column names (clean them for SQL)
    const transformColumnName = (col: string): string =>
      col.replace(/[^a-zA-Z0-9]/g, "_");

    // Determine primary keys for each table
    const primaryKeys: { [tableName: string]: string } = {};

    tables.forEach((table) => {
      if (table.columns.length > 0) {
        // Assume the leftmost column is the primary key
        primaryKeys[table.tableName] = table.columns[0];
      }
    });

    // Build ALTER TABLE queries for foreign keys
    tables.forEach((table) => {
      const primaryKey = primaryKeys[table.tableName];

      table.columns.forEach((col) => {
        if (col.toLowerCase().includes("id") && col !== primaryKey) {
          // Find the table that has this column as a primary key
          const referencedTable = tables.find(
            (tbl) => primaryKeys[tbl.tableName] === col
          );

          if (referencedTable) {
            const transformedTableName = transformColumnName(table.tableName);
            const transformedColumn = transformColumnName(col);
            const transformedReferencedTableName = transformColumnName(
              referencedTable.tableName
            );

            // Append the ALTER TABLE query
            alterQueries += `ALTER TABLE ${dbSql}.${transformedTableName} ADD FOREIGN KEY (${transformedColumn}) REFERENCES ${transformedReferencedTableName}(${transformedColumn});\n`;
          }
        }
      });
    });

    return alterQueries;
  }

  function getInsertQuery(jsonData: TableRow[], tableName: string): string {
    let dbSql = Database.replace(/ *\([^)]*\) */g, "");
    let returnStr = `INSERT INTO ${dbSql}.${tableName} `;
    const columns: string[] = Object.keys(jsonData[0]);
    const insertValues = jsonData
      .map(
        (record) =>
          `(${columns
            .map((col) => {
              const value = record[col];
              if (value === "NULL") {
                return "NULL";
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
            })
            .join(", ")})`
      )
      .join(", ");

    let SQLcolumns: string[] = Object.keys(jsonData[0]).map((key) =>
      key.replace(/[^a-zA-Z0-9]/g, "_")
    );
    console.log("join: ", SQLcolumns.join(", "));
    const valsQuery = `(${SQLcolumns.join(", ")}) VALUES ${insertValues};`;
    return returnStr + " " + valsQuery;
  }

  function compileDB() {
    //empty DBObj
    startLoading();
    while (DBObj.length > 0) {
      DBObj.pop();
    }
    let tempArr = [...DBObj];
    let iniColumns: string[][] = [];
    let tblNames: string[] = [];
    for (const tbl in Tables) {
      TableService.getTblByName(Tables[tbl])
        .then((res) => {
          let tblRes = res as TableType;
          iniColumns[tbl] = tblRes.columns;
          tblNames[tbl] = tblRes.tableName;
          console.log("iniColumns arr:", iniColumns);
          TableService.getTblData(Tables[tbl])
            .then((res) => {
              tempArr.push({
                tblName: tblNames[tbl],
                data: createObjects(iniColumns[tbl], res as [][]),
              });
              if (tempArr.length == Tables.length) {
                console.log("compiling complete...", tempArr);
                stopLoading();
                setDBObj(tempArr);
                setDLWindow(true);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  useEffect(() => {
    if (DBObj.length === Tables.length && downloadWindow) {
      //for create
      console.log("str before ", sqlStr);
      DBObj.map((tbl) => {
        sqlStr += getCreateQuery(tbl.data as TableRow[], tbl.tblName) + "\n";
      });
      //for alter (foreign keys)
      const tableInfos = DBObj.map((tbl) => ({
        tableName: tbl.tblName,
        columns: Object.keys(tbl.data[0]),
      }));
      sqlStr += getAlterQuery(tableInfos) + "\n";
      //for insert
      DBObj.map((tbl) => {
        sqlStr += getInsertQuery(tbl.data as TableRow[], tbl.tblName) + "\n";
      });
      // console.log("str so far:", sqlStr);
      const finalStr =
        `CREATE DATABASE ${Database.replace(/ *\([^)]*\) */g, "")};` +
        "\n" +
        sqlStr;
      const sqlFile = new Blob([`${finalStr}`], {
        type: "text/plain;charset=utf-8",
      });
      const href = URL.createObjectURL(sqlFile);

      // create "a" HTML element with href to file & click
      const link = document.createElement("a");
      link.href = href;
      // const name = JSON.stringify(fileName)
      link.setAttribute("download", `${Database}.sql`); //or any other extension
      document.body.appendChild(link);
      link.click();

      // clean up "a" element & remove ObjectURL
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      setDLWindow(false);
    }
  }, [DBObj]);

  useEffect(() => {
    //if(dbId !== undefined){
    TableService.getTblByDB(dbId)
      .then((res) => {
        console.log("get res:", res);
        let tblResponse = res as TableType[];
        let tableArr = [...Tables];
        setDBName(tblResponse[0].database.databaseName);
        setUserID(tblResponse[0].database.user.userId);
        FirstColumns = tblResponse[0].columns;
        tblResponse.map((tbl, i) => {
          if (!tableArr.includes(tbl.tableName)) {
            tableArr.push(tbl.tableName);
          }
        });
        setTables(tableArr);
        setCurrentTbl(Tables[0]);
        setCurrentTblID(0);
        setColsData(createColumns(tblResponse[0].columns));
        if (Tables[0] !== undefined) {
          TableService.getTblData(Tables[0])
            .then((res) => {
              console.log("get tbl data res:", res);
              setTblData(createObjects(tblResponse[0].columns, res as [][]));
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
    //}
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTblID(newValue);
    setCurrentTbl(Tables[newValue]);
  };

  const handleExport = () => {
    compileDB();
  };

  const handleChooseForm = () => {
    console.log("Choose Forms");
    // should load the modal
    handleOpen();
  };

  const handleOpenReport = () => {
    console.log("Report modal should open");
    // should load the modal
    handleReportOpen();
  };

  const toggleImport = () => {
    // Implement this function if needed, or pass an empty function
    console.log("Toggle import");
  };

  useEffect(() => {
    if (Tables[currentTblID] !== undefined || Tables[currentTblID] !== null) {
      TableService.getTblByName(Tables[currentTblID])
        .then((res) => {
          let tblRes: TableType = res as TableType;
          setColsData(createColumns(tblRes.columns));

          TableService.getTblData(Tables[currentTblID]).then((res) => {
            setTblData(createObjects(tblRes.columns, res as [][]));
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [currentTbl]);

  function getTabProps(index: number) {
    return {
      id: `vertical-tab-${index}`,
      "aria-controls": `vertical-tabpanel-${index}`,
    };
  }

  useEffect(() => {
    if (Tables.length > 0) {
      TableService.getTblData(Tables[0])
        .then((res) => {
          console.log("get tbl data res:", res);
          setTblData(createObjects(FirstColumns, res as [][]));
          stopLoading();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [Tables]);
  useEffect(() => {
    console.log("current table is ", currentTbl);
  }, [currentTbl]);

  return (
    <>
      {tblData !== undefined ? (
        <>
          <Box sx={{ height: "85vh", margin: "1em", marginTop: "5em" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <h1 style={{ margin: 5 }}>{Database}</h1>
              {/* <div className="iconTab" onClick={handleExport} style={{ display: "flex", fontSize: "18px", alignSelf: "flex-end", cursor: "pointer", }}>EXPORT AS SQL</div> */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  onClick={handleExport}
                  variant="outlined"
                  sx={{ margin: "10px" }}
                >
                  EXPORT TO SQL
                </Button>
                <Button
                  onClick={handleChooseForm}
                  variant="outlined"
                  sx={{ margin: "10px" }}
                >
                  SELECT FORMS
                </Button>
                <Button
                  onClick={handleOpenReport}
                  variant="outlined"
                  sx={{ margin: "10px" }}
                >
                  CREATE REPORT
                </Button>
              </Box>
            </Box>
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                backgroundColor: "#BAD1BE",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  width: "20%",
                  display: "flex",
                  flexDirection: "column",
                  margin: ".5em",
                }}
              >
                <TextField
                  hiddenLabel
                  placeholder="Search Tables"
                  sx={{
                    border: "none",
                    "& fieldset": { border: "none" },
                    backgroundColor: "white",
                    borderRadius: 5,
                    marginBottom: ".3em",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {" "}
                        <SearchOutlinedIcon />{" "}
                      </InputAdornment>
                    ),
                    disableUnderline: true,
                  }}
                />
                <Box
                  sx={{
                    backgroundColor: "#347845",
                    padding: ".5em",
                    color: "white",
                  }}
                >
                  Tables
                </Box>
                <Tabs
                  orientation="vertical"
                  variant="scrollable"
                  value={currentTblID}
                  onChange={handleChange}
                  aria-label="Vertical tabs example"
                  sx={{
                    borderRight: 1,
                    borderColor: "divider",
                    backgroundColor: "white",
                    "& button.Mui-selected": { backgroundColor: "#91E09F" },
                    display: "flex",
                    justifyContent: "left",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  {Tables.map((tbl, i) => {
                    return (
                      <Tab
                        sx={{
                          alignItems: "flex-start",
                          textOverflow: "ellipsis",
                        }}
                        label={
                          <span
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              maxHeight: "30px",
                            }}
                          >
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                margin: "2px",
                              }}
                            >
                              <TblIcon />
                            </div>
                            <p
                              style={{
                                margin: "4px",
                                maxWidth: "265px",
                                fontSize: "14px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {tbl}
                            </p>
                          </span>
                        }
                        {...getTabProps(i)}
                      />
                    );
                  })}
                </Tabs>
              </Box>
              <Box
                sx={{
                  width: "80%",
                  display: "flex",
                  flexDirection: "column",
                  margin: ".5em",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#347845",
                    maxWidth: "40%",
                    padding: ".3em",
                    display: "flex",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  {currentTbl === "" || currentTbl === undefined
                    ? "Table"
                    : currentTbl}
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 0,
                  }}
                >
                  <Box
                    style={{
                      backgroundColor: "#347845",
                      width: "100%",
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {/* for table preview */}
                      {colsData.length > 0 && tblData.length > 0 ? (
                        <>
                          <Paper
                            elevation={0}
                            sx={{
                              maxHeight: "500px",
                              width: "100%",
                              margin: ".3em",
                              borderColor: "#347845",
                            }}
                          >
                            {/* //code for the table */}
                            <ReactDataGrid
                              idProperty="id"
                              style={{
                                width: "100%",
                                height: tblHeight,
                                maxHeight: 450,
                              }}
                              columns={colsData}
                              dataSource={tblData}
                              theme="green-light"
                            />
                          </Paper>
                        </>
                      ) : (
                        <>
                          <CircularProgress size="10rem" />
                        </>
                      )}
                    </div>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          <Button
            onClick={toggleChatbox}
            sx={{ position: "fixed", bottom: "20px", right: "20px" }}
          >
            {isChatboxOpen ? "Close Chat" : "Open Chat"}
          </Button>
          <Chatbox isOpen={isChatboxOpen} onClose={toggleChatbox} />

          {/*Modal for forms*/}
          <Modal
            open={formOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={{ display: "flex" }}>
              <Box sx={{ flexGrow: 1 }}>
                <FormPrompt
                  startLoading={startLoading}
                  headers={formHeaders}
                  onClose={() => {
                    handleClose();
                    // handleProcessingComplete();
                  }}
                  setProcessedHeaders={setProcessedHeaders}
                  setFormType={handleFormTypeChange}
                />
              </Box>
            </Box>
          </Modal>

          <Modal
            open={showDetailsForm}
            onClose={handleDetailsClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={{ display: "flex" }}>
              <Box sx={{ flexGrow: 1 }}>
                <FormDetailsPrompt
                  startLoading={startLoading}
                  stopLoading={stopLoading}
                  onClose={() => {
                    // handleClose();
                    // handleProcessingComplete();
                    handleDetailsClose();
                  }}
                  setFormName={setFormName}
                  dbName={Database}
                  tblName={currentTbl}
                  formType={formType}
                  processedHeaders={processedHeaders}
                  userId={userID}
                />
              </Box>
            </Box>
          </Modal>
          {/* <Modal
            open={showInsertForm}
            onClose={handleInsertFormClose}
            aria-labelledby="insert-form-modal-title"
            aria-describedby="insert-form-modal-description"
          >
            <Box sx={{ display: "flex" }}>
              <Box sx={{ flexGrow: 1 }}>
                <InsertFormPrompt
                  processedHeaders={processedHeaders}
                  handleClose={handleClose2}
                  tblName={currentTbl}
                />
              </Box>
            </Box>
          </Modal> */}

          {/*Modal for reports*/}
          <Modal
            open={reportOpen}
            onClose={handleReportClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={{ display: "flex" }}>
              <Box sx={{ flexGrow: 1 }}>
                <ReportPrompt
                  toggleImport={toggleImport}
                  startLoading={startLoading}
                  headers={formHeaders}
                  onClose={handleReportClose}
                  databaseName={Database} // Pass the database name
                  tableName={currentTbl} // Pass the table name
                  userID={userID} // Pass the User ID
                />
              </Box>
            </Box>
          </Modal>
          {isProcessing && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                zIndex: 9999,
              }}
            >
              <CircularProgress color="inherit" />
              <Typography
                variant="h6"
                style={{ color: "white", marginTop: "20px" }}
              >
                Processing...
              </Typography>
            </div>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
}
