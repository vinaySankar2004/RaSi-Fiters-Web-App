import React, { useState, useEffect } from "react";
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Button, Dialog,
    DialogActions, DialogContent, DialogTitle, TextField, Box,
    Select, MenuItem, FormControl, InputLabel, InputAdornment, Tooltip
} from "@mui/material";
import { Refresh, Add, Edit, Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "../styles/Members.css";

const Members = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const currentUserId = user?.userId;
    const currentMemberName = user?.member_name;
    const [members, setMembers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newMember, setNewMember] = useState({ 
        member_name: "", 
        gender: "", 
        date_of_birth: null,
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [generatedUsername, setGeneratedUsername] = useState("");

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

    const fetchMembers = async () => {
        try {
            const data = await api.getMembers();
            setMembers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching members:", error);
            setMembers([]);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Generate username when member name changes
    useEffect(() => {
        if (newMember.member_name) {
            const username = newMember.member_name.toLowerCase().replace(/\s+/g, '');
            setGeneratedUsername(username);
        } else {
            setGeneratedUsername("");
        }
    }, [newMember.member_name]);

    const handleOpen = (member = null) => {
        setEditData(member);
        if (member) {
            setNewMember({ 
                ...member, 
                password: "" // Clear password field for editing
            });
            // Generate username from member name
            const username = member.member_name.toLowerCase().replace(/\s+/g, '');
            setGeneratedUsername(username);
        } else {
            setNewMember({ member_name: "", gender: "", date_of_birth: null, password: "" });
            setGeneratedUsername("");
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditData(null);
        setNewMember({ member_name: "", gender: "", date_of_birth: null, password: "" });
        setShowPassword(false);
    };

    const handleSave = async () => {
        try {
            // Validate required fields
            if (!newMember.member_name || (!isAdmin && !editData) || (isAdmin && !newMember.gender)) {
                alert("Required fields are missing");
                return;
            }

            // Trim the member name
            const trimmedMember = {
                ...newMember,
                member_name: newMember.member_name.trim()
            };

            // Generate username from member name
            const generatedUsername = trimmedMember.member_name.toLowerCase().replace(/\s+/g, '');

            // For new members, ensure password is provided
            if (!editData && !trimmedMember.password) {
                alert("Password is required for new members");
                return;
            }

            if (editData) {
                // Only include password if it's not empty
                const dataToSend = { 
                    ...trimmedMember,
                    username: generatedUsername // Always include the generated username
                };
                
                if (!dataToSend.password) {
                    delete dataToSend.password;
                }

                // If regular member editing own profile
                if (!isAdmin && editData.user_id === currentUserId) {
                    // Regular members can ONLY update their password
                    const limitedData = {
                        password: dataToSend.password
                    };
                    
                    if (!limitedData.password) {
                        delete limitedData.password;
                    }
                    
                    await api.updateMember(editData.user_id, limitedData);
                } else if (isAdmin) {
                    // Always send the username when admin is editing
                    await api.updateMember(editData.user_id, dataToSend);
                }
            } else {
                // For new members (admin only)
                await api.addMember({
                    member_name: trimmedMember.member_name,
                    gender: trimmedMember.gender,
                    date_of_birth: trimmedMember.date_of_birth,
                    password: trimmedMember.password,
                    username: generatedUsername // Include the generated username
                });
            }
            
            fetchMembers();
            handleClose();
        } catch (error) {
            console.error("Error saving member:", error);
            alert(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this member? This will also delete their user account.")) {
            try {
                await api.deleteMember(id);
                fetchMembers();
            } catch (error) {
                console.error("Error deleting member:", error);
                alert(`Error: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    // Handle date of birth change
    const handleDobChange = (e) => {
        setNewMember({ 
            ...newMember, 
            date_of_birth: e.target.value
        });
    };

    // Update the canEditMember function to check both user ID and member name
    const canEditMember = (member) => {
        console.log("Checking member:", {
            memberId: member.user_id,
            memberName: member.member_name,
            currentUserId,
            currentMemberName
        });
        
        if (isAdmin) return true;
        
        // Check both user ID and member name
        return member.user_id === currentUserId || 
               member.member_name === currentMemberName;
    };

    return (
        <>
            <NavbarLoggedIn />
            <Container className="members-container">
                <Typography variant="h4" className="members-title">Members List</Typography>

                <Box className="members-actions">
                    {isAdmin && (
                        <Button className="members-add-button" onClick={() => handleOpen()}>
                            <Add /> Add Member
                        </Button>
                    )}
                    <IconButton className="members-refresh-button" onClick={fetchMembers}>
                        <Refresh />
                    </IconButton>
                </Box>

                <TableContainer component={Paper} className="members-table-container">
                    <Table>
                        <TableHead>
                            <TableRow className="table-header-row">
                                <TableCell>#</TableCell>
                                <TableCell>Member Name</TableCell>
                                {/* Only show Gender and Age columns for admin users */}
                                {isAdmin && (
                                    <>
                                        <TableCell>Gender</TableCell>
                                        <TableCell>Age</TableCell>
                                    </>
                                )}
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {members.map((member, index) => {
                                const canEdit = canEditMember(member);
                                
                                return (
                                    <TableRow 
                                        key={member.user_id} 
                                        className={`table-body-row ${
                                            member.user_id === currentUserId || 
                                            member.member_name === currentMemberName 
                                                ? 'own-log-row' 
                                                : ''
                                        }`}
                                    >
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{member.member_name}</TableCell>
                                        {/* Only show Gender and Age columns for admin users */}
                                        {isAdmin && (
                                            <>
                                                <TableCell>{member.gender}</TableCell>
                                                <TableCell>{calculateAge(member.date_of_birth)}</TableCell>
                                            </>
                                        )}
                                        <TableCell>
                                            {canEdit ? (
                                                <>
                                                    <IconButton className="edit-button" onClick={() => handleOpen(member)}>
                                                        <Edit />
                                                    </IconButton>
                                                    {isAdmin && (
                                                        <IconButton className="delete-button" onClick={() => handleDelete(member.user_id)}>
                                                            <Delete />
                                                        </IconButton>
                                                    )}
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
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={open} onClose={handleClose} className="members-dialog">
                    <DialogTitle className="dialog-title">
                        {editData ? "Edit Member" : "Add New Member"}
                    </DialogTitle>
                    <DialogContent className="dialog-content">
                        <TextField 
                            fullWidth 
                            label="Member Name" 
                            value={newMember.member_name} 
                            onChange={(e) => setNewMember({ ...newMember, member_name: e.target.value })}
                            onBlur={(e) => setNewMember({ ...newMember, member_name: e.target.value.trim() })}
                            className="dialog-input" 
                            margin="normal"
                            disabled={!isAdmin || (editData && !isAdmin)}
                        />
                        
                        <TextField 
                            fullWidth 
                            label="Username (auto-generated)" 
                            value={generatedUsername}
                            className="dialog-input" 
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                            }}
                            helperText="Username is automatically generated from the member name"
                            disabled={true}
                        />
                        
                        <TextField 
                            fullWidth 
                            label={editData ? "New Password (leave blank to keep current)" : "Password"} 
                            type={showPassword ? "text" : "password"}
                            value={newMember.password} 
                            onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                            className="dialog-input" 
                            margin="normal"
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
                        
                        {/* Only show Gender field for admin users */}
                        {isAdmin && (
                            <FormControl fullWidth className="dialog-input" margin="normal">
                                <InputLabel id="gender-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Gender</InputLabel>
                                <Select
                                    labelId="gender-label"
                                    value={newMember.gender}
                                    label="Gender"
                                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                                    sx={{ 
                                        color: 'white',
                                        '& .MuiSelect-icon': {
                                            color: 'white'
                                        }
                                    }}
                                    disabled={!isAdmin || (editData && !isAdmin)}
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                        
                        {/* Only show Date of Birth field for admin users */}
                        {isAdmin && (
                            <TextField 
                                fullWidth 
                                label="Date of Birth"
                                type="date"
                                value={newMember.date_of_birth || ''}
                                onChange={handleDobChange}
                                className="dialog-input" 
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    max: new Date().toISOString().split('T')[0] // Prevent future dates
                                }}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button className="cancel-button" onClick={handleClose}>Cancel</Button>
                        <Button className="save-button" onClick={handleSave}>
                            {editData ? "Save Changes" : "Add"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
};

export default Members;
