import React, { useState, useEffect } from "react";
import {
    Container, Typography, Paper, Box, Tabs, Tab, TextField, Button,
    Avatar, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
    InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { Edit, Visibility, VisibilityOff, PhotoCamera } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "../styles/MyAccount.css";

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

    // Calculate age from date of birth
    const calculateAge = (dob) => {
        if (!dob) return "";
        
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Adjust age if birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    // Fetch member details and workout logs
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch member details
                if (user?.userId) {
                    const memberData = await api.getMember(user.userId);
                    setMember(memberData);
                    setDateOfBirth(memberData.date_of_birth || "");
                }
                
                // Fetch all workout logs for this member
                if (user?.member_name) {
                    const logs = await api.getAllWorkoutLogs(user.member_name);
                    // Sort logs by date in descending order (newest first)
                    const sortedLogs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setWorkoutLogs(sortedLogs);
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        
        fetchData();
    }, [user]);

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
        setDateOfBirth(member?.date_of_birth || "");
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSaveChanges = async () => {
        try {
            const dataToUpdate = {};
            
            if (dateOfBirth) {
                dataToUpdate.date_of_birth = dateOfBirth;
            }
            
            if (newPassword) {
                dataToUpdate.password = newPassword;
            }
            
            if (Object.keys(dataToUpdate).length > 0) {
                await api.updateMember(user.userId, dataToUpdate);
                
                // Update local member state
                setMember(prev => ({
                    ...prev,
                    date_of_birth: dateOfBirth || prev.date_of_birth
                }));
                
                // Close dialog
                handleEditDialogClose();
            }
        } catch (error) {
            console.error("Error updating member:", error);
            alert(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleProfilePicChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            // In a real app, you would upload the file to a server
            // For this demo, we'll use a FileReader to convert it to a data URL
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;
                
                // Update profile pic in user context
                updateUser({ ...user, profilePic: base64Image });
                
                // Update profile pic in local state
                setProfilePic(base64Image);
                
                // In a real app, you would save this to the server
                // await api.updateProfilePic(user.userId, base64Image);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error updating profile picture:", error);
            alert("Failed to update profile picture");
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <>
                <NavbarLoggedIn />
                <Container className="my-account-container">
                    <Typography variant="h4">Loading...</Typography>
                </Container>
            </>
        );
    }

    return (
        <>
            <NavbarLoggedIn />
            <div className="my-account-page-background">
                <Container className="my-account-container">
                    <Typography variant="h3" className="my-account-title">
                        My Account
                    </Typography>
                    
                    <Paper className="my-account-tabs-container">
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange}
                            className="my-account-tabs"
                            variant="fullWidth"
                        >
                            <Tab label="MY DETAILS" />
                            <Tab label="MY WORKOUTS" />
                        </Tabs>
                    </Paper>
                    
                    {tabValue === 0 && (
                        <Paper className="my-account-details-container">
                            <Typography variant="h4" className="my-account-username">
                                {user?.username?.toUpperCase()}
                            </Typography>
                            
                            <Box className="my-account-profile-section">
                                <Box className="my-account-avatar-container">
                                    <Avatar 
                                        src={profilePic || user?.profilePic} 
                                        alt={member?.member_name}
                                        className="my-account-avatar"
                                    />
                                    <input
                                        accept="image/*"
                                        className="my-account-file-input"
                                        id="profile-pic-upload"
                                        type="file"
                                        onChange={handleProfilePicChange}
                                        hidden
                                    />
                                    <label htmlFor="profile-pic-upload">
                                        <IconButton 
                                            component="span" 
                                            className="my-account-upload-button"
                                        >
                                            <PhotoCamera />
                                        </IconButton>
                                    </label>
                                </Box>
                                
                                <Box className="my-account-info-container">
                                    <Box className="my-account-info-row">
                                        <Typography variant="subtitle1" className="my-account-info-label">
                                            Name:
                                        </Typography>
                                        <Typography variant="body1" className="my-account-info-value">
                                            {member?.member_name}
                                        </Typography>
                                    </Box>
                                    
                                    <Box className="my-account-info-row">
                                        <Typography variant="subtitle1" className="my-account-info-label">
                                            Username:
                                        </Typography>
                                        <Typography variant="body1" className="my-account-info-value">
                                            {user?.username}
                                        </Typography>
                                    </Box>
                                    
                                    <Box className="my-account-info-row">
                                        <Typography variant="subtitle1" className="my-account-info-label">
                                            Password:
                                        </Typography>
                                        <Typography variant="body1" className="my-account-info-value password-field">
                                            ••••••••
                                            <IconButton 
                                                size="small" 
                                                className="password-visibility-toggle"
                                                onClick={handleTogglePasswordVisibility}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </Typography>
                                    </Box>
                                    
                                    <Box className="my-account-info-row">
                                        <Typography variant="subtitle1" className="my-account-info-label">
                                            Gender:
                                        </Typography>
                                        <Typography variant="body1" className="my-account-info-value">
                                            {member?.gender}
                                        </Typography>
                                    </Box>
                                    
                                    <Box className="my-account-info-row">
                                        <Typography variant="subtitle1" className="my-account-info-label">
                                            Date of Birth:
                                        </Typography>
                                        <Typography variant="body1" className="my-account-info-value">
                                            {member?.date_of_birth ? (
                                                `${formatDate(member.date_of_birth)} (Age: ${calculateAge(member.date_of_birth)})`
                                            ) : (
                                                "Not provided"
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            
                            <Button 
                                variant="contained" 
                                startIcon={<Edit />}
                                className="my-account-edit-button"
                                onClick={handleEditDialogOpen}
                            >
                                EDIT PROFILE
                            </Button>
                        </Paper>
                    )}
                    
                    {tabValue === 1 && (
                        <Paper className="my-account-workouts-container">
                            <Typography variant="h5" className="my-account-section-title">
                                My Workout History
                            </Typography>
                            
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow className="my-account-table-header">
                                            <TableCell>Date</TableCell>
                                            <TableCell>Workout</TableCell>
                                            <TableCell>Duration (mins)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {workoutLogs.length > 0 ? (
                                            workoutLogs.map((log, index) => (
                                                <TableRow key={`${log.date}-${log.workout_name}-${index}`}>
                                                    <TableCell>{formatDate(log.date)}</TableCell>
                                                    <TableCell>{log.workout_name}</TableCell>
                                                    <TableCell>{log.duration}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    No workout logs found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                    
                    {/* Edit Profile Dialog */}
                    <Dialog open={editDialogOpen} onClose={handleEditDialogClose} className="my-account-dialog">
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogContent>
                            <TextField
                                margin="dense"
                                label="New Password (leave blank to keep current)"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleTogglePasswordVisibility}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            
                            <TextField
                                margin="dense"
                                label="Date of Birth"
                                type="date"
                                fullWidth
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    max: new Date().toISOString().split('T')[0] // Prevent future dates
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditDialogClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveChanges} color="primary">
                                Save Changes
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </div>
        </>
    );
};

export default MyAccount;