import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  MenuItem,
  FormControl,
  Grid,
  Stack,
  IconButton,
  Box,
  CircularProgress,
  Menu,
  Modal,
  Typography,
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
import formIcon from "../images/database-svgrepo-com (6).svg";

import { FormEntity, User } from "../api/dataTypes";

import { useNavigate, Link } from "react-router-dom";

// import Navbar from "./Navbar";
// import Topbar from "./Topbar";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import FormService from "../services/FormService";
import CryptoJS from "crypto-js";

type FormId = string;

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
  backdropFilter: "brightness(1.2)", // Make the background lighter
};
//Importfile
type FormListProp = {
  setFormId: (num: number) => void;
};
const FormList: React.FC<FormListProp> = ({ setFormId }: FormListProp) => {
  const [forms, setForms] = useState<FormEntity[]>([]);
  const [filteredForms, setFilteredForms] = useState<FormEntity[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All");
  const [selectedMenuOption, setSelectedMenuOption] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [anchorEl3, setAnchorEl3] = useState<HTMLElement | null>(null);

  const [selectedFormId, setSelectedFormId] = useState<FormId | null>(null);
  const [anchorE2, setAnchorE2] = useState<null | HTMLElement>(null);
  const [selectedOptionPopMenu, setSelectedOptionPopMenu] = useState("All");
  const open = Boolean(anchorE2);
  const open3 = Boolean(anchorEl3);

  const isPopoverOpen = Boolean(anchorEl);
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query
  const [searchResult, setSearchResult] = useState<FormEntity[]>([]);
  const [currentSortOption, setCurrentSortOption] = useState("All");
  const [selectedForm, setSelectedForm] = useState<FormEntity | null>(null);
  const [form, setForm] = useState<FormEntity | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const anchorRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const nav = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false); // State for controlling the modal visibility

  // const itemsPerRow = Math.min(searchResult.length, 3); // Maximum 3 items per row
  const itemsPerRow = Math.min(forms?.length, 3);
  const lgValue = Math.floor(12 / itemsPerRow);
  const xlValue = Math.floor(12 / itemsPerRow);

  const handleClickFormName = (form: FormEntity) => {
    return (
      <Link
        to={`/forms/${form.formId}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {form.formName}
      </Link>
    );
    // let id = form?.formId;
    // console.log(id);
    // nav("/forms/form", {
    //   state: {
    //     formid: id,
    //   },
    // });
  };

  const handleOptionSelectPop = (option: string, form: FormEntity | null) => {
    setSelectedMenuOption(option);
    setSelectedForm(form);
    setIsOpen(!!form);
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
    const FormId = target.dataset.FormId;

    if (FormId) {
      setAnchorEl(target);
      setSelectedFormId(FormId);
    }
  };

  const handleOnClickIcon = (event: React.MouseEvent<HTMLElement>) => {
    console.log("triple dot is pressed");
    setAnchorEl3(event.currentTarget); // Open menu on click
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedFormId(null);
  };

  //smallscreen menu

  //search funtion
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (forms && forms.length > 0) {
      console.log("form state ", forms);
      setFilteredForms(
        forms.filter((form) =>
          form.formName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [forms, searchQuery]);

  useEffect(() => {
    const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "DefaultKey";
    const decryptedUserId = CryptoJS.AES.decrypt(
      userId,
      ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);
    if (decryptedUserId) {
      FormService.getFormsByUser(decryptedUserId)
        .then((res) => {
          console.log(res);
          setForms(res);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [userId]);

  useEffect(() => {
    setSearchResult(filteredForms);
  }, [searchQuery, filteredForms]);

  //Sort by
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Sort your files function
  const handleOptionSelect = (option: string) => {
    setIsDropdownOpen(false);

    let sortedforms = [...forms];
    setSelectedOption(option);

    if (option === "Name") {
      sortedforms.sort((a, b) => a.formName.localeCompare(b.formName));
    }

    setForms(sortedforms);
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
      FormService.getFormsByUser(decryptedUserId)
        .then((res) => {
          console.log(res);
          setForm(res);
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

  // Close triple dot menu from
  const handleCloseMenu = () => {
    setAnchorEl3(null); // Close menu
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
          ) : forms.length <= 0 ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              No forms created.
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
              {searchResult.map((form) => (
                <Grid
                  key={form.formId}
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
                      {/* <div style={{ flex: "1" }}>
                        <div
                          key={form.formId}
                          onClick={() => handleClickFormName(form)}
                        >
                          {form.formName}
                        </div>
                      </div> */}
                      <div style={{ flex: "1" }}>
                        {/* Display form name */}
                        <div
                          onClick={() => handleClickFormName(form)}
                          // style={{ fontWeight: "bold" }}
                        >
                          {form.formName}
                        </div>
                        {/* Display form type below the form name */}
                        <div
                          style={{
                            color: "#555",
                            fontSize: "0.9em",
                            marginTop: "4px",
                          }}
                        >
                          {form.formType || "null"}
                        </div>
                      </div>

                      {/* Triple dot Icon Horizontal from each Form Instance */}
                      <IconButton
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={handleOnClickIcon}
                        data-file-id={form.formId}
                      >
                        <MoreHorizIcon
                          style={{
                            fill: "black",
                            width: "1em",
                            height: "1em",
                          }}
                        />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl3}
                        open={open3}
                        onClose={handleCloseMenu}
                      >
                        <MenuItem onClick={() => {
                          if(form.formId !== undefined) {
                            nav(`/forms/${form.formId}/edit`);
                          }
                        }}>Edit</MenuItem>
                        <MenuItem
                          onClick={() => {
                            setOpenModal(true);
                            handleCloseMenu();
                          }}
                        >
                          Delete
                        </MenuItem>
                      </Menu>

                      <Popover
                        open={
                          isPopoverOpen &&
                          String(selectedFormId) === String(form.formName)
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
                                `Details option selected for fileId: ${form.formId}`
                              );
                              handleOptionSelectPop("Details", form);
                            }}
                          >
                            <ListItemText primary="Details" />
                          </ListItem>

                          <ListItem
                            button
                            onClick={() => {
                              console.log(
                                `Delete option selected for fileId: ${form.formId}`
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
                    key={form.FormId}
                    onClick={() => handleClickFormName(form)}
                  >
                    <img
                      src={formIcon}
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
                        key={form.formId}
                        onClick={() => handleClickFormName(form)}
                      >
                        <Link
                          to={`/forms/${form.formId}`}
                          style={{ textDecoration: "none" }}
                        >
                          <img
                            src={formIcon}
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
                        </Link>
                      </div>
                    </div>
                  </Grid>

                  <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)} // Close the modal on backdrop click
                  >
                    {/* Modal for deletion */}
                    <Box sx={modalStyle}>
                      <Typography variant="h6" gutterBottom>
                        Are you sure you want to delete this form?
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 2,
                        }}
                      >
                        {/* Yes from Modal */}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={async () => {
                            try {
                              if (form.formId !== undefined) {
                                const response: string =
                                  await FormService.deleteForm(form.formId);
                                console.log(response); // Log the success message from the backend
                                setOpenModal(false); // Close modal after deletion
                                window.location.reload(); // Refresh the page
                              } else {
                                console.error("Form ID is undefined");
                              }
                              setOpenModal(false); // Close modal after deletion
                              window.location.reload(); // Refresh the page
                            } catch (error) {
                              console.error("Error deleting form:", error);
                              // You can handle the error (e.g., show a notification)
                            }
                          }}
                          sx={{ mr: 2 }}
                        >
                          Yes
                        </Button>
                        {/* No from Modal */}
                        <Button
                          variant="outlined"
                          onClick={() => setOpenModal(false)} // Close modal without deleting
                        >
                          No
                        </Button>
                      </Box>
                    </Box>
                  </Modal>
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

export default FormList;
