import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Button, Dialog,
    DialogActions, DialogContent, DialogTitle, TextField, Box
} from "@mui/material";
import { Refresh, Add, Edit, Delete } from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import api from "../utils/api";
import "../styles/Members.css";

const Members = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newMember, setNewMember] = useState({ member_name: "", gender: "", age: "" });

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("token");
        const isAdmin = localStorage.getItem("role") === "admin";

        if (!isAuthenticated || !isAdmin) {
            navigate("/login");
        }

        fetchMembers();
    }, [navigate]);

    const fetchMembers = async () => {
        try {
            const data = await api.getMembers();
            setMembers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching members:", error);
            setMembers([]);
        }
    };

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
                    <Button className="members-add-button" onClick={() => handleOpen()}>
                        <Add /> Add Member
                    </Button>
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
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {members.map((member, index) => (
                                <TableRow key={member.member_name} className="table-body-row">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{member.member_name}</TableCell>
                                    <TableCell>{member.gender}</TableCell>
                                    <TableCell>{member.age}</TableCell>
                                    <TableCell>
                                        <IconButton className="edit-button" onClick={() => handleOpen(member)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton className="delete-button" onClick={() => handleDelete(member.member_name)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={open} onClose={handleClose} className="members-dialog">
                    <DialogTitle className="dialog-title">{editData ? "Edit Member" : "Add New Member"}</DialogTitle>
                    <DialogContent className="dialog-content">
                        <TextField fullWidth label="Member Name" disabled={!!editData} value={newMember.member_name} onChange={(e) => setNewMember({ ...newMember, member_name: e.target.value })} className="dialog-input" />
                        <TextField fullWidth label="Gender" value={newMember.gender} onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })} className="dialog-input" />
                        <TextField fullWidth label="Age" type="number" value={newMember.age} onChange={(e) => setNewMember({ ...newMember, age: e.target.value })} className="dialog-input" />
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

export default Members;
