import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import SnackbarContextProvider from "./helpers/SnackbarContext";
import Topbar from "./components/Topbar";
import { ThemeProvider } from "@mui/material/styles";
import { PaletteColorOptions, createTheme } from "@mui/material/styles";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Modal,
  Typography,
} from "@mui/material";
import "./App.css";
import Home from "./components/Home";
import ImportFile from "./prompts/ImportFile";
import "./styles/SupportStyles.css";
import Filepage from "./pages/Filepage";
import SpecificTemplatePage from "./pages/SpecificTemplatePage";
import Navbar from "./components/Navbar";
import TemplatesPage from "./pages/TemplatesPage";
import FileScreenPage from "./pages/FileScreenPage";
import * as XLSX from "xlsx";
import TableDetectPrompt from "./prompts/TableDetectPrompt";
import SelectTablePrompt from "./prompts/SelectTablePrompt";
import NoTablesDetectPrompt from "./prompts/NoTablesDetectPrompt";
import EmptyDetectPrompt from "./prompts/EmptyDetectPrompt";
import InconsistentDetectPrompt from "./prompts/InconsistentDetectPrompt";
import SuccessPrompt from "./prompts/SuccessPrompt";
import ProcessingPage from "./pages/ProcessingPage";
import DeleteProfile from "./components/DeleteProfile";
import { Provider, useSelector } from "react-redux";
import { RootState, store } from "./helpers/Store";
import Login from "./components/Login";
import FileScreen from "./components/FileScreen";
import FilePage from "./pages/FileScreenPage";
import ConvertFilePage from "./pages/ConvertFilePage";
import DatabasePage from "./pages/DatabasePage";
import Registration from "./components/Registration";
import EditProfile from "./components/EditProfile";
import DeletedFiles from "./components/DeletedFiles";
import HomeInit from "./components/HomeInit";
import NormalizePrompt from "./prompts/NormalizePrompt";
import SpecificTemplatePageTwo from "./components/SpecificTemplatePageTwo";
import SpecificTemplatePageThree from "./components/SpecificTemplatePageThree";
import HomeInitial from "./pages/HomeInitial";
import TopbarInit from "./components/TopbarInit";
import ForgotPassword from "./components/ForgotPassword";
import PrivateRoute from "./components/PrivateRoute";
import DatabaseScreen from "./components/DatabaseScreen";
import Profile from "./components/Profile";
import FileLogs from "./components/FileLogs";
import VerifyCode from "./components/VerifyEmail";
import Snackbar from "./components/Snackbar";
import ResetPassword from "./components/ResetPassword";

// Here lies DataMate V2's increment // 

import ChooseDBPage from "./v2_components/ChooseDBPage";
import ChooseDBScreen from "./v2_components/ChooseDBScreen";
import GenerateForm from "./v2_components/GenerateFormPage";
import LocalForm from "./v2_components/LocalForm";
import ReportScreen from "./v2_components/ReportScreen";
import ReportPage from "./v2_components/ReportPage";
import FormScreen from "./v2_components/FormScreen";

/* Customize default MUI theme */
declare module "@mui/material/styles" {
  interface PaletteOptions {
    tertiary?: PaletteColorOptions;
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#0E9EA7",
      contrastText: "#fff",
    },
    secondary: {
      main: "#71C887",
      contrastText: "#fff",
    },
    tertiary: {
      main: "#DCF1EC",
      contrastText: "#374248",
    },
  },

  typography: {
    fontFamily: ["inter", "sans-serif"].join(","),
  },
});

function App() {
  //boolean state for sidebar
  const [open, setOpen] = useState(false);
  //boolean state for upload prompt
  const [showUpload, setShowUpload] = useState(false);
  //boolean state for page loading
  const [isLoading, setLoading] = useState(false);
  //boolean state for processing files
  const [isProcessing, setProcessing] = useState(false);
  //boolean state for tables detected prompt
  const [TableDetect, setTableDetect] = useState(false);
  //boolean state for select tables prompt
  const [SelectTable, setSelect] = useState(false);
  //boolean state for no tables detected prompt
  const [NoTableDetect, setNoTableDetect] = useState(false);
  //boolean state for empty values in tables prompt
  const [EmptyDetect, setEmptyDetect] = useState(false);
  //boolean state for empty values in tables prompt
  const [InconsistentDetect, setIncDetect] = useState(false);
  //boolean state for normalized prompt
  const [NormalizeTable, setNormTable] = useState(false);
  //boolean state for import success prompt
  const [ImportSuccess, setSuccess] = useState(false);
  //number state for the numbers of table found in an uploaded file
  const [tableCount, setTableCount] = useState(0);
  //number state for the id of the current file uploaded
  const [uploadedFileId, setUploadedFileId] = useState(0);
  //workbook state for the current uploaded file
  const [workbook, setWB] = useState<XLSX.WorkBook | null>();
  //string array state for the sheetnames of the current uploaded file
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  //string array for the sheetnames of the sheets that are valid tables of the uploaded file
  const [visibleSheetNames, setVSheets] = useState<string[]>([]);
  //string array for the sheetnames of the sheets that have empty values
  const [SheetsWithEmpty, setSWE] = useState<string[]>([]);
  //string array for the sheetnames of the sheets that have inconsistent values
  const [IncSheets, setIS] = useState<string[]>([]);
  //string array for the sheetnames of the sheets to be normalized
  const [normSheets, setNS] = useState<string[]>([]);
  //object state for the sheet data of the uploaded file
  const [sheetData, setSData] = useState<Object>({});
  //number state for the index of the sheet to be displayed in select table
  const [sheetIndex, setSIndex] = useState(0);

  // const handleDrawerOpen = () => {
  //   setOpen(true);
  // };

  const toggleDrawerOpen = () => {
    setOpen(!open);
  };

  const toggleUpload = () => {
    setShowUpload(!showUpload);
  };

  const toggleTableDetect = (status: boolean) => {
    setTableDetect(status);
  };

  const toggleNoTableDetect = (status: boolean) => {
    setNoTableDetect(status);
  };

  const toggleEmptyDetect = (status: boolean) => {
    setEmptyDetect(status);
  };

  const toggleInconsistent = (status: boolean) => {
    setIncDetect(status);
  };

  const toggleImportSuccess = (status: boolean) => {
    setSuccess(status);
  };

  const toggleSelect = (status: boolean, sheetIndex: number) => {
    setSIndex(sheetIndex);
    setSelect(status);
  };

  const toggleNormalized = (status: boolean, fileId: number) => {
    setNormTable(status);
    setFileId(fileId);
  };

  const StartLoading = () => {
    setLoading(true);
  };

  const StopLoading = () => {
    setLoading(false);
  };

  // const handleDrawerClose = () => {
  //   setOpen(false);
  // };

  const StartProcessing = () => {
    setProcessing(true);
  };

  const StopProcessing = () => {
    setProcessing(false);
  };

  const setTblCount = (count: number) => {
    setTableCount(count);
  };

  const setFileId = (id: number) => {
    setUploadedFileId(id);
  };

  const setDatabaseId = (id: number) => {
    setUploadedFileId(id);
  };

  const [selectedReportId, setSelectedReportId] = useState(0); // Initialize to 0 or any appropriate default value
  const setReportId = (id: number) => {
    setSelectedReportId(id);
  };

  const [selectedFormId, setSelectedFormId] = useState(0); // Initialize to 0 or any appropriate default value
  const setFormId = (id: number) => {
    setSelectedFormId(id);
  };

  const setFileData = (
    wb: XLSX.WorkBook | null,
    sheets: string[],
    vsheets: string[],
    sheetdata: object
  ) => {
    setWB(wb);
    setSheetNames(sheets);
    setVSheets(vsheets);
    setSData(sheetdata);
  };

  const updateEmptyList = (sheet: string) => {
    SheetsWithEmpty.push(sheet);
  };

  const updateIncList = (sheet: string) => {
    IncSheets.push(sheet);
  };

  const updateNormList = (sheet: string) => {
    normSheets.push(sheet);
  };

  const updateSheetData = (sheet: Object) => {
    setSData(sheet);
  };

  const updateWorkbook = (workbook: XLSX.WorkBook) => {
    setWB(workbook);
  };

  const resetVariables = () => {
    setSWE([]);
    setIS([]);
    setNS([]);
    setTableDetect(false);
    setIncDetect(false);
    setNoTableDetect(false);
  };

  useEffect(() => {
    resetVariables();
  }, []);

  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarContextProvider>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
            open={isLoading}
          >
            <CircularProgress color="success" />
          </Backdrop>
          <Router>
            <Modal open={open} onClose={toggleDrawerOpen}>
              <Navbar open={open} handleDrawerClose={toggleDrawerOpen} />
            </Modal>
            {isLoggedIn ? (
              <Topbar open={open} handleDrawerOpen={toggleDrawerOpen} />
            ) : (
              <TopbarInit />
            )}-
            <Box sx={{ display: "flex" }}>
              <Box sx={{ flexGrow: 1 }}>
                <Routes>
                  {/* Add your routes here */}
                  <Route path="/">
                    <Route
                      index
                      element={
                        <>
                          <Modal open={showUpload} onClose={toggleUpload}>
                            <div>
                              <ImportFile
                                toggleImport={toggleUpload}
                                startLoading={StartLoading}
                                setFileId={setFileId}
                              />
                            </div>
                          </Modal>
                          <Box>
                            <div>
                              <div>
                                <Home toggleImport={toggleUpload} />
                              </div>
                            </div>
                          </Box>
                        </>
                      }
                    />
                  </Route>
                  <Route
                    path="/processing"
                    element={
                      <>
                        <Backdrop
                          sx={{
                            color: "#FFFFFF",
                            zIndex: (theme) => theme.zIndex.modal - 1,
                            marginTop: "4rem",
                            position: "fixed",
                            width: "100%",
                            height: "100%",
                          }}
                          open={isProcessing}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <CircularProgress size="10rem" color="success" />
                            <h1>Processing data...</h1>
                          </div>
                        </Backdrop>

                        {
                          //modal for detect tables here
                        }
                        <Modal
                          open={TableDetect}
                          // onClose={() => {
                          //   toggleTableDetect(false);
                          // }}
                        >
                          <div>
                            <TableDetectPrompt
                              startLoading={StartLoading}
                              stopLoading={StopLoading}
                              toggleTableDetect={toggleTableDetect}
                              toggleSelect={toggleSelect}
                              toggleEmptyDetect={toggleEmptyDetect}
                              toggleInconsistentDetect={toggleInconsistent}
                              toggleImportSuccess={toggleImportSuccess}
                              tblCount={tableCount}
                              fileId={uploadedFileId}
                              vsheets={visibleSheetNames}
                              sheetdata={sheetData}
                              updateEmpty={updateEmptyList}
                              updateInc={updateIncList}
                              updateSData={updateSheetData}
                              emptySheets={SheetsWithEmpty}
                              incSheets={IncSheets}
                              reset={resetVariables}
                              wb={workbook}
                            />
                          </div>
                        </Modal>

                        {
                          //modal for select tables here
                        }
                        <Modal
                          open={SelectTable}
                          // onClose={() => {
                          //   toggleSelect(false, 0);
                          // }}
                        >
                          <div>
                            <SelectTablePrompt
                              startLoading={StartLoading}
                              stopLoading={StopLoading}
                              toggleSelect={toggleSelect}
                              toggleTableDetect={toggleTableDetect}
                              toggleEmptyDetect={toggleEmptyDetect}
                              toggleInconsistentDetect={toggleInconsistent}
                              toggleImportSuccess={toggleImportSuccess}
                              tblCount={tableCount}
                              fileId={uploadedFileId}
                              vsheets={visibleSheetNames}
                              sheetdata={sheetData}
                              updateEmpty={updateEmptyList}
                              updateInc={updateIncList}
                              updateSData={updateSheetData}
                              emptySheets={SheetsWithEmpty}
                              incSheets={IncSheets}
                              reset={resetVariables}
                              wb={workbook}
                              sheetIndex={sheetIndex}
                              updateNorm={updateNormList}
                            />
                          </div>
                        </Modal>

                        {/* modal for no tables detected here  */}
                        <Modal
                          open={NoTableDetect}
                          // onClose={toggleNoTableDetect}
                        >
                          <div>
                            <NoTablesDetectPrompt
                              startLoading={StartLoading}
                              stopLoading={StopLoading}
                              toggleNoTable={toggleUpload}
                              fileId={uploadedFileId}
                              reset={resetVariables}
                            />
                          </div>
                        </Modal>

                        <Modal
                          open={EmptyDetect}
                          // onClose={() => {
                          //   resetVariables();
                          //   toggleEmptyDetect(false);
                          // }}
                        >
                          <div>
                            <EmptyDetectPrompt
                              startLoading={StartLoading}
                              stopLoading={StopLoading}
                              toggleEmptyDetect={toggleEmptyDetect}
                              toggleInconsistentDetect={toggleInconsistent}
                              toggleImportSuccess={toggleImportSuccess}
                              fileId={uploadedFileId}
                              workbook={workbook}
                              sheets={sheetNames}
                              vsheets={visibleSheetNames}
                              sheetdata={sheetData}
                              emptylist={SheetsWithEmpty}
                              reset={resetVariables}
                              inclist={IncSheets}
                              updateSData={updateSheetData}
                            />
                          </div>
                        </Modal>

                        <Modal
                          open={InconsistentDetect}
                          // onClose={() => {
                          //   resetVariables();
                          //   toggleInconsistent(false);
                          // }}
                        >
                          <div>
                            <InconsistentDetectPrompt
                              startLoading={StartLoading}
                              stopLoading={StopLoading}
                              toggleInconsistentDetect={toggleInconsistent}
                              toggleImportSuccess={toggleImportSuccess}
                              fileId={uploadedFileId}
                              workbook={workbook}
                              sheets={sheetNames}
                              vsheets={visibleSheetNames}
                              sheetdata={sheetData}
                              reset={resetVariables}
                              inclist={IncSheets}
                              updateSData={updateSheetData}
                            />
                          </div>
                        </Modal>

                        <Modal
                          open={ImportSuccess}
                          // onClose={() => {
                          //   toggleImportSuccess(false);
                          // }}
                        >
                          <div>
                            <SuccessPrompt
                              startLoading={StartLoading}
                              stopLoading={StopLoading}
                              toggleImportSuccess={toggleImportSuccess}
                              fileId={uploadedFileId}
                              reset={resetVariables}
                              workbook={workbook}
                              sdata={sheetData}
                            />
                          </div>
                        </Modal>

                        <ProcessingPage
                          stopLoading={StopLoading}
                          startProcessing={StartProcessing}
                          toggleTable={toggleTableDetect}
                          toggleNoTable={toggleNoTableDetect}
                          setTblCount={setTblCount}
                          setFileData={setFileData}
                          reset={resetVariables}
                        />
                      </>
                    }
                  />
                  <Route
                    path="/convert"
                    element={
                      <PrivateRoute>
                      <>
                      {/* modal for normalize tables here  */}
                      <Modal open={NormalizeTable} onClose={()=>{
                        toggleNormalized(false, -1);
                      }}>
                      <div>
                        <NormalizePrompt
                          toggleNormalized={toggleNormalized}
                          fileId={uploadedFileId}
                          reset={resetVariables}
                          normList={normSheets}
                          startLoading={StartLoading}
                        />
                      </div>
                      </Modal>
                      <ConvertFilePage 
                      startLoading={StartLoading}
                      updateNorm={updateNormList}
                      normSheets={normSheets}
                      toggleNormalized={toggleNormalized} />
                      </>
                      </PrivateRoute> 
                      }
                  />
                  {/* nested for Templates */}
                  <Route path="templates"> {/* parent url | localhost:3000/templates*/}
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <TemplatesPage />
                        </PrivateRoute>
                      }
                    />
                    <Route path="1">  {/* child url | localhost:3000/templates/1 */}
                      <Route
                        index
                        element={
                          <Box sx={{ padding: "1px" }}>
                            <SpecificTemplatePage />
                          </Box>
                        }
                      />
                    </Route>
                    <Route path="2"> {/* child url | localhost:3000/templates/2 */}
                      <Route
                        index
                        element={
                          <Box sx={{ padding: "1px" }}>
                            <SpecificTemplatePageTwo />
                          </Box>
                        }
                      />
                    </Route>
                    <Route path="3"> {/* child url | localhost:3000/templates/3 */}
                      <Route
                        index
                        element={
                          <Box sx={{ padding: "1px" }}>
                            <SpecificTemplatePageThree />
                          </Box>
                        }
                      />
                    </Route>
                  </Route>
                  {/* nested for Files */}
                  <Route path="files"> {/* parent url | localhost:3000/files */}
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <FileScreenPage setFileId={setFileId} />
                        </PrivateRoute>
                      }
                    />
                     {/* child url | localhost:3000/file */}
                    <Route
                      path="file"
                      element={
                        <PrivateRoute>
                          <Filepage startLoading={StartLoading} stopLoading={StopLoading} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="file-logs"
                      element={
                        <PrivateRoute>
                          <FileLogs />
                        </PrivateRoute>
                      }
                    />{" "}
                    <Route path="deleted-files" element={<DeletedFiles />} />
                  </Route>
                  {/* nested for Databases */}
                  <Route path="databases">  {/* parent url | localhost:3000/databases */}
                    {" "}
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <DatabaseScreen setDatabaseId={setDatabaseId} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="database"
                      element={
                        <PrivateRoute>
                          <DatabasePage startLoading={StartLoading} stopLoading={StopLoading} />
                        </PrivateRoute>
                      }
                    />
                  </Route>


                  
                  <Route
                    path="/files"
                    element={
                      isLoggedIn ? (
                        <FileScreenPage setFileId={setFileId} />
                      ) : (
                        <Navigate to="/login" replace={true} />
                      )
                    }
                  />
                  <Route
                    path="/database"
                    element={<DatabasePage startLoading={StartLoading} stopLoading={StopLoading} />}
                  />
                  <Route path="/databases" element={<DatabaseScreen setDatabaseId={setDatabaseId} />} />
                  <Route path="/delete-profile/" element={<DeleteProfile />} />
                  <Route path="/deleted-files" element={<DeletedFiles />} />
                  <Route
                    path="/edit-profile"
                    element={
                      <PrivateRoute>
                        <EditProfile />
                      </PrivateRoute>
                    }
                  ></Route>














                  {/* ----------Here lies Datamate V2 Increment-------------- */}
                  {/* nested for Databases */}
                  <Route path="generateforms">  {/* parent url | localhost:3000/databases */}
                    {" "}
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <ChooseDBScreen setDatabaseId={setDatabaseId} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="generateform"
                      element={
                        <PrivateRoute>
                          <ChooseDBPage startLoading={StartLoading} stopLoading={StopLoading} />
                        </PrivateRoute>
                      }
                    />
                  </Route>

                  {/* nested for localform */}
                  <Route path="localforms">  {/* parent url | localhost:3000/databases */}
                    {" "}
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <ChooseDBScreen setDatabaseId={setDatabaseId} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="localform_1"
                      element={
                        <PrivateRoute>
                          <ChooseDBPage startLoading={StartLoading} stopLoading={StopLoading} />
                        </PrivateRoute>
                      }
                    />
                  </Route>

                  
                  
                  <Route
                    path="/files"
                    element={
                      isLoggedIn ? (
                        <FileScreenPage setFileId={setFileId} />
                      ) : (
                        <Navigate to="/login" replace={true} />
                      )
                    }
                  />
                  <Route
                    path="/database"
                    element={<ChooseDBPage startLoading={StartLoading} stopLoading={StopLoading} />}
                  />
                  <Route path="/generateforms" element={<ChooseDBScreen setDatabaseId={setDatabaseId} />} />
                  <Route path="/delete-profile/" element={<DeleteProfile />} />
                  <Route path="/deleted-files" element={<DeletedFiles />} />
                  <Route
                    path="/edit-profile"
                    element={
                      <PrivateRoute>
                        <EditProfile />
                      </PrivateRoute>
                    }
                  ></Route>

                  {/* GEN FORMS */}
                  {/* nested for genformspage */}
                  <Route path="aiform"> {/* parent url | localhost:3000/aiform*/}
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <GenerateForm />
                        </PrivateRoute>
                      }
                    />
                  </Route>

                  <Route path="localform"> {/* parent url | localhost:3000/localform*/}
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <LocalForm />
                        </PrivateRoute>
                      }
                    />
                  </Route>

                  {/* nested for Reports */}
                  <Route path="reports">  {/* parent url | localhost:3000/reports */}
                    {" "}
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <ReportScreen setReportId={setReportId} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="report"
                      element={
                        <PrivateRoute>
                          <ReportPage startLoading={StartLoading} stopLoading={StopLoading} />
                        </PrivateRoute>
                      }
                    />
                  </Route>

                  {/* nested for Forms */}
                  <Route path="forms">  {/* parent url | localhost:3000/reports */}
                    {" "}
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <FormScreen setFormId={setFormId} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="form"
                      element={
                        <PrivateRoute>
                          <ReportPage startLoading={StartLoading} stopLoading={StopLoading} />
                        </PrivateRoute>
                      }
                    />
                  </Route>
                  {/* -----------------DataMate end------------------ */}













                  {/* nested for Profile  */}
                  <Route path="profile">
                    <Route
                      index
                      element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="edit-profile"
                      element={
                        <PrivateRoute>
                          <EditProfile />
                        </PrivateRoute>
                      }
                    ></Route>

                    <Route
                      path="delete-profile"
                      element={
                        <PrivateRoute>
                          <DeleteProfile />
                        </PrivateRoute>
                      }
                    />
                  </Route>
                  {/* nested for forgot pass */}
                  <Route path="forgot-password">
                    <Route index element={<ForgotPassword />} />
                    <Route path="verify-code" element={<VerifyCode />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                  </Route>
                  {/* Public pages */}
                  <Route
                    path="/login"
                    element={isLoggedIn ? <Navigate to="/" /> : <Login startLoading={StartLoading}
                    stopLoading={StopLoading}/>}
                  />
                  <Route
                    path="/registration"
                    element={<Registration startLoading={StartLoading}
                    stopLoading={StopLoading} />}
                  ></Route>
                </Routes>
              </Box>
            </Box>
          </Router>
          <Snackbar />
        </SnackbarContextProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
