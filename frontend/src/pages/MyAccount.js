import React, { useState, useEffect } from "react";
import {
    Container, Typography, Box, Tabs, Tab, TextField, Button,
    Avatar, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
    InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { Edit, Visibility, VisibilityOff, PhotoCamera, Refresh } from "@mui/icons-material";
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
    const [memberGender, setMemberGender] = useState("");
    const [memberDob, setMemberDob] = useState("");

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
                
                // Use the token to get the current user's info first
                const token = localStorage.getItem('token');
                const memberName = localStorage.getItem('member_name');
                
                // First, let's find the current user's ID since it's not properly stored
                try {
                    // Get all members
                    const membersResponse = await fetch(`${process.env.REACT_APP_API_URL}/members`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (membersResponse.ok) {
                        const allMembers = await membersResponse.json();
                        
                        // Find this member by member_name
                        const currentMember = allMembers.find(m => 
                            m.member_name === memberName
                        );
                        
                        if (currentMember) {
                            // We found the member!
                            console.log("Found member:", currentMember);
                            
                            // Set the member data
                            setMember(currentMember);
                            setMemberGender(currentMember.gender || "");
                            setMemberDob(currentMember.date_of_birth || "");
                            setDateOfBirth(currentMember.date_of_birth || "");
                            
                            // Store the actual userId for future use
                            localStorage.setItem('userId', currentMember.user_id);
                        }
                    }
                } catch (memberError) {
                    console.error("Error finding member:", memberError);
                }
                
                // Fetch workout logs
                if (memberName) {
                    try {
                        const logs = await api.getAllWorkoutLogs(memberName);
                        const sortedLogs = Array.isArray(logs) 
                            ? logs.sort((a, b) => new Date(b.date) - new Date(a.date)) 
                            : [];
                        setWorkoutLogs(sortedLogs);
                    } catch (logsError) {
                        setWorkoutLogs([]);
                    }
                }
                
                setLoading(false);
            } catch (error) {
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
            const userId = localStorage.getItem('userId');
            
            if (!userId) {
                throw new Error("User ID not found");
            }

            const dataToUpdate = {};
            
            if (dateOfBirth) {
                dataToUpdate.date_of_birth = dateOfBirth;
            }
            
            if (newPassword) {
                dataToUpdate.password = newPassword;
            }
            
            if (Object.keys(dataToUpdate).length > 0) {
                await api.updateMember(userId, dataToUpdate);
                
                // Refetch member data after update
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.REACT_APP_API_URL}/members/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Not provided";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            // Reuse the same data fetching logic from useEffect
            const token = localStorage.getItem('token');
            const memberName = localStorage.getItem('member_name');
            
            try {
                // Get all members
                const membersResponse = await fetch(`${process.env.REACT_APP_API_URL}/members`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (membersResponse.ok) {
                    const allMembers = await membersResponse.json();
                    
                    // Find this member by member_name
                    const currentMember = allMembers.find(m => 
                        m.member_name === memberName
                    );
                    
                    if (currentMember) {
                        // We found the member!
                        setMember(currentMember);
                        setMemberGender(currentMember.gender || "");
                        setMemberDob(currentMember.date_of_birth || "");
                        setDateOfBirth(currentMember.date_of_birth || "");
                    }
                }
            } catch (memberError) {
                console.error("Error finding member:", memberError);
            }
            
            // Fetch workout logs
            if (memberName) {
                try {
                    const logs = await api.getAllWorkoutLogs(memberName);
                    const sortedLogs = Array.isArray(logs) 
                        ? logs.sort((a, b) => new Date(b.date) - new Date(a.date)) 
                        : [];
                    setWorkoutLogs(sortedLogs);
                } catch (logsError) {
                    setWorkoutLogs([]);
                }
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
                <Container className="my-account-container">
                    <Typography variant="h4">Loading...</Typography>
                </Container>
            </>
        );
    }

    return (
        <>
            <NavbarLoggedIn />
            <div className="my-account-page">
                <Container className="my-account-container">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h3" className="members-title" style={{ flex: 1, textAlign: 'center' }}>
                            My Account
                        </Typography>
                        <IconButton 
                            onClick={handleRefresh}
                            className="refresh-button"
                            title="Refresh Data"
                            sx={{ color: "#FFD700" }}
                        >
                            <Refresh />
                        </IconButton>
                    </Box>
                    
                    <div className="my-account-tabs-container">
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange}
                            className="my-account-tabs"
                            variant="fullWidth"
                            TabIndicatorProps={{ style: { display: 'none' } }}
                        >
                            <Tab 
                                label="MY DETAILS" 
                                className={tabValue === 0 ? "tab-active" : ""}
                            />
                            <Tab 
                                label="MY WORKOUTS" 
                                className={tabValue === 1 ? "tab-active" : ""}
                            />
                        </Tabs>
                    </div>
                    
                    {tabValue === 0 && (
                        <div className="my-account-details-container">
                            <Box className="my-account-profile-section">
                                <Box className="my-account-avatar-container">
                                    <div className="my-account-avatar-wrapper">
                                        <Avatar 
                                            src={profilePic || user?.profilePic} 
                                            alt={member?.member_name || user?.username}
                                            className="my-account-avatar"
                                            variant="square"
                                        />
                                    </div>
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
                                            {member?.member_name || localStorage.getItem('member_name') || "Not available"}
                                        </Typography>
                                    </Box>
                                    
                                    <Box className="my-account-info-row">
                                        <Typography variant="subtitle1" className="my-account-info-label">
                                            Username:
                                        </Typography>
                                        <Typography variant="body1" className="my-account-info-value">
                                            {member?.User?.username || localStorage.getItem('username') || "Not available"}
                                        </Typography>
                                    </Box>
                                    
                                    <Box className="my-account-info-row">
                                        <Typography variant="subtitle1" className="my-account-info-label">
                                            Gender:
                                        </Typography>
                                        <Typography variant="body1" className="my-account-info-value">
                                            {memberGender || "Not available"}
                                        </Typography>
                                    </Box>
                                    
                                    <Box className="my-account-info-row">
                                        <Typography variant="subtitle1" className="my-account-info-label">
                                            Date of Birth:
                                        </Typography>
                                        <Typography variant="body1" className="my-account-info-value">
                                            {memberDob ? (
                                                `${formatDate(memberDob)} (Age: ${calculateAge(memberDob)})`
                                            ) : (
                                                "Not provided"
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            
                            <Box display="flex" justifyContent="center" mb={2}>
                                <Button 
                                    variant="contained" 
                                    startIcon={<Edit />}
                                    className="my-account-edit-button"
                                    onClick={handleEditDialogOpen}
                                >
                                    EDIT PROFILE
                                </Button>
                            </Box>
                        </div>
                    )}
                    
                    {tabValue === 1 && (
                        <div className="my-account-workouts-container">
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow className="table-header-row">
                                            <TableCell>Date</TableCell>
                                            <TableCell>Workout</TableCell>
                                            <TableCell>Duration (mins)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {workoutLogs && workoutLogs.length > 0 ? (
                                            workoutLogs.map((log, index) => (
                                                <TableRow key={`${log.date}-${log.workout_name}-${index}`} className="table-body-row">
                                                    <TableCell>{formatDate(log.date)}</TableCell>
                                                    <TableCell>{log.workout_name}</TableCell>
                                                    <TableCell>{log.duration}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className="table-body-row">
                                                <TableCell colSpan={3} align="center">
                                                    No workout logs found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
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
                                className="dialog-input"
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
                                className="dialog-input"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    max: new Date().toISOString().split('T')[0] // Prevent future dates
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditDialogClose} className="cancel-button">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveChanges} className="save-button">
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