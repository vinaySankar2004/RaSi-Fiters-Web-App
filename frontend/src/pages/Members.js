import React, { useState, useEffect } from "react";
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Button, Dialog,
    DialogActions, DialogContent, DialogTitle, TextField, Box,
    Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { Refresh, Add, Edit, Delete } from "@mui/icons-material";
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
    const [newMember, setNewMember] = useState({ member_name: "", gender: "", age: "" });

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

    const handleOpen = (member = null) => {
        setEditData(member);
        setNewMember(member ? { ...member } : { member_name: "", gender: "", age: "" });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditData(null);
        setNewMember({ member_name: "", gender: "", age: "" });
    };

    const handleSave = async () => {
        try {
            if (editData) {
                await api.updateMember(editData.member_name, newMember);
            } else {
                await api.addMember(newMember);
            }
            fetchMembers();
            handleClose();
        } catch (error) {
            console.error("Error saving member:", error);
        }
    };

    const handleDelete = async (member_name) => {
        if (window.confirm("Are you sure you want to delete this member?")) {
            try {
                await api.deleteMember(member_name);
                fetchMembers();
            } catch (error) {
                console.error("Error deleting member:", error);
            }
        }
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
                                <TableRow key={member.member_name} className="table-body-row">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{member.member_name}</TableCell>
                                    <TableCell>{member.gender}</TableCell>
                                    <TableCell>{member.age}</TableCell>
                                    {isAdmin && (
                                        <TableCell>
                                            <IconButton className="edit-button" onClick={() => handleOpen(member)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton className="delete-button" onClick={() => handleDelete(member.member_name)}>
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
                        <DialogTitle className="dialog-title">{editData ? "Edit Member" : "Add New Member"}</DialogTitle>
                        <DialogContent className="dialog-content">
                            <TextField fullWidth label="Member Name" disabled={!!editData} value={newMember.member_name} onChange={(e) => setNewMember({ ...newMember, member_name: e.target.value })} className="dialog-input" />
                            
                            <FormControl fullWidth className="dialog-input">
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
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button className="cancel-button" onClick={handleClose}>Cancel</Button>
                            <Button className="save-button" onClick={handleSave}>{editData ? "Save Changes" : "Add"}</Button>
                        </DialogActions>
                    </Dialog>
                )}
            </Container>
        </>
    );
};

export default Members;
