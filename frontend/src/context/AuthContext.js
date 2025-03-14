import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage on initial render
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const member_name = localStorage.getItem('member_name');
    const userId = localStorage.getItem('userId'); // Make sure userId is being stored

    if (token && username) {
      setUser({
        token,
        username,
        role: role || 'member', // Default to member if role not stored
        member_name: member_name || null,
        userId: userId || null // Include userId in the user object
      });
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('userId', userData.userId); // Make sure to store userId
    
    if (userData.member_name) {
      localStorage.setItem('member_name', userData.member_name);
    }

    // Update state
    setUser({
      token: userData.token,
      username: userData.username,
      role: userData.role,
      member_name: userData.member_name || null,
      userId: userData.userId || null // Include userId in the user object
    });
    
    console.log("User logged in:", userData); // Add this to debug
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('member_name');
    localStorage.removeItem('userId');
    
    // Update state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;