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
  Box,
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
import DatabaseIcon from "../images/database-svgrepo-com (6).svg";

import { DatabaseEntity, User } from "../api/dataTypes";

import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Topbar from "./Topbar";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import DatabaseService from "../services/DatabaseService";
import CryptoJS from "crypto-js";

type DatabaseId = string;

//Importfile
type DatabaseListProp = {
  setDatabaseId: (num: number) => void;
};
const DatabaseList: React.FC<DatabaseListProp> = ({
  setDatabaseId,
}: DatabaseListProp) => {
  const [databases, setDatabases] = useState<DatabaseEntity[]>([]);
  const [filteredDBs, setFilteredDBs] = useState<DatabaseEntity[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedMenuOption, setSelectedMenuOption] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedDatabaseId, setSelectedDatabaseId] =
    useState<DatabaseId | null>(null);
  const [anchorE2, setAnchorE2] = useState<null | HTMLElement>(null);
  const [selectedOptionPopMenu, setSelectedOptionPopMenu] = useState("All");
  const open = Boolean(anchorE2);
  const isPopoverOpen = Boolean(anchorEl);
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query
  const [searchResult, setSearchResult] = useState<DatabaseEntity[]>([]);
  const [currentSortOption, setCurrentSortOption] = useState("All");
  const [selectedDatabase, setSelectedDatabase] =
    useState<DatabaseEntity | null>(null);
  const [database, setDatabase] = useState<DatabaseEntity | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const anchorRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const nav = useNavigate();
  const [isLoading, setLoading] = useState(true);

  // const itemsPerRow = Math.min(searchResult.length, 3); // Maximum 3 items per row
  const itemsPerRow = Math.min(databases?.length, 3);
  const lgValue = Math.floor(12 / itemsPerRow);
  const xlValue = Math.floor(12 / itemsPerRow);

  const handleClickDatabaseName = (db: DatabaseEntity) => {
    let id = db?.databaseId;
    console.log(id);
    nav("/databases/database", {
      state: {
        dbid: id,
      },
    });
  };

  const handleOptionSelectPop = (option: string, db: DatabaseEntity | null) => {
    setSelectedMenuOption(option);
    setSelectedDatabase(db);
    setIsOpen(!!db);
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

  //to fully get
  const handleIconButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const target = event.currentTarget;
    const databaseId = target.dataset.databaseId;

    if (databaseId) {
      setAnchorEl(target);
      setSelectedDatabaseId(databaseId);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedDatabaseId(null);
  };

  //smallscreen menu

  //search funtion
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (databases && databases.length > 0) {
      console.log("db state ", databases);
      setFilteredDBs(
        databases.filter((db) =>
          db.databaseName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [databases, searchQuery]);

  useEffect(() => {
    const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "DefaultKey";
    const decryptedUserId = CryptoJS.AES.decrypt(
      userId,
      ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);
    if (decryptedUserId) {
      DatabaseService.getDBsByUser(decryptedUserId)
        .then((res) => {
          console.log(res);
          setDatabases(res);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [userId]);

  useEffect(() => {
    setSearchResult(filteredDBs);
  }, [searchQuery, filteredDBs]);

  //Sort by
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Sort your files function
  const handleOptionSelect = (option: string) => {
    setIsDropdownOpen(false);

    let sortedDatabases = [...databases];
    setSelectedOption(option);

    if (option === "Name") {
      sortedDatabases.sort((a, b) =>
        a.databaseName.localeCompare(b.databaseName)
      );
    }

    setDatabases(sortedDatabases);
  };

  const openImportModal = () => {
    setIsImportModalOpen(true);
    document.body.style.overflow = "hidden"; // Prevent scrolling
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    document.body.style.overflow = "auto"; // Allow scrolling
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
      setLoading(true);
      DatabaseService.getDBsByUser(decryptedUserId)
        .then((res) => {
          console.log(res);
          setDatabase(res);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorE2(event.currentTarget);
  };

  const handlePopoverCloseE2 = () => {
    setAnchorE2(null);
  };
  return (
    <>
        <Grid
          paddingX={{ xs: 5, sm: 5, lg: 10 }}
          style={{
            paddingTop: "5rem",
            width: "100%",
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

              {/* {isLargeScreen && (
                <Link underline="none" href="/deleted-files" color={"black"}>
                  <IconButton
                    style={{
                      marginLeft: "24px",
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
                </Link>
              )} */}
              {/* {isLargeScreen && (
                <Link underline="none" href="/" color={"black"}>
                  <IconButton
                    style={{
                      marginLeft: "24px",
                      fontSize: "20px",
                    }}
                  >
                    <span style={{ color: "black" }}>Activity Log</span>
                  </IconButton>
                </Link>
              )} */}
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
                    {/* <IconButton
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
                    </IconButton> */}
                    {/* <Link underline="none" href="/" color={"black"}>
                      <IconButton
                        style={{
                          fontSize: "20px",
                        }}
                      >
                        <span style={{ color: "black" }}>Activity Log</span>
                      </IconButton>
                    </Link> */}
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
            ) : databases.length <= 0 ? (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                No databases created.
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
                {searchResult.map((database) => (
                  <Grid
                    key={database.databaseId}
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    xl={xlValue}
                    paddingBottom={2}
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
                            key={database.databaseId}
                            onClick={() => handleClickDatabaseName(database)}
                          >
                            {database.databaseName}
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
                          data-file-id={database.databaseId}
                        >
                          <MoreHorizIcon
                            style={{
                              fill: "black",
                              width: "1em",
                              height: "1em",
                            }}
                          />
                        </IconButton>

                        <Popover
                          open={
                            isPopoverOpen &&
                            String(selectedDatabaseId) ===
                              String(database.databaseName)
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
                                  `Details option selected for fileId: ${database.databaseId}`
                                );
                                handleOptionSelectPop("Details", database);
                              }}
                            >
                              <ListItemText primary="Details" />
                            </ListItem>

                            <ListItem
                              button
                              onClick={() => {
                                console.log(
                                  `Delete option selected for fileId: ${database.databaseId}`
                                );
                              }}
                            >
                              <ListItemText primary="Delete" />
                            </ListItem>
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
                        {/* <div
                    key={database.databaseId}
                    onClick={() => handleClickDatabaseName(database)}
                  >
                    <img
                      src={DatabaseIcon}
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
                  </div> */}
                        <div
                          key={database.databaseId}
                          onClick={() => handleClickDatabaseName(database)}
                        >
                          <img
                            src={DatabaseIcon}
                            alt="Thumbnail preview of a Drive item"
                            style={{
                              width: "100%",
                              height: "150px",
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

                    <Grid
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
                      {/* Last Modified: {file.latestDateModified} */}
                    </Grid>
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

    </>
  );
};

export default DatabaseList;
