const API_URL = process.env.REACT_APP_API_URL || 'https://rasi-fiters-api.onrender.com/api';
console.log("API URL:", process.env.REACT_APP_API_URL);

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
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
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        return response.json();
    },

    getWorkoutLogs: async (date) => {
        try {
            const response = await axios.get(`${API_URL}/workout-logs?date=${date}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching workout logs:", error);
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
            
            const response = await axios.post(`${API_URL}/workout-logs`, data, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error("Error adding workout log:", error);
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
            
            const response = await axios.put(`${API_URL}/workout-logs`, data, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error("Error updating workout log:", error);
            throw error;
        }
    },

    deleteWorkoutLog: async (logData) => {
        return fetchWithAuth(`${API_URL}/workout-logs`, {
            method: 'DELETE',
            body: JSON.stringify(logData)
        });
    },

    getMembers: async () => {
        return fetchWithAuth(`${API_URL}/members`);
    },

    getMember: async (id) => {
        return fetchWithAuth(`${API_URL}/members/${id}`);
    },

    addMember: async (memberData) => {
        return fetchWithAuth(`${API_URL}/members`, {
            method: 'POST',
            body: JSON.stringify(memberData)
        });
    },

    updateMember: async (id, memberData) => {
        return fetchWithAuth(`${API_URL}/members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(memberData)
        });
    },

    deleteMember: async (id) => {
        return fetchWithAuth(`${API_URL}/members/${id}`, {
            method: 'DELETE'
        });
    },

    getWorkouts: async () => {
        return fetchWithAuth(`${API_URL}/workouts`);
    },

    addWorkout: async (workoutData) => {
        return fetchWithAuth(`${API_URL}/workouts`, {
            method: 'POST',
            body: JSON.stringify(workoutData)
        });
    },

    updateWorkout: async (workoutName, workoutData) => {
        return fetchWithAuth(`${API_URL}/workouts/${workoutName}`, {
            method: 'PUT',
            body: JSON.stringify(workoutData)
        });
    },

    deleteWorkout: async (workoutName) => {
        return fetchWithAuth(`${API_URL}/workouts/${workoutName}`, {
            method: 'DELETE'
        });
    },
};

export default api;
