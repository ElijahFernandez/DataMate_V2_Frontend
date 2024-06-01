import React, { useState, useEffect, useRef } from "react";
import trashBinImage from "../images/Trashbin.png";
import {
  Button,
  MenuItem,
  FormControl,
  Grid,
  Stack,
  IconButton,
  Link,
  CircularProgress,
} from "@mui/material";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FileService from "../api/FileService";
import { FileEntity, ResponseFile, User } from "../api/dataTypes";
import ImportFile from "../prompts/ImportFile";
import { useNavigate } from "react-router-dom";
import FileDetails from "./FileDetails";
import Navbar from "./Navbar";
import Topbar from "./Topbar";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import CryptoJS from "crypto-js";

type FileId = string;

//Importfile
type FileListProp = {
  setFileId: (num: number) => void;
};
const FileList: React.FC<FileListProp> = ({ setFileId }: FileListProp) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [files, setFiles] = useState<ResponseFile[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedMenuOption, setSelectedMenuOption] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<FileId | null>(null);
  const [anchorE2, setAnchorE2] = useState<null | HTMLElement>(null);
  const [selectedOptionPopMenu, setSelectedOptionPopMenu] = useState("All");
  const open = Boolean(anchorE2);
  const isPopoverOpen = Boolean(anchorEl);
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query
  const [searchResult, setSearchResult] = useState<ResponseFile[]>([]);
  const [currentSortOption, setCurrentSortOption] = useState("All");
  const [selectedFile, setSelectedFile] = useState<ResponseFile | null>(null);
  const [file, setFile] = useState<FileEntity | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const anchorRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const nav = useNavigate();

  // const itemsPerRow = Math.min(searchResult.length, 3); // Maximum 3 items per row
  const itemsPerRow = Math.min(files.length, 3);
  const lgValue = Math.floor(12 / itemsPerRow);
  const xlValue = Math.floor(12 / itemsPerRow);

  const handleClickFileName = (file: any) => {
    let id = file?.fileId;

    nav("/files/file", {
      state: {
        fileid: id,
      },
    });
  };

  const toggleUpload = () => {
    setShowUpload(!showUpload);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOptionSelectPop = (option: string, file: ResponseFile | null) => {
    setSelectedMenuOption(option);
    setSelectedFile(file);
    setIsOpen(!!file);
  };

  const openImportModal = () => {
    setIsImportModalOpen(true);
    document.body.style.overflow = "hidden"; // Prevent scrolling
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    document.body.style.overflow = "auto"; // Allow scrolling
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  //delete specific file
  const handleDelete = async (id: number) => {
    try {
      await FileService.deleteFile(id);
      setFiles((prevFiles) => prevFiles.filter((file) => file.fileId !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  //Sort by
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Sort your files function
  const handleOptionSelect = (option: string) => {
    setIsDropdownOpen(false);

    let sortedFiles = [...files];
    setSelectedOption(option);

    if (option === "Name") {
      sortedFiles.sort((a, b) => a.fileName.localeCompare(b.fileName));
    } else if (option === "Date") {
      sortedFiles.sort(
        (a, b) =>
          new Date(b.latestDateModified).getTime() -
          new Date(a.latestDateModified).getTime()
      );
    } else if (option === "Size") {
      sortedFiles.sort((a, b) => a.fileSize - b.fileSize);
    }

    setFiles(sortedFiles);
  };

  const handleClearfilter = () => {
    setSearchQuery("");
    setCurrentSortOption("All");
    setSelectedOption("All");

    const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "DefaultKey";
    const decryptedUserId = CryptoJS.AES.decrypt(
      userId,
      ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedUserId) {
      FileService.getFilesByUserId(decryptedUserId)
        .then((res) => {
          console.log(res);
          setFiles(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  //to fully get
  const handleIconButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const target = event.currentTarget;
    const fileId = target.dataset.fileId;

    if (fileId) {
      setAnchorEl(target);
      setSelectedFileId(fileId);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedFileId(null);
  };

  //smallscreen menu
  const handleOptionSelectPopMenu = (option: string) => {
    setSelectedOptionPopMenu(option);
    setAnchorE2(null);
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorE2(event.currentTarget);
  };

  const handlePopoverCloseE2 = () => {
    setAnchorE2(null);
  };

  //search funtion
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "DefaultKey";
    const decryptedUserId = CryptoJS.AES.decrypt(
      userId,
      ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);
    if (decryptedUserId) {
      setLoading(true);
      FileService.getFilesByUserId(decryptedUserId)
        .then((res) => {
          console.log(res);
          setFiles(res);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [userId]);

  useEffect(() => {
    setSearchResult(filteredFiles);
  }, [searchQuery, filteredFiles]);

  return (
    <Grid
      // paddingLeft={{ lg: 2, xl: 2 }}
      paddingX={{ xs: 5, sm: 5, lg: 10 }}
      style={{
        paddingTop: "5rem",
        width: "100%",
        // alignItems: "center",
        // display: "flex",
        flexDirection: "column",
      }}
    >
      <section style={{ marginTop: "50px" }}>
        <Grid
          maxWidth={{ lg: "95%", xl: "80%" }}
          marginX="auto"
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Grid
            padding={{ xs: "5px", sm: "5px", lg: "20px", xl: "20px" }}
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              borderRadius: "40px",
              height: "50px",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <SearchIcon style={{ fontSize: "24px", color: "gray" }} />

            <input
              style={{
                fontSize: "20px",
                border: "none",
                outline: "none",
                boxShadow: "none",
                paddingBottom: "5px",
              }}
              type="text"
              placeholder="Search"
              aria-label="Search"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </Grid>
          {isLargeScreen && (
            <IconButton
              style={{
                marginLeft: "24px",
                fontSize: "20px",
              }}
              onClick={openImportModal}
            >
              <AddCircleIcon
                style={{ height: "30", width: "30", color: "green" }}
              />
              <span style={{ color: "black", marginLeft: "12px" }}>New</span>
            </IconButton>
          )}
          {isImportModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              // onClick={closeImportModal}
            >
              <ImportFile
                toggleImport={closeImportModal}
                startLoading={() => {}}
                setFileId={setFileId}
              />
            </div>
          )}

          {isLargeScreen && (
            <Link underline="none" href="/files/deleted-files" color={"black"}>
              <IconButton
                style={{
                  marginLeft: "24px",
                  fontSize: "20px",
                }}
              >
                <img
                  src={trashBinImage}
                  alt="Bin"
                  style={{ width: "28px", height: "28px", marginRight: "12px" }}
                />
                <span style={{ color: "black" }}>Bin</span>
              </IconButton>
            </Link>
          )}
          {isLargeScreen && (
            <Link underline="none" href="/files/file-logs" color={"black"}>
              <IconButton
                style={{
                  marginLeft: "24px",
                  fontSize: "20px",
                }}
              >
                <span style={{ color: "black" }}>Activity Log</span>
              </IconButton>
            </Link>
          )}
          {isLargeScreen && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  color: "#000",
                  marginRight: "12px",
                  marginLeft: "15px",
                  fontSize: "20px",
                }}
              >
                Sort by:
              </span>
              <FormControl>
                <div
                  onClick={handleDropdownToggle}
                  style={{
                    background: "#71C887",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    width: "fit-content",
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      marginRight: "8px",
                    }}
                  >
                    {selectedOption}
                  </span>
                  <KeyboardArrowDownIcon
                    style={{ fontSize: "20px", color: "#fff" }}
                  />
                </div>
                {isDropdownOpen && (
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "4px",
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "8px",
                      padding: "8px",
                      fontSize: "20px",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <MenuItem
                      onClick={() => handleOptionSelect("All")}
                      style={{ cursor: "pointer", color: "#000" }}
                    >
                      All
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleOptionSelect("Name")}
                      style={{ cursor: "pointer", color: "#000" }}
                    >
                      Name
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleOptionSelect("Date")}
                      style={{ cursor: "pointer", color: "#000" }}
                    >
                      Date
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleOptionSelect("Size")}
                      style={{ cursor: "pointer", color: "#000" }}
                    >
                      Size
                    </MenuItem>
                  </div>
                )}
              </FormControl>
              <Button
                onClick={handleClearfilter}
                style={{
                  marginLeft: "24px",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  color: "red",
                  fontSize: "10px",
                }}
              >
                Clear Filter
              </Button>
            </div>
          )}

          <div style={{ textAlign: "left" }}>
            {window.innerWidth <= 768 && (
              <IconButton
                style={{
                  paddingLeft: "16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={handlePopoverOpen}
              >
                <MoreVertIcon
                  style={{ fill: "green", width: "1em", height: "1em" }}
                />
              </IconButton>
            )}
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverCloseE2}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <Stack
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Link underline="none" href="/" color={"black"}>
                  <IconButton
                    style={{
                      marginTop: "20px",
                      fontSize: "20px",
                    }}
                  >
                    <AddCircleIcon
                      style={{ height: "30", width: "30", color: "green" }}
                    />
                    <span style={{ color: "black", marginLeft: "12px" }}>
                      New
                    </span>
                  </IconButton>
                </Link>
                <IconButton
                  style={{
                    fontSize: "20px",
                  }}
                >
                  <img
                    src={trashBinImage}
                    alt="Bin"
                    style={{
                      width: "28px",
                      height: "28px",
                      marginRight: "12px",
                    }}
                  />
                  <span style={{ color: "black" }}>Bin</span>
                </IconButton>
                <Link underline="none" href="/" color={"black"}>
                  <IconButton
                    style={{
                      fontSize: "20px",
                    }}
                  >
                    <span style={{ color: "black" }}>Activity Log</span>
                  </IconButton>
                </Link>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      color: "#000",
                      marginRight: "12px",
                      marginLeft: "5px",
                      fontSize: "20px",
                    }}
                  >
                    Sort by:
                  </span>
                  <FormControl>
                    <div
                      onClick={handleDropdownToggle}
                      style={{
                        background: "#71C887",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 16px",
                        width: "fit-content",
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          marginRight: "8px",
                        }}
                      >
                        {selectedOption}
                      </span>
                      <KeyboardArrowDownIcon
                        style={{ fontSize: "20px", color: "#fff" }}
                      />
                    </div>
                    {isDropdownOpen && (
                      <div
                        style={{
                          background: "#fff",
                          borderRadius: "4px",
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          marginTop: "8px",
                          padding: "8px",
                          fontSize: "20px",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <MenuItem
                          onClick={() => handleOptionSelect("All")}
                          style={{ cursor: "pointer", color: "#000" }}
                        >
                          All
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleOptionSelect("Date")}
                          style={{ cursor: "pointer", color: "#000" }}
                        >
                          Date
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleOptionSelect("Size")}
                          style={{ cursor: "pointer", color: "#000" }}
                        >
                          z
                        </MenuItem>
                      </div>
                    )}
                  </FormControl>
                </div>
                <Button
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    color: "red",
                    fontSize: "10px",
                  }}
                >
                  Clear Filter
                </Button>
              </Stack>
            </Popover>
          </div>
        </Grid>
      </section>
      <section
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {isLoading ? (
          <>
            <CircularProgress size="10rem" color="success" />
          </>
        ) : files.length <= 0 ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            No files uploaded.
          </div>
        ) : (
          <Grid
            container
            spacing={{ sm: 3, md: 2, lg: -10, xl: -50 }}
            style={{ margin: "auto" }}
            paddingY={{ xs: 5, sm: 5, md: 5, lg: 5, xl: 5 }}
            paddingRight={{ xs: 2, sm: 2 }}
            justifyContent="text-start"
          >
            {searchResult.map((file) => (
              <Grid
                key={file.fileId}
                item
                // paddingLeft={2}
                xs={12}
                sm={6}
                md={4}
                lg={4}
                xl={xlValue}
                paddingBottom={2}
                // style={{
                //   display: "flex",
                //   flexDirection: "column",
                //   alignItems: "center",
                // }}
              >
                <Grid
                  maxWidth="100%"
                  width={{ xs: "full", sm: "full", lg: "320px" }}
                  paddingX={"20px"}
                  paddingY={{ lg: "10px" }}
                  style={{
                    backgroundColor: "#71C887",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ flex: "1" }}>
                      <div
                        key={file.fileId}
                        onClick={() => handleClickFileName(file)}
                      >
                        {file.fileName}
                      </div>
                    </div>
                    <IconButton
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onClick={handleIconButtonClick}
                      data-file-id={file.fileId}
                    >
                      <MoreHorizIcon
                        style={{ fill: "black", width: "1em", height: "1em" }}
                      />
                    </IconButton>

                    <Popover
                      open={
                        isPopoverOpen &&
                        String(selectedFileId) === String(file.fileId)
                      }
                      anchorEl={anchorEl}
                      onClose={handlePopoverClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                    >
                      <List>
                        <ListItem
                          button
                          onClick={() => {
                            console.log(
                              `Details option selected for fileId: ${file.fileId}`
                            );
                            handleOptionSelectPop("Details", file);
                          }}
                        >
                          <ListItemText primary="Details" />
                        </ListItem>

                        <FileDetails
                          open={isOpen}
                          anchorEl={anchorRef.current}
                          onClose={handleClose}
                          file={file}
                          user={
                            user || {
                              userId: 0,
                              firstName: "",
                              lastName: "",
                              email: "",
                              address: "",
                              username: "",
                              password: "",
                              businessName: "",
                              businessType: "",
                              userImage: null,
                            }
                          }
                        />

                        <ListItem
                          button
                          onClick={() => {
                            console.log(
                              `Delete option selected for fileId: ${file.fileId}`
                            );
                            handleDelete(file.fileId);
                          }}
                        >
                          <ListItemText primary="Delete" />
                        </ListItem>
                        {/* <ListItem
                        button
                        onClick={() => {
                          console.log(
                            `Open option selected for fileId: ${file.fileId}`
                          );
                          handleOptionSelectPop("open");
                        }}
                      >
                        <ListItemText primary="Open" />
                      </ListItem> */}
                      </List>
                    </Popover>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <div
                      key={file.fileId}
                      onClick={() => handleClickFileName(file)}
                    >
                      <img
                        src="https://www.cleverducks.com/wp-content/uploads/2018/01/Excel-Icon-1024x1024.png"
                        alt="Thumbnail preview of a Drive item"
                        style={{
                          width: "100%",
                          height: "200px",
                          paddingTop: "3px",
                          paddingBottom: "10px",
                          borderRadius: "8px",
                          display: "block",
                          margin: "0 auto",
                        }}
                      />
                    </div>
                  </div>
                </Grid>

                {/* <Grid
                style={{
                  marginTop: "0.5rem",
                  fontSize: "14px",
                  color: "#888",
                  fontStyle: "italic",
                }}
                // paddingLeft={
                //   searchResult.length <= 2
                //     ? { lg: "100px", xl: "100px" }
                //     : { lg: "50px", xl: "50px" }
                // }
                paddingLeft={{ xs: 6, sm: 5, md: 5, lg: 5 }}
              >
                Last Modified: {file.latestDateModified}
              </Grid> */}
              </Grid>
            ))}
          </Grid>
        )}
      </section>
      {searchResult.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {searchQuery && `No files found for "${searchQuery}"`}
        </div>
      )}
    </Grid>
  );
};

export default FileList;
