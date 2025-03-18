import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    Box,
    Tooltip,
    CssBaseline,
    ThemeProvider,
    createTheme
} from "@mui/material";
import { Delete, Edit, Add, Refresh, Visibility } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ffb800',
            light: '#ffce00',
            dark: '#ff9d00',
            contrastText: '#111111'
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e'
        }
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif'
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: 'rgba(30,30,30,0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: 'rgba(30,30,30,0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            }
        }
    }
});

const DashboardTable = () => {
    const { date } = useParams();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const memberName = user?.member_name;
    const userId = user?.userId || user?.id;

    const [logs, setLogs] = useState([]);
    const [members, setMembers] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchLogs = useCallback(async () => {
        try {
            const data = await api.getWorkoutLogs(date);
            // Sort logs alphabetically by member_name
            const sortedLogs = Array.isArray(data)
                ? [...data].sort((a, b) => a.member_name.localeCompare(b.member_name))
                : [];
            setLogs(sortedLogs);
        } catch (error) {
            console.error("Error fetching logs:", error);
            setLogs([]);
        }
    }, [date]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const fetchMembers = useCallback(async () => {
        const data = await api.getMembers();
        setMembers(data);
    }, []);

    const fetchWorkouts = useCallback(async () => {
        const data = await api.getWorkouts();
        setWorkouts(data);
    }, []);

    useEffect(() => {
        fetchLogs();
        fetchMembers();
        fetchWorkouts();
    }, [fetchLogs, fetchMembers, fetchWorkouts]);

    const handleDelete = async (log) => {
        if (window.confirm("Are you sure you want to delete this log?")) {
            try {
                const deleteData = {
                    workout_name: log.workout_name,
                    date: log.date
                };
                if (log.member_id) {
                    deleteData.member_id = log.member_id;
                } else if (log.member_name) {
                    deleteData.member_name = log.member_name;
                }
                await api.deleteWorkoutLog(deleteData);
                fetchLogs();
            } catch (error) {
                console.error("Error deleting log:", error);
            }
        }
    };

    const handleOpen = (log = null) => {
        setEditData(log);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditData(null);
    };

    // Check if the user can edit this log
    const canEditLog = (log) => {
        if (isAdmin) return true;
        if (log.member_name === memberName) return true;
        if (log.member_id && log.member_id === userId) return true;
        if (log.canEdit !== undefined) return log.canEdit;
        return false;
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <NavbarLoggedIn />
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 10, pb: 2 }}>
                <Typography
                    variant="h4"
                    sx={{ mb: 3, textAlign: 'center', color: '#ffb800', fontWeight: 700 }}
                >
                    Workout Log for {date}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Button
                        onClick={() => handleOpen()}
                        sx={{
                            background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                            color: '#111',
                            borderRadius: '50px',
                            px: 3,
                            py: 1,
                            boxShadow: '0 4px 20px rgba(255,184,0,0.25)'
                        }}
                    >
                        <Add sx={{ mr: 1 }} /> Add Log
                    </Button>
                    <IconButton onClick={fetchLogs} sx={{ color: '#ffb800' }}>
                        <Refresh />
                    </IconButton>
                </Box>
                <TableContainer
                    component={Paper}
                    sx={{ mb: 3, p: 2, borderRadius: '16px' }}
                >
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    background: 'rgba(0,0,0,0.15)',
                                    borderBottom: '2px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>
                                    #
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>
                                    Member
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>
                                    Workout
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>
                                    Duration (mins)
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.length > 0 ? (
                                logs.map((log, index) => (
                                    <TableRow
                                        key={`${log.member_name}-${log.workout_name}-${log.date}`}
                                        sx={log.member_name === memberName ? { background: 'rgba(255,184,0,0.1)' } : {}}
                                    >
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{log.member_name}</TableCell>
                                        <TableCell>{log.workout_name}</TableCell>
                                        <TableCell>{log.duration}</TableCell>
                                        <TableCell>
                                            {canEditLog(log) ? (
                                                <>
                                                    <IconButton onClick={() => handleOpen(log)} sx={{ color: '#ffb800' }}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDelete(log)} sx={{ color: '#ff5252' }}>
                                                        <Delete />
                                                    </IconButton>
                                                </>
                                            ) : (
                                                <Tooltip title="View only">
                                                    <IconButton sx={{ color: '#ffb800' }}>
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5}></TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <LogFormModal
                    open={open}
                    handleClose={handleClose}
                    editData={editData}
                    date={date}
                    fetchLogs={fetchLogs}
                    members={members}
                    workouts={workouts}
                    isAdmin={isAdmin}
                    memberName={memberName}
                />
            </Container>
        </ThemeProvider>
    );
};

const LogFormModal = ({
                          open,
                          handleClose,
                          editData,
                          date,
                          fetchLogs,
                          members,
                          workouts,
                          isAdmin,
                          memberName
                      }) => {
    const [member, setMember] = useState("");
    const [workout, setWorkout] = useState("");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        if (editData) {
            setMember(editData.member_name);
            setWorkout(editData.workout_name);
            setDuration(editData.duration);
        } else {
            setMember(isAdmin ? "" : memberName);
            setWorkout("");
            setDuration("");
        }
    }, [editData, open, isAdmin, memberName]);

    const handleSubmit = async () => {
        try {
            if (!member || !workout || !duration) {
                alert("All fields are required");
                return;
            }
            if (isNaN(duration) || parseInt(duration) <= 0) {
                alert("Duration must be a positive number");
                return;
            }
            let member_id = null;
            const memberObj = members.find((m) => m.member_name === member);
            if (memberObj) {
                member_id = memberObj.id;
            }
            const logData = {
                member_name: member,
                workout_name: workout,
                date: editData ? editData.date : date,
                duration: parseInt(duration, 10)
            };
            if (member_id) {
                logData.member_id = member_id;
            }
            if (editData) {
                await api.updateWorkoutLog(logData);
            } else {
                await api.addWorkoutLog(logData);
            }
            fetchLogs();
            handleClose();
        } catch (error) {
            console.error("Error saving log:", error);
            alert(`Error saving log: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ background: 'rgba(30,30,30,0.8)', color: '#ffb800' }}>
                {editData ? "Edit Log" : "Add Log"}
            </DialogTitle>
            <DialogContent sx={{ background: 'rgba(30,30,30,0.8)' }}>
                <Select
                    fullWidth
                    value={member}
                    onChange={(e) => setMember(e.target.value)}
                    sx={{ mt: 2, background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}
                    disabled={!isAdmin || !!editData}
                >
                    {members.map((m) => (
                        <MenuItem key={m.member_name} value={m.member_name}>
                            {m.member_name}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    fullWidth
                    value={workout}
                    onChange={(e) => setWorkout(e.target.value)}
                    sx={{ mt: 2, background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}
                    disabled={!!editData}
                >
                    {workouts.map((w) => (
                        <MenuItem key={w.workout_name} value={w.workout_name}>
                            {w.workout_name}
                        </MenuItem>
                    ))}
                </Select>
                <TextField
                    fullWidth
                    label="Duration (mins)"
                    type="number"
                    value={duration}
                    onChange={(e) => {
                        // Convert to number
                        const val = parseInt(e.target.value, 10);
                        // If user typed something below 1, clamp it to 1
                        if (val < 1 || isNaN(val)) {
                            setDuration("1");
                        } else {
                            setDuration(e.target.value);
                        }
                    }}
                    // Add HTML attribute to block going below 1 with the up/down arrows
                    inputProps={{
                        min: 1,
                    }}
                    sx={{ mt: 2, background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}
                />
            </DialogContent>
            <DialogActions sx={{ background: 'rgba(30,30,30,0.8)' }}>
                <Button onClick={handleClose} sx={{ color: '#ff5252' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    sx={{
                        background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                        color: '#111',
                        borderRadius: '50px',
                        boxShadow: '0 4px 20px rgba(255,184,0,0.25)'
                    }}
                >
                    {editData ? "Modify" : "Add"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DashboardTable;
