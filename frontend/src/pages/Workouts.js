import React, { useState, useEffect } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Refresh, Add, Edit, Delete } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import api from "../utils/api";

const Workouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newWorkout, setNewWorkout] = useState({ workout_name: "" });

    useEffect(() => {
        fetchWorkouts();
    }, []);

    // Fetch workouts from the database
    const fetchWorkouts = async () => {
        try {
            const data = await api.getWorkouts();
            console.log("Fetched workouts data:", data);
            setWorkouts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching workouts:", error);
            setWorkouts([]);
        }
    };

    // Open modal for adding/editing workout
    const handleOpen = (workout = null) => {
        setEditData(workout);
        setNewWorkout(workout ? { ...workout } : { workout_name: "" });
        setOpen(true);
    };

    // Close modal & reset fields
    const handleClose = () => {
        setOpen(false);
        setEditData(null);
        setNewWorkout({ workout_name: "" });
    };

    // Handle adding or modifying a workout
    const handleSave = async () => {
        try {
            if (editData) {
                await api.updateWorkout(editData.workout_name, newWorkout);
            } else {
                await api.addWorkout(newWorkout);
            }
            fetchWorkouts(); // Refresh list
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
            <Container sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>Workouts List</Typography>

                {/* Buttons moved to the top */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                        <Add /> Add Workout
                    </Button>
                    <IconButton color="primary" onClick={fetchWorkouts}>
                        <Refresh />
                    </IconButton>
                </div>

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
                                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Workout Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {workouts.map((workout, index) => (
                                <TableRow key={workout.workout_name} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{workout.workout_name}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleOpen(workout)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(workout.workout_name)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Add/Edit Workout Modal */}
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{editData ? "Edit Workout" : "Add New Workout"}</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth label="Workout Name" disabled={!!editData} value={newWorkout.workout_name} onChange={(e) => setNewWorkout({ ...newWorkout, workout_name: e.target.value })} sx={{ mt: 2 }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained" color="primary">{editData ? "Save Changes" : "Add"}</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
};

export default Workouts;
