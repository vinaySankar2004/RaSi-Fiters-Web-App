const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
console.log("API URL:", process.env.REACT_APP_API_URL);

const api = {
    login: async (username, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error("Invalid credentials");
        }

        return response.json();
    },

    getWorkoutLogs: async (date) => {
        const response = await fetch(`${API_URL}/workout-logs?date=${date}`);
        return response.json();
    },
    addWorkoutLog: async (log) => {
        const response = await fetch(`${API_URL}/workout-logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(log),
        });
        return response.json();
    },
    updateWorkoutLog: async (log) => {
        const response = await fetch(`${API_URL}/workout-logs`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                member_name: log.member_name,
                workout_name: log.workout_name,
                date: log.date,
                duration: log.duration,
            }),
        });
        return response.json();
    },
    deleteWorkoutLog: async (log) => {
        await fetch(`${API_URL}/workout-logs`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                member_name: log.member_name,
                workout_name: log.workout_name,
                date: log.date,
            }),
        });
    },

    getMembers: async () => {
        try {
            const response = await fetch(`${API_URL}/members`);
            const data = await response.json();
            console.log("API Response (Members):", data);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("API Error (getMembers):", error);
            return []; // Return empty array on failure
        }
    },

    addMember: async (member) => {
        const response = await fetch(`${API_URL}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(member),
        });
        return response.json();
    },

    updateMember: async (member_name, updatedMember) => {
        const response = await fetch(`${API_URL}/members/${member_name}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedMember),
        });
        return response.json();
    },

    deleteMember: async (member_name) => {
        await fetch(`${API_URL}/members/${member_name}`, { method: "DELETE" });
    },

    getWorkouts: async () => {
        const response = await fetch(`${API_URL}/workouts`);
        return response.json();
    },
    addWorkout: async (workout) => {
        const response = await fetch(`${API_URL}/workouts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(workout),
        });
        return response.json();
    },
    updateWorkout: async (workout_name, updatedWorkout) => {
        const response = await fetch(`${API_URL}/workouts/${workout_name}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedWorkout),
        });
        return response.json();
    },
    deleteWorkout: async (workout_name) => {
        await fetch(`${API_URL}/workouts/${workout_name}`, { method: "DELETE" });
    },

};

export default api;
