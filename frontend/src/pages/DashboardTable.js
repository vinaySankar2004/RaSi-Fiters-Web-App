import React, {useState, useEffect, useCallback} from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem } from "@mui/material";
import { Delete, Edit, Add, Refresh } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import api from "../utils/api";

const DashboardTable = () => {
    const { date } = useParams();
    const [logs, setLogs] = useState([]);
    const [members, setMembers] = useState([]);
    const [workouts, setWorkouts] = useState([]);

    const fetchLogs = useCallback(async () => {
        try {
            const data = await api.getWorkoutLogs(date);
            console.log("Fetched logs:", data);
            setLogs(Array.isArray(data) ? data : []); // Ensure it is an array
        } catch (error) {
            console.error("Error fetching logs:", error);
            setLogs([]);
        }
    }, [date]);

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
            <Container sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>Workout Log for {date}</Typography>

                {/* Buttons moved to the top */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                        <Add /> Add Log
                    </Button>
                    <IconButton color="primary" onClick={fetchLogs}>
                        <Refresh />
                    </IconButton>
                </div>

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
                                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Member</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Workout</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Duration (mins)</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log, index) => (
                                <TableRow key={`${log.member_name}-${log.workout_name}-${log.date}`} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{log.member_name}</TableCell>
                                    <TableCell>{log.workout_name}</TableCell>
                                    <TableCell>{log.duration}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleOpen(log)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(log)}>
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
    }, [editData, open]); // Reset fields when modal opens

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

    // ✅ Submit when Enter is pressed
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent unintended form submission
            handleSubmit();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{editData ? "Edit Log" : "Add Log"}</DialogTitle>
            <DialogContent onKeyDown={handleKeyDown}>
                <Select fullWidth value={member} onChange={(e) => setMember(e.target.value)}>
                    {members.map((m) => (
                        <MenuItem key={m.member_name} value={m.member_name}>{m.member_name}</MenuItem>
                    ))}
                </Select>
                <Select fullWidth value={workout} onChange={(e) => setWorkout(e.target.value)} sx={{ mt: 2 }}>
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
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">{editData ? "Modify" : "Add"}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DashboardTable;
