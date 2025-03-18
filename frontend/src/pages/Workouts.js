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
    Box,
    CssBaseline,
    ThemeProvider,
    createTheme
} from "@mui/material";
import { Refresh, Add, Edit, Delete } from "@mui/icons-material";
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
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
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

const Workouts = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [workouts, setWorkouts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newWorkout, setNewWorkout] = useState({ workout_name: "" });

    const fetchWorkouts = async () => {
        try {
            const data = await api.getWorkouts();
            setWorkouts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching workouts:", error);
            setWorkouts([]);
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

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
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <NavbarLoggedIn />
            <Container
                maxWidth="lg"
                sx={{ position: 'relative', zIndex: 1, pt: 10, pb: 2 }}
            >
                <Typography
                    variant="h4"
                    sx={{ mb: 3, textAlign: 'center', color: '#ffb800', fontWeight: 700 }}
                >
                    Workouts List
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                    }}
                >
                    {isAdmin && (
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
                            <Add sx={{ mr: 1 }} /> Add Workout
                        </Button>
                    )}
                    <IconButton onClick={fetchWorkouts} sx={{ color: '#ffb800' }}>
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
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: 'rgba(255,255,255,0.85)'
                                    }}
                                >
                                    #
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: 'rgba(255,255,255,0.85)'
                                    }}
                                >
                                    Workout Name
                                </TableCell>
                                {isAdmin && (
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: 'rgba(255,255,255,0.85)'
                                        }}
                                    >
                                        Actions
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {workouts.map((workout, index) => (
                                <TableRow key={workout.workout_name}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{workout.workout_name}</TableCell>
                                    {isAdmin && (
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleOpen(workout)}
                                                sx={{ color: '#ffb800' }}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(workout.workout_name)}
                                                sx={{ color: '#ff5252' }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {isAdmin && (
                    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                        <DialogTitle sx={{ background: 'rgba(30,30,30,0.8)', color: '#ffb800' }}>
                            {editData ? "Edit Workout" : "Add New Workout"}
                        </DialogTitle>
                        <DialogContent sx={{ background: 'rgba(30,30,30,0.8)' }}>
                            <TextField
                                fullWidth
                                label="Workout Name"
                                disabled={!!editData}
                                value={newWorkout.workout_name}
                                onChange={(e) =>
                                    setNewWorkout({ ...newWorkout, workout_name: e.target.value })
                                }
                                sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}
                                margin="normal"
                            />
                        </DialogContent>
                        <DialogActions sx={{ background: 'rgba(30,30,30,0.8)' }}>
                            <Button onClick={handleClose} sx={{ color: '#ff5252' }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                sx={{
                                    background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                                    color: '#111',
                                    borderRadius: '50px',
                                    boxShadow: '0 4px 20px rgba(255,184,0,0.25)'
                                }}
                            >
                                {editData ? "Save Changes" : "Add"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default Workouts;
