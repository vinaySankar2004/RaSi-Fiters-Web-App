import React, { useState, useEffect } from "react";
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Button, Dialog,
    DialogActions, DialogContent, DialogTitle, TextField, Box,
    Select, MenuItem, FormControl, InputLabel, InputAdornment
} from "@mui/material";
import { Refresh, Add, Edit, Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "../styles/Members.css";

const Members = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [members, setMembers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newMember, setNewMember] = useState({ 
        member_name: "", 
        gender: "", 
        age: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [generatedUsername, setGeneratedUsername] = useState("");

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
            setNewMember({ member_name: "", gender: "", age: "", password: "" });
            setGeneratedUsername("");
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditData(null);
        setNewMember({ member_name: "", gender: "", age: "", password: "" });
        setShowPassword(false);
    };

    const handleSave = async () => {
        try {
            // Trim the member name to remove any leading or trailing spaces
            const trimmedMember = {
                ...newMember,
                member_name: newMember.member_name.trim()
            };
            
            if (editData) {
                // Only include password if it's not empty
                const dataToSend = { ...trimmedMember };
                if (!dataToSend.password) {
                    delete dataToSend.password;
                }
                await api.updateMember(editData.user_id, dataToSend);
            } else {
                // For new members, password is required
                if (!trimmedMember.password) {
                    alert("Password is required for new members");
                    return;
                }
                await api.addMember(trimmedMember);
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
                                <TableCell>Gender</TableCell>
                                <TableCell>Age</TableCell>
                                {isAdmin && <TableCell>Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {members.map((member, index) => (
                                <TableRow key={member.user_id} className="table-body-row">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{member.member_name}</TableCell>
                                    <TableCell>{member.gender}</TableCell>
                                    <TableCell>{member.age}</TableCell>
                                    {isAdmin && (
                                        <TableCell>
                                            <IconButton className="edit-button" onClick={() => handleOpen(member)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton className="delete-button" onClick={() => handleDelete(member.user_id)}>
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
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <TextField 
                                fullWidth 
                                label="Age" 
                                type="number" 
                                value={newMember.age} 
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value >= 0 || e.target.value === '') {
                                        setNewMember({ ...newMember, age: e.target.value });
                                    }
                                }} 
                                inputProps={{ min: 0 }}
                                className="dialog-input"
                                margin="normal"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button className="cancel-button" onClick={handleClose}>Cancel</Button>
                            <Button className="save-button" onClick={handleSave}>
                                {editData ? "Save Changes" : "Add"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Container>
        </>
    );
};

export default Members;
