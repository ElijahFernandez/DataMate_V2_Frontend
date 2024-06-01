import { Box, Button, FormControl, Grid, IconButton, InputAdornment, Menu, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";
import FileLogsService from "../api/FileLogsService";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";
import { FileActivityLogEntity } from "../api/dataTypes";
import CryptoJS from 'crypto-js';


export default function FileLogs(){

    const [isLabelShrunk, setIsLabelShrunk] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string>("None");
    const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
    const nav = useNavigate();
    const [timelineData, setTimelineData] = useState<FileActivityLogEntity[]>([]);
    const userId = useSelector((state: RootState) => state.auth.userId);

    // format the date to display the month as a word
    const formatDate = (timestamp:any) => {
        const date = new Date(timestamp);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    // for grouping the logs basd on dates
    const groupTimelineDataByDate = (data:any) => {
        const groups = [];
        let currentDate = null;

        for (const item of data) {
            const itemDate = formatDate(item.timestamp);
            
            if (itemDate !== currentDate) {
                groups.push({
                    header: itemDate,
                    entries: [item],
                });
                currentDate = itemDate;
            } else {
                groups[groups.length - 1].entries.push(item);
            }
        }
        
        return groups;
    };

    useEffect(() => {
    const fetchLogs = async () => {
        const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';
        const decryptedUserId = CryptoJS.AES.decrypt(userId, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        
        try {
            const logs = await FileLogsService.getFileActivityLogsByUserId(decryptedUserId);
            setTimelineData(logs);
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    fetchLogs();
    }, [userId]);

    const groupedTimelineData = groupTimelineDataByDate(timelineData);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchor(event.currentTarget);
      };
    
      const handleMenuClose = () => {
        setMenuAnchor(null);
      };

    const handleTextFieldFocus = () => {
    setIsLabelShrunk(true);
    };

    const handleTextFieldBlur = (event: any) => {
    if (!event.target.value) {
        setIsLabelShrunk(false);
    }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleDropdownToggle = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleDropdownClose = () => {
        setIsDropdownOpen(false);
    };

    const handleClearFilter = () => {
        setSearchQuery("");
        setSortBy("None");
        setSelectedOption("None");
    };
    

    const theme = useTheme();
    const isNotXsScreen = useMediaQuery(theme.breakpoints.up("md"));

    const filteredTimelineData = timelineData.filter((item) =>
        item.activity.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [sortBy, setSortBy] = useState<string>("Newest");
    const sortedGroupedTimelineData = [...groupedTimelineData].sort((a, b) => {
        const dateA = new Date(a.header).getTime();
        const dateB = new Date(b.header).getTime();
    
        if (sortBy === "Newest") {
            return dateA - dateB;
        } else if (sortBy === "Oldest") {
            return dateB - dateA;
        } else {
            return 0;
        }
    });
        

    const handleSortOptionSelect = (option: string) => {
        if (option === "None") {
          setSortBy("Newest");
          setSelectedOption("Newest");
        } else {
          setSortBy(option);
          setSelectedOption(option);
        }
      };

    
     return(
        <div>
            <Box sx={{mx: {xs: 1, sm: 5, md: 7}}}>
                <section>
                    <Stack direction="row" mt={13}>
                        <ArrowBackIosNewIcon sx={{ fontSize: '25px', color: '#374248', cursor: 'pointer', mr: 2, mt: .6 }} onClick={() => { nav('/files'); }}/>
                        <Typography variant="h5" fontWeight="bold" color="#374248">
                            Files Activity Log
                        </Typography>
                    </Stack>

                    
                    <Grid container direction="row" justifyContent="center" alignItems="center">
                        <Grid item mt={5} xs={5}>
                            <TextField
                                id="outlined-search"
                                label="Search"
                                type="search"
                                variant="outlined"
                                InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                    <SearchOutlinedIcon />
                                    </InputAdornment>
                                ),
                                }}
                                InputLabelProps={{
                                shrink: isLabelShrunk,
                                sx: { ml: isLabelShrunk ? 0 : 4 },
                                }}
                                onFocus={handleTextFieldFocus}
                                onBlur={handleTextFieldBlur}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                sx={{
                                    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.3)",
                                    borderRadius: "20px",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    width: {xs: 300, sm: 400, md: 500},
                                }}
                            />
                        </Grid>
                        <Grid item xs={3}> </Grid>
                        
                        {isNotXsScreen ? (
                        <Grid item mt={5} xs>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <Box sx={{ ml: {xs: '15px', sm: '20px', md: '25px'}}}>
                                    <span
                                        style={{
                                        color: "#374248",
                                        marginRight: "12px",
                                        fontSize: "20px",
                                        }}
                                    >
                                        Sort by:
                                    </span>
                                </Box>
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
                                        style={{ cursor: "pointer", color: "#000" }}
                                        onClick={() => {
                                            handleSortOptionSelect("Newest");
                                            handleDropdownClose();
                                          }}
                                        >
                                        Newest
                                        </MenuItem>
                                        <MenuItem
                                        style={{ cursor: "pointer", color: "#000" }}
                                        onClick={() => {
                                            handleSortOptionSelect("Oldest");
                                            handleDropdownClose();
                                          }}
                                        >
                                        Oldest
                                        </MenuItem>
                                    </div>
                                    )}
                                </FormControl>
                                <Button
                                    onClick={handleClearFilter}
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
                        </Grid>
                        ) :(
                            <Box mt={1}>
                                <IconButton onClick={handleMenuClick} sx={{ mt: 5, ml: {xs: 8, sm: 11}}}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                anchorEl={menuAnchor}
                                open={Boolean(menuAnchor)}
                                onClose={handleMenuClose}
                                >

                                    <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                                        <Stack justifyContent="center" alignItems={isDropdownOpen ? 'flex-start' : 'center'}>
                                            <MenuItem>
                                                <span
                                                    style={{
                                                    color: "#374248",
                                                    marginRight: "12px",
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
                                                        style={{ cursor: "pointer", color: "#374248" }}
                                                        onClick={() => {
                                                            handleSortOptionSelect("Newest");
                                                            handleDropdownClose();
                                                        }}
                                                        >
                                                        Newest
                                                        </MenuItem>
                                                        <MenuItem
                                                        style={{ cursor: "pointer", color: "#374248" }}
                                                        onClick={() => {
                                                            handleSortOptionSelect("Oldest");
                                                            handleDropdownClose();
                                                        }}
                                                        >
                                                        Oldest
                                                        </MenuItem>
                                                    </div>
                                                    )}
                                                </FormControl>
                                            </MenuItem>
                                            <MenuItem >
                                                <Button
                                                    onClick={handleClearFilter}
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
                                            </MenuItem>
                                        </Stack>
                                    </div>

                                </Menu>
                            </Box>
                        )}
                    </Grid>
                </section>

                <section>
                    <Box sx={{ mt: 5, mx: {xs: 2}}}>
                        {sortedGroupedTimelineData.length > 0 ? (
                            sortedGroupedTimelineData
                                .slice()
                                .reverse()
                                .map((group, groupIndex) => (
                                    <div key={groupIndex}>
                                        <Typography variant="h6" color="#374248" gutterBottom>
                                            {group.header}
                                        </Typography>
                                        <Box m={3}>
                                            {group.entries
                                                .filter((event) =>
                                                    event.activity.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                .sort((a, b) => {
                                                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                                                })
                                                .map((event, index) => (
                                                    <div className="timeline" key={index}>
                                                        <div className="timeline-dot"></div>
                                                        <div className="timeline-content">
                                                            <h4 className="timeline-message">{event.activity}</h4>
                                                            <Stack direction="row" spacing={2}>
                                                                <p className="timeline-datetime">
                                                                    Timestamp: {event.timestamp}
                                                                </p>
                                                            </Stack>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </Box>
                                    </div>
                                ))
                        ) : (
                            <Grid container justifyContent="center" alignItems="center">
                                <p style={{ fontSize: '16px', marginTop: '55px' }}>No logs yet.</p>
                            </Grid>
                        )}
                    </Box>
                </section>
            </Box>
        </div>
     )
}