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
    Tooltip
} from "@mui/material";
import { Delete, Edit, Add, Refresh, Visibility } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "../styles/DashboardTable.css"; 

const DashboardTable = () => {
    const { date } = useParams();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const memberName = user?.member_name;
    
    const [logs, setLogs] = useState([]);
    const [members, setMembers] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchLogs = useCallback(async () => {
        try {
            const data = await api.getWorkoutLogs(date);
            console.log("Fetched logs:", data);
            console.log("Logs type:", typeof data);
            console.log("Is array:", Array.isArray(data));
            console.log("Length:", data ? data.length : 'N/A');
            
            // If data is not an array or is empty, log a message
            if (!Array.isArray(data) || data.length === 0) {
                console.log("No logs found or data is not in expected format");
            }
            
            setLogs(Array.isArray(data) ? data : []);
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
                await api.deleteWorkoutLog({
                    member_name: log.member_name,
                    workout_name: log.workout_name,
                    date: log.date,
                });
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

    // Check if user can edit this log based on the canEdit flag or role
    const canEditLog = (log) => {
        // For admin users
        if (isAdmin) {
            return true;
        }
        
        // For regular members
        if (log.member_name === memberName) {
            return true;
        }
        
        // If the backend provided a canEdit flag, use it
        if (log.canEdit !== undefined) {
            return log.canEdit;
        }
        
        // Default fallback
        return false;
    };

    // Add this right before the return statement to debug the table rendering
    console.log("Rendering table with logs:", logs);
    console.log("Current user is admin:", isAdmin);
    console.log("Current user member name:", memberName);

    return (
        <>
            <NavbarLoggedIn />
            <Container className="dashboard-container">
                <Typography variant="h4" className="dashboard-title">Workout Log for {date}</Typography>

                <Box className="dashboard-actions">
                    <Box className="dashboard-add">
                        <Button className="dashboard-add-button" onClick={() => handleOpen()}>
                            <Add /> Add Log
                        </Button>
                    </Box>
                    <Box className="dashboard-refresh">
                        <IconButton className="dashboard-refresh-button" onClick={fetchLogs}>
                            <Refresh />
                        </IconButton>
                    </Box>
                </Box>

                <TableContainer component={Paper} className="dashboard-table-container">
                    <Table>
                        <TableHead>
                            <TableRow className="table-header-row">
                                <TableCell>#</TableCell>
                                <TableCell>Member</TableCell>
                                <TableCell>Workout</TableCell>
                                <TableCell>Duration (mins)</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.length > 0 ? (
                                logs.map((log, index) => (
                                    <TableRow 
                                        key={`${log.member_name}-${log.workout_name}-${log.date}`} 
                                        className={`table-body-row ${log.member_name === memberName ? 'own-log-row' : ''}`}
                                    >
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{log.member_name}</TableCell>
                                        <TableCell>{log.workout_name}</TableCell>
                                        <TableCell>{log.duration}</TableCell>
                                        <TableCell>
                                            {canEditLog(log) ? (
                                                <>
                                                    <IconButton className="edit-button" onClick={() => handleOpen(log)}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton className="delete-button" onClick={() => handleDelete(log)}>
                                                        <Delete />
                                                    </IconButton>
                                                </>
                                            ) : (
                                                <Tooltip title="View only">
                                                    <IconButton className="view-button">
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} style={{textAlign: 'center'}}>
                                        No logs found for this date. Add a new log to get started.
                                    </TableCell>
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
        </>
    );
};

const LogFormModal = ({ open, handleClose, editData, date, fetchLogs, members, workouts, isAdmin, memberName }) => {
    const [member, setMember] = useState("");
    const [workout, setWorkout] = useState("");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        if (editData) {
            setMember(editData.member_name);
            setWorkout(editData.workout_name);
            setDuration(editData.duration);
        } else {
            // If not admin, pre-select the member's name and disable the field
            setMember(isAdmin ? "" : memberName);
            setWorkout("");
            setDuration("");
        }
    }, [editData, open, isAdmin, memberName]);

    const handleSubmit = async () => {
        try {
            if (editData) {
                await api.updateWorkoutLog({
                    member_name: editData.member_name,
                    workout_name: editData.workout_name,
                    date: editData.date,
                    duration,
                });
            } else {
                await api.addWorkoutLog({
                    member_name: member,
                    workout_name: workout,
                    date,
                    duration,
                });
            }
            fetchLogs();
            handleClose();
        } catch (error) {
            console.error("Error saving log:", error);
            alert(`Error saving log: ${error.message}`);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} className="dashboard-dialog">
            <DialogTitle className="dialog-title">{editData ? "Edit Log" : "Add Log"}</DialogTitle>
            <DialogContent className="dialog-content">
                <Select 
                    fullWidth 
                    value={member} 
                    onChange={(e) => setMember(e.target.value)} 
                    className="dialog-input"
                    disabled={!isAdmin || !!editData}
                >
                    {members.map((m) => (
                        <MenuItem key={m.member_name} value={m.member_name}>{m.member_name}</MenuItem>
                    ))}
                </Select>
                <Select 
                    fullWidth 
                    value={workout} 
                    onChange={(e) => setWorkout(e.target.value)} 
                    className="dialog-input" 
                    sx={{ mt: 2 }}
                    disabled={!!editData}
                >
                    {workouts.map((w) => (
                        <MenuItem key={w.workout_name} value={w.workout_name}>{w.workout_name}</MenuItem>
                    ))}
                </Select>
                <TextField 
                    fullWidth 
                    label="Duration (mins)" 
                    type="number" 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                    className="dialog-input" 
                    sx={{ mt: 2 }} 
                />
            </DialogContent>
            <DialogActions>
                <Button className="cancel-button" onClick={handleClose}>Cancel</Button>
                <Button className="save-button" onClick={handleSubmit}>{editData ? "Modify" : "Add"}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DashboardTable;
