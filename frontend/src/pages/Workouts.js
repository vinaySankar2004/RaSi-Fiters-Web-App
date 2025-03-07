import React, { useState, useEffect } from "react";
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
    Box
} from "@mui/material";
import { Refresh, Add, Edit, Delete } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import api from "../utils/api";
import "../styles/Workouts.css"; // Apply new styling

const Workouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newWorkout, setNewWorkout] = useState({ workout_name: "" });

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const data = await api.getWorkouts();
            setWorkouts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching workouts:", error);
            setWorkouts([]);
        }
    };

    const handleOpen = (workout = null) => {
        setEditData(workout);
        setNewWorkout(workout ? { ...workout } : { workout_name: "" });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditData(null);
        setNewWorkout({ workout_name: "" });
    };

    const handleSave = async () => {
        try {
            if (editData) {
                await api.updateWorkout(editData.workout_name, newWorkout);
            } else {
                await api.addWorkout(newWorkout);
            }
            fetchWorkouts();
            handleClose();
        } catch (error) {
            console.error("Error saving workout:", error);
        }
    };

    const handleDelete = async (workout_name) => {
        if (window.confirm("Are you sure you want to delete this workout?")) {
            try {
                await api.deleteWorkout(workout_name);
                fetchWorkouts();
            } catch (error) {
                console.error("Error deleting workout:", error);
            }
        }
    };

    return (
        <>
            <NavbarLoggedIn />
            <Container className="workouts-container">
                <Typography variant="h4" className="workouts-title">Workouts List</Typography>

                <Box className="workouts-actions">
                    <Button className="workouts-add-button" onClick={() => handleOpen()}>
                        <Add /> Add Workout
                    </Button>
                    <IconButton className="workouts-refresh-button" onClick={fetchWorkouts}>
                        <Refresh />
                    </IconButton>
                </Box>

                <TableContainer component={Paper} className="workouts-table-container">
                    <Table>
                        <TableHead>
                            <TableRow className="table-header-row">
                                <TableCell>#</TableCell>
                                <TableCell>Workout Name</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {workouts.map((workout, index) => (
                                <TableRow key={workout.workout_name} className="table-body-row">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{workout.workout_name}</TableCell>
                                    <TableCell>
                                        <IconButton className="edit-button" onClick={() => handleOpen(workout)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton className="delete-button" onClick={() => handleDelete(workout.workout_name)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={open} onClose={handleClose} className="workouts-dialog">
                    <DialogTitle className="dialog-title">{editData ? "Edit Workout" : "Add New Workout"}</DialogTitle>
                    <DialogContent className="dialog-content">
                        <TextField fullWidth label="Workout Name" disabled={!!editData} value={newWorkout.workout_name} onChange={(e) => setNewWorkout({ ...newWorkout, workout_name: e.target.value })} className="dialog-input" />
                    </DialogContent>
                    <DialogActions>
                        <Button className="cancel-button" onClick={handleClose}>Cancel</Button>
                        <Button className="save-button" onClick={handleSave}>{editData ? "Save Changes" : "Add"}</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
};

export default Workouts;
