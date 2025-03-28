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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    CssBaseline,
    ThemeProvider,
    createTheme
} from "@mui/material";
import { Refresh, Add, Edit, Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { compactCalendarStyles } from "../components/common/CalendarStyles";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ffb800',
            light: '#ffce00',
            dark: '#ff9d00',
            contrastText: '#111111',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: 'rgba(30,30,30,0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    background: 'rgba(30,30,30,0.8)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                },
            },
        },
    },
});

const Members = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const currentUserId = user?.userId || user?.id;
    const currentMemberName = user?.member_name;
    const [members, setMembers] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [newMember, setNewMember] = useState({
        member_name: "",
        gender: "",
        date_of_birth: null,
        date_joined: null,
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
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Format date for display to ensure consistent DD-MM-YYYY format
    const formatDate = (dateString) => {
        if (!dateString) return "01-03-2025"; // Default date in DD-MM-YYYY format

        // If it's in YYYY-MM-DD format, convert to DD-MM-YYYY
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        }

        // If it's already in DD-MM-YYYY format, return as is
        return dateString;
    };

    // Convert any date format to dayjs object for date picker
    const formatDateForPicker = (dateString) => {
        if (!dateString) return dayjs('2025-03-01');

        // If it's in DD-MM-YYYY format, convert to YYYY-MM-DD for dayjs
        if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
            const [day, month, year] = dateString.split('-');
            return dayjs(`${year}-${month}-${day}`);
        }

        // If it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dayjs(dateString);
        }

        return dayjs(dateString);
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

    // Generate username from member name
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
                date_joined: member.date_joined || '01-03-2025',
                password: "" // Clear password for editing
            });
            const username = member.member_name.toLowerCase().replace(/\s+/g, '');
            setGeneratedUsername(username);
        } else {
            setNewMember({
                member_name: "",
                gender: "",
                date_of_birth: null,
                date_joined: '01-03-2025',
                password: ""
            });
            setGeneratedUsername("");
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditData(null);
        setNewMember({ member_name: "", gender: "", date_of_birth: null, date_joined: null, password: "" });
        setShowPassword(false);
    };

    const handleSave = async () => {
        try {
            if (!newMember.member_name || (!isAdmin && !editData) || (isAdmin && !newMember.gender)) {
                alert("Required fields are missing");
                return;
            }
            const trimmedMember = {
                ...newMember,
                member_name: newMember.member_name.trim()
            };

            // Make sure date_joined has a value
            if (!trimmedMember.date_joined) {
                trimmedMember.date_joined = '01-03-2025';
            }

            console.log("Member data being saved:", trimmedMember); // Debugging

            const generatedUsername = trimmedMember.member_name.toLowerCase().replace(/\s+/g, '');
            if (!editData && !trimmedMember.password) {
                alert("Password is required for new members");
                return;
            }
            if (editData) {
                const dataToSend = {
                    ...trimmedMember,
                    username: generatedUsername
                };
                console.log("Updating member with data:", dataToSend); // Log data being sent

                if (!dataToSend.password) {
                    delete dataToSend.password;
                }
                if (!isAdmin && editData.id === currentUserId) {
                    const limitedData = { password: dataToSend.password };
                    if (!limitedData.password) {
                        delete limitedData.password;
                    }
                    await api.updateMember(editData.id, limitedData);
                } else if (isAdmin) {
                    await api.updateMember(editData.id, dataToSend);
                }
            } else {
                await api.addMember({
                    member_name: trimmedMember.member_name,
                    gender: trimmedMember.gender,
                    date_of_birth: trimmedMember.date_of_birth,
                    date_joined: trimmedMember.date_joined,
                    password: trimmedMember.password,
                    username: generatedUsername
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

    const handleDobChange = (newDate) => {
        if (newDate) {
            const dateString = newDate.format('YYYY-MM-DD');
            setNewMember({
                ...newMember,
                date_of_birth: dateString
            });
        } else {
            setNewMember({
                ...newMember,
                date_of_birth: null
            });
        }
    };

    const handleDateJoinedChange = (newDate) => {
        if (newDate) {
            const dateString = newDate.format('YYYY-MM-DD');
            // Store in DD-MM-YYYY format for backend
            const [year, month, day] = dateString.split('-');
            const formattedDate = `${day}-${month}-${year}`;
            setNewMember({
                ...newMember,
                date_joined: formattedDate
            });
        } else {
            setNewMember({
                ...newMember,
                date_joined: '01-03-2025' // Default value
            });
        }
    };

    const canEditMember = (member) => {
        console.log("Checking member:", {
            memberId: member.id,
            memberName: member.member_name,
            currentUserId,
            currentMemberName
        });
        if (isAdmin) return true;
        return member.id === currentUserId || member.member_name === currentMemberName;
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundImage:
                        'radial-gradient(circle at 10% 20%, rgba(25,25,25,0.9) 0%, rgba(18,18,18,1) 90%)',
                    position: 'relative',
                    pb: 4,
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '20%',
                        left: '10%',
                        width: '50%',
                        height: '60%',
                        background: 'radial-gradient(ellipse, rgba(255,184,0,0.03) 0%, transparent 70%)',
                        zIndex: 0,
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '10%',
                        right: '5%',
                        width: '30%',
                        height: '40%',
                        background: 'radial-gradient(ellipse, rgba(74,20,140,0.03) 0%, transparent 70%)',
                        zIndex: 0,
                    },
                }}
            >
                <NavbarLoggedIn />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 10, pb: 2 }}>
                    <Typography variant="h3" sx={{ mb: 3, textAlign: 'center', color: '#ffb800', fontWeight: 700 }}>
                        Members List
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        {isAdmin && (
                            <Button
                                onClick={() => handleOpen()}
                                sx={{
                                    background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                                    color: '#111',
                                    borderRadius: '50px',
                                    px: 3,
                                    py: 1,
                                    boxShadow: '0 4px 20px rgba(255,184,0,0.25)',
                                }}
                            >
                                <Add sx={{ mr: 1 }} /> Add Member
                            </Button>
                        )}
                        <IconButton onClick={fetchMembers} sx={{ color: '#ffb800' }}>
                            <Refresh />
                        </IconButton>
                    </Box>
                    <TableContainer component={Paper} sx={{ mb: 3, p: 2, borderRadius: '16px' }}>
                        <Table>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        background: 'rgba(0,0,0,0.15)',
                                        borderBottom: '2px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>#</TableCell>
                                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>Member Name</TableCell>
                                    {isAdmin && (
                                        <>
                                            <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>Gender</TableCell>
                                            <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>Age</TableCell>
                                            <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>Date Joined</TableCell>
                                        </>
                                    )}
                                    {isAdmin && (
                                        <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.85)' }}>
                                            Actions
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {members.map((member, index) => (
                                    <TableRow key={member.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{member.member_name}</TableCell>
                                        {isAdmin && (
                                            <>
                                                <TableCell>{member.gender}</TableCell>
                                                <TableCell>{calculateAge(member.date_of_birth)}</TableCell>
                                                <TableCell align="center">{formatDate(member.date_joined || '2025-03-01')}</TableCell>
                                            </>
                                        )}
                                        {isAdmin && (
                                            <TableCell>
                                                {canEditMember(member) ? (
                                                    <IconButton onClick={() => handleOpen(member)} sx={{ color: '#ffb800' }}>
                                                        <Edit />
                                                    </IconButton>
                                                ) : (
                                                    <IconButton sx={{ color: '#ffb800' }}>
                                                        <Visibility />
                                                    </IconButton>
                                                )}
                                                <IconButton onClick={() => handleDelete(member.id)} sx={{ color: '#ff5252' }}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                        <DialogTitle sx={{ background: 'rgba(30,30,30,0.8)', color: '#ffb800' }}>
                            {editData ? "Edit Member" : "Add New Member"}
                        </DialogTitle>
                        <DialogContent sx={{ background: 'rgba(30,30,30,0.8)' }}>
                            <TextField
                                fullWidth
                                label="Member Name"
                                value={newMember.member_name}
                                onChange={(e) => setNewMember({ ...newMember, member_name: e.target.value })}
                                onBlur={(e) => setNewMember({ ...newMember, member_name: e.target.value.trim() })}
                                margin="normal"
                                disabled={!isAdmin || (editData && !isAdmin)}
                                sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}
                            />
                            <TextField
                                fullWidth
                                label="Username (auto-generated)"
                                value={generatedUsername}
                                margin="normal"
                                InputProps={{ readOnly: true }}
                                helperText="Username is automatically generated from the member name"
                                disabled
                                sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}
                            />
                            <TextField
                                fullWidth
                                label={editData ? "New Password (leave blank to keep current)" : "Password"}
                                type={showPassword ? "text" : "password"}
                                value={newMember.password}
                                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                                margin="normal"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleTogglePasswordVisibility}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}
                            />
                            {isAdmin && (
                                <FormControl fullWidth margin="normal" sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                                    <InputLabel id="gender-label" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        Gender
                                    </InputLabel>
                                    <Select
                                        labelId="gender-label"
                                        value={newMember.gender}
                                        label="Gender"
                                        onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                                        sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
                                        disabled={!isAdmin || (editData && !isAdmin)}
                                    >
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            )}

                            {isAdmin && (
                                <Box sx={{ margin: "16px 0" }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DesktopDatePicker
                                            label="Date of Birth"
                                            value={newMember.date_of_birth ? formatDateForPicker(newMember.date_of_birth) : null}
                                            onChange={handleDobChange}
                                            closeOnSelect={true}
                                            format="MM/DD/YYYY"
                                            sx={compactCalendarStyles}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    sx: {
                                                        background: 'rgba(0,0,0,0.1)',
                                                        borderRadius: '4px',
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '4px',
                                                            '& fieldset': {
                                                                borderColor: 'rgba(255,255,255,0.2)', // Grey outline by default
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: 'rgba(255,255,255,0.3)',
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#ffb800', // Yellow when focused
                                                                borderWidth: 2,
                                                            }
                                                        }
                                                    }
                                                },
                                                popper: {
                                                    placement: "top-start", // Position above the input
                                                    disablePortal: false,
                                                    modifiers: [
                                                        {
                                                            name: "offset",
                                                            options: {
                                                                offset: [0, -8], // Negative vertical offset to position above
                                                            },
                                                        },
                                                        {
                                                            name: "flip",
                                                            enabled: false, // Disable automatic flipping
                                                        },
                                                        {
                                                            name: "preventOverflow",
                                                            options: {
                                                                boundary: document.body,
                                                            },
                                                        }
                                                    ]
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Box>
                            )}

                            {isAdmin && (
                                <Box sx={{ margin: "16px 0" }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DesktopDatePicker
                                            label="Date Joined"
                                            value={formatDateForPicker(newMember.date_joined || '01-03-2025')}
                                            onChange={handleDateJoinedChange}
                                            closeOnSelect={true}
                                            format="MM/DD/YYYY"
                                            sx={compactCalendarStyles}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    sx: {
                                                        background: 'rgba(0,0,0,0.1)',
                                                        borderRadius: '4px',
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '4px',
                                                            '& fieldset': {
                                                                borderColor: 'rgba(255,255,255,0.2)', // Grey outline by default
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: 'rgba(255,255,255,0.3)',
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#ffb800', // Yellow when focused
                                                                borderWidth: 2,
                                                            }
                                                        }
                                                    }
                                                },
                                                popper: {
                                                    placement: "top-start", // Position above the input
                                                    disablePortal: false,
                                                    modifiers: [
                                                        {
                                                            name: "offset",
                                                            options: {
                                                                offset: [0, -8], // Negative vertical offset to position above
                                                            },
                                                        },
                                                        {
                                                            name: "flip",
                                                            enabled: false, // Disable automatic flipping
                                                        },
                                                        {
                                                            name: "preventOverflow",
                                                            options: {
                                                                boundary: document.body,
                                                            },
                                                        }
                                                    ]
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Box>
                            )}
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
                                    boxShadow: '0 4px 20px rgba(255,184,0,0.25)',
                                }}
                            >
                                {editData ? "Save Changes" : "Add"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Members;
