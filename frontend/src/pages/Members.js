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

const Members = () => {
    const [members, setMembers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newMember, setNewMember] = useState({ member_name: "", gender: "", age: "" });

    useEffect(() => {
        fetchMembers();
    }, []);

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
            <Container sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>Members List</Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                        <Add /> Add Member
                    </Button>
                    <IconButton color="primary" onClick={fetchMembers}>
                        <Refresh />
                    </IconButton>
                </Box>

                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Member Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Gender</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Age</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {members.map((member, index) => (
                                <TableRow key={member.member_name} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{member.member_name}</TableCell>
                                    <TableCell>{member.gender}</TableCell>
                                    <TableCell>{member.age}</TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleOpen(member)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(member.member_name)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{editData ? "Edit Member" : "Add New Member"}</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth label="Member Name" disabled={!!editData} value={newMember.member_name} onChange={(e) => setNewMember({ ...newMember, member_name: e.target.value })} sx={{ mt: 2 }} />
                        <TextField fullWidth label="Gender" value={newMember.gender} onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })} sx={{ mt: 2 }} />
                        <TextField fullWidth label="Age" type="number" value={newMember.age} onChange={(e) => setNewMember({ ...newMember, age: e.target.value })} sx={{ mt: 2 }} />
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

export default Members;
