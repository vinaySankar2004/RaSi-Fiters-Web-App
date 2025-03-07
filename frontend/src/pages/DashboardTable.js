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
    Box
} from "@mui/material";
import { Delete, Edit, Add, Refresh } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import api from "../utils/api";
import "../styles/DashboardTable.css"; // Apply new styling

const DashboardTable = () => {
    const { date } = useParams();
    const [logs, setLogs] = useState([]);
    const [members, setMembers] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchLogs = useCallback(async () => {
        try {
            const utcDate = new Date(date);
            const formattedDate = utcDate.toISOString().split("T")[0]; // YYYY-MM-DD format
            const data = await api.getWorkoutLogs(formattedDate);
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
                            {logs.map((log, index) => (
                                <TableRow key={`${log.member_name}-${log.workout_name}-${log.date}`} className="table-body-row">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{log.member_name}</TableCell>
                                    <TableCell>{log.workout_name}</TableCell>
                                    <TableCell>{log.duration}</TableCell>
                                    <TableCell>
                                        <IconButton className="edit-button" onClick={() => handleOpen(log)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton className="delete-button" onClick={() => handleDelete(log)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <LogFormModal open={open} handleClose={handleClose} editData={editData} date={date} fetchLogs={fetchLogs} members={members} workouts={workouts} />
            </Container>
        </>
    );
};

const LogFormModal = ({ open, handleClose, editData, date, fetchLogs, members, workouts }) => {
    const [member, setMember] = useState("");
    const [workout, setWorkout] = useState("");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        if (editData) {
            setMember(editData.member_name);
            setWorkout(editData.workout_name);
            setDuration(editData.duration);
        } else {
            setMember("");
            setWorkout("");
            setDuration("");
        }
    }, [editData, open]);

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
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} className="dashboard-dialog">
            <DialogTitle className="dialog-title">{editData ? "Edit Log" : "Add Log"}</DialogTitle>
            <DialogContent className="dialog-content">
                <Select fullWidth value={member} onChange={(e) => setMember(e.target.value)} className="dialog-input">
                    {members.map((m) => (
                        <MenuItem key={m.member_name} value={m.member_name}>{m.member_name}</MenuItem>
                    ))}
                </Select>
                <Select fullWidth value={workout} onChange={(e) => setWorkout(e.target.value)} className="dialog-input" sx={{ mt: 2 }}>
                    {workouts.map((w) => (
                        <MenuItem key={w.workout_name} value={w.workout_name}>{w.workout_name}</MenuItem>
                    ))}
                </Select>
                <TextField fullWidth label="Duration (mins)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="dialog-input" sx={{ mt: 2 }} />
            </DialogContent>
            <DialogActions>
                <Button className="cancel-button" onClick={handleClose}>Cancel</Button>
                <Button className="save-button" onClick={handleSubmit}>{editData ? "Modify" : "Add"}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DashboardTable;
