import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    TextField,
    Button,
    Avatar,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    CssBaseline,
    ThemeProvider,
    createTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import { Edit, PhotoCamera, Refresh, Visibility, VisibilityOff } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#ffb800",
            light: "#ffce00",
            dark: "#ff9d00",
            contrastText: "#111"
        },
        background: {
            default: "#121212",
            paper: "#1e1e1e"
        },
        text: {
            primary: "#fff",
            secondary: "rgba(255,255,255,0.7)"
        }
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif'
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: "rgba(30,30,30,0.7)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 15px 45px rgba(0,0,0,0.3)"
                }
            }
        }
    }
});

const MyAccount = () => {
    const { user, updateUser } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [member, setMember] = useState(null);
    const [workoutLogs, setWorkoutLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [memberGender, setMemberGender] = useState("");
    const [memberDob, setMemberDob] = useState("");

    const calculateAge = (dob) => {
        if (!dob) return "";
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not provided";
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const memberName = localStorage.getItem("member_name");

                // Fetch member details
                const membersResponse = await fetch(`${process.env.REACT_APP_API_URL}/members`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (membersResponse.ok) {
                    const allMembers = await membersResponse.json();
                    const currentMember = allMembers.find((m) => m.member_name === memberName);
                    if (currentMember) {
                        setMember(currentMember);
                        setMemberGender(currentMember.gender || "");
                        setMemberDob(currentMember.date_of_birth || "");
                        setDateOfBirth(currentMember.date_of_birth || "");
                        localStorage.setItem("userId", currentMember.id);
                    }
                }

                // Fetch workout logs
                if (memberName) {
                    const logs = await api.getAllWorkoutLogs(memberName);
                    const sortedLogs = Array.isArray(logs)
                        ? logs.sort((a, b) => new Date(b.date) - new Date(a.date))
                        : [];
                    setWorkoutLogs(sortedLogs);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditDialogOpen = () => {
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setNewPassword("");
        setShowPassword(false);
        setDateOfBirth(memberDob || "");
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSaveChanges = async () => {
        try {
            const userId = localStorage.getItem("userId");
            if (!userId) throw new Error("User ID not found");

            const dataToUpdate = {};
            if (dateOfBirth) dataToUpdate.date_of_birth = dateOfBirth;
            if (newPassword) dataToUpdate.password = newPassword;

            if (Object.keys(dataToUpdate).length > 0) {
                await api.updateMember(userId, dataToUpdate);

                // Refresh member data
                const token = localStorage.getItem("token");
                const response = await fetch(`${process.env.REACT_APP_API_URL}/members/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const updatedMember = await response.json();
                    setMember(updatedMember);
                    setMemberGender(updatedMember.gender || "");
                    setMemberDob(updatedMember.date_of_birth || "");
                }
                handleEditDialogClose();
                alert("Profile updated successfully!");
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleProfilePicChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;
                updateUser({ ...user, profilePic: base64Image });
                setProfilePic(base64Image);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            alert("Failed to update profile picture");
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const memberName = localStorage.getItem("member_name");
            const membersResponse = await fetch(`${process.env.REACT_APP_API_URL}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (membersResponse.ok) {
                const allMembers = await membersResponse.json();
                const currentMember = allMembers.find((m) => m.member_name === memberName);
                if (currentMember) {
                    setMember(currentMember);
                    setMemberGender(currentMember.gender || "");
                    setMemberDob(currentMember.date_of_birth || "");
                    setDateOfBirth(currentMember.date_of_birth || "");
                }
            }
            if (memberName) {
                const logs = await api.getAllWorkoutLogs(memberName);
                const sortedLogs = Array.isArray(logs)
                    ? logs.sort((a, b) => new Date(b.date) - new Date(a.date))
                    : [];
                setWorkoutLogs(sortedLogs);
            }
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <NavbarLoggedIn />
                <Container sx={{ pt: 10, pb: 2, textAlign: "center" }}>
                    <Typography variant="h4" sx={{ color: "#ffb800" }}>
                        Loading...
                    </Typography>
                </Container>
            </>
        );
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <NavbarLoggedIn />
            <Box
                sx={{
                    minHeight: "100vh",
                    backgroundImage:
                        "radial-gradient(circle at 10% 20%, rgba(25,25,25,0.8) 0%, rgba(18,18,18,1) 90%)",
                    position: "relative",
                    pb: 4,
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "20%",
                        left: "10%",
                        width: "50%",
                        height: "60%",
                        background: "radial-gradient(ellipse, rgba(255,184,0,0.03) 0%, transparent 70%)",
                        zIndex: 0
                    },
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: "10%",
                        right: "5%",
                        width: "30%",
                        height: "40%",
                        background: "radial-gradient(ellipse, rgba(74,20,140,0.03) 0%, transparent 70%)",
                        zIndex: 0
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 10, pb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                        <Typography
                            variant="h3"
                            sx={{ flex: 1, textAlign: "center", color: "#ffb800", fontWeight: 700 }}
                        >
                            My Account
                        </Typography>
                        <IconButton onClick={handleRefresh} sx={{ color: "#FFD700" }} title="Refresh Data">
                            <Refresh />
                        </IconButton>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            textColor="inherit"
                            indicatorColor="primary"
                            sx={{
                                "& .MuiTab-root": { fontWeight: 600 },
                                "& .MuiTabs-indicator": { display: "none" }
                            }}
                        >
                            <Tab label="MY DETAILS" />
                            <Tab label="MY WORKOUTS" />
                        </Tabs>
                    </Box>
                    {tabValue === 0 && (
                        <Box
                            sx={{
                                p: 3,
                                mt: 3,
                                background: 'rgba(30,30,30,0.6)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 4 }}>
                                {/* Avatar & upload button */}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Avatar
                                        src={profilePic || user?.profilePic}
                                        alt={member?.member_name || user?.username}
                                        variant="rounded"
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            borderRadius: '16px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                            marginY: 2
                                        }}
                                    />

                                    {/* Hidden file input */}
                                    <input
                                        accept="image/*"
                                        type="file"
                                        id="profile-pic-upload"
                                        hidden
                                        onChange={handleProfilePicChange}
                                    />

                                    {/* Camera icon button */}
                                    <label htmlFor="profile-pic-upload">
                                        <IconButton
                                            component="span"
                                            sx={{
                                                mt: 1,
                                                background: 'rgba(0,0,0,0.5)',
                                                color: '#ffb800',
                                                borderRadius: '8px',
                                                p: 0.5,
                                                '&:hover': {
                                                    background: 'rgba(0,0,0,0.7)',
                                                },
                                            }}
                                        >
                                            <PhotoCamera fontSize="medium" />
                                        </IconButton>
                                    </label>
                                </Box>

                                {/* Info fields */}
                                <Box sx={{ flex: 1 }}>
                                    {/* Name */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            py: 2,
                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 600, minWidth: 110, color: 'rgba(255,255,255,0.8)' }}
                                        >
                                            Name:
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#fff', ml: 2 }}>
                                            {member?.member_name || 'Not available'}
                                        </Typography>
                                    </Box>

                                    {/* Username */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            py: 2,
                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 600, minWidth: 110, color: 'rgba(255,255,255,0.8)' }}
                                        >
                                            Username:
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#fff', ml: 2 }}>
                                            {member?.username || 'Not available'}
                                        </Typography>
                                    </Box>

                                    {/* Gender */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            py: 2,
                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 600, minWidth: 110, color: 'rgba(255,255,255,0.8)' }}
                                        >
                                            Gender:
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#fff', ml: 2 }}>
                                            {memberGender || 'Not available'}
                                        </Typography>
                                    </Box>

                                    {/* DOB & Age */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            py: 2,
                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 600, minWidth: 110, color: 'rgba(255,255,255,0.8)' }}
                                        >
                                            Date of Birth:
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#fff', ml: 2 }}>
                                            {memberDob
                                                ? `${formatDate(memberDob)} (Age: ${calculateAge(memberDob)})`
                                                : 'Not provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Edit Profile Button */}
                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Edit />}
                                    onClick={handleEditDialogOpen}
                                    sx={{
                                        background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                                        color: '#111',
                                        borderRadius: '50px',
                                        px: 3,
                                        py: 1,
                                        boxShadow: '0 4px 20px rgba(255,184,0,0.25)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #ffce00 30%, #ffb800 90%)',
                                            boxShadow: '0 6px 25px rgba(255,184,0,0.35)',
                                        },
                                    }}
                                >
                                    EDIT PROFILE
                                </Button>
                            </Box>
                        </Box>
                    )}
                    {tabValue === 1 && (
                        <Box>
                            <TableContainer component={Paper} sx={{ borderRadius: "16px" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                background: "rgba(0,0,0,0.15)",
                                                borderBottom: "2px solid rgba(255,255,255,0.1)"
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.85)" }}>
                                                Date
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.85)" }}>
                                                Workout
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.85)" }}>
                                                Duration (mins)
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {workoutLogs && workoutLogs.length > 0 ? (
                                            workoutLogs.map((log, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{log.date}</TableCell>
                                                    <TableCell>{log.workout_name}</TableCell>
                                                    <TableCell>{log.duration}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} sx={{ textAlign: "center" }}>
                                                    No workout logs found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </Container>
                <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ background: "rgba(30,30,30,0.8)", color: "#ffb800" }}>
                        Edit Profile
                    </DialogTitle>
                    <DialogContent sx={{ background: "rgba(30,30,30,0.8)" }}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            margin="normal"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleTogglePasswordVisibility}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{ background: "rgba(0,0,0,0.1)", borderRadius: "4px" }}
                        />
                        <TextField
                            fullWidth
                            label="Date of Birth"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            sx={{ background: "rgba(0,0,0,0.1)", borderRadius: "4px" }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ background: "rgba(30,30,30,0.8)" }}>
                        <Button onClick={handleEditDialogClose} sx={{ color: "#ff5252" }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveChanges}
                            sx={{
                                background: "linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)",
                                color: "#111",
                                borderRadius: "50px",
                                boxShadow: "0 4px 20px rgba(255,184,0,0.25)"
                            }}
                        >
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
};

export default MyAccount;
