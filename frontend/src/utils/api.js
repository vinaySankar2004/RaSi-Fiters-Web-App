const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
console.log("API URL:", process.env.REACT_APP_API_URL);

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: token ? `Bearer ${token}` : ''
    };
};

const fetchWithAuth = async (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
};

const api = {
    login: async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    getWorkoutLogs: async (date) => {
        try {
            const response = await fetch(`${API_URL}/workout-logs?date=${date}`, {
                headers: getAuthHeader()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch workout logs');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching workout logs:', error);
            throw error;
        }
    },

    addWorkoutLog: async (logData) => {
        try {
            // Ensure duration is a number
            const data = {
                ...logData,
                duration: parseInt(logData.duration, 10)
            };
            
            console.log("Sending log data:", data);
            
            const response = await fetch(`${API_URL}/workout-logs`, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add workout log');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error adding workout log:', error);
            throw error;
        }
    },

    updateWorkoutLog: async (logData) => {
        try {
            // Ensure duration is a number
            const data = {
                ...logData,
                duration: parseInt(logData.duration, 10)
            };
            
            const response = await fetch(`${API_URL}/workout-logs`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update workout log');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating workout log:', error);
            throw error;
        }
    },

    deleteWorkoutLog: async (logData) => {
        try {
            const response = await fetch(`${API_URL}/workout-logs`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete workout log');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting workout log:', error);
            throw error;
        }
    },

    getMembers: async () => {
        try {
            const response = await fetch(`${API_URL}/members`, {
                headers: getAuthHeader()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch members');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching members:', error);
            throw error;
        }
    },

    getMember: async (id) => {
        try {
            const response = await fetch(`${API_URL}/members/${id}`, {
                headers: getAuthHeader()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch member');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching member:', error);
            throw error;
        }
    },

    addMember: async (memberData) => {
        try {
            const response = await fetch(`${API_URL}/members`, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add member');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    },

    updateMember: async (id, memberData) => {
        try {
            const response = await fetch(`${API_URL}/members/${id}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update member');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating member:', error);
            throw error;
        }
    },

    deleteMember: async (id) => {
        try {
            const response = await fetch(`${API_URL}/members/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete member');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting member:', error);
            throw error;
        }
    },

    getWorkouts: async () => {
        try {
            const response = await fetch(`${API_URL}/workouts`, {
                headers: getAuthHeader()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch workouts');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching workouts:', error);
            throw error;
        }
    },

    addWorkout: async (workoutData) => {
        try {
            const response = await fetch(`${API_URL}/workouts`, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(workoutData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add workout');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error adding workout:', error);
            throw error;
        }
    },

    updateWorkout: async (name, workoutData) => {
        try {
            const response = await fetch(`${API_URL}/workouts/${name}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(workoutData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update workout');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating workout:', error);
            throw error;
        }
    },

    deleteWorkout: async (name) => {
        try {
            const response = await fetch(`${API_URL}/workouts/${name}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete workout');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting workout:', error);
            throw error;
        }
    },

    getAllWorkoutLogs: async (memberName) => {
        try {
            const response = await fetch(`${API_URL}/workout-logs/member/${memberName}`, {
                headers: getAuthHeader()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch workout logs');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching workout logs:', error);
            throw error;
        }
    },
};

export default api;
