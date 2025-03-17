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
    const userId = localStorage.getItem('userId');
    const profilePic = localStorage.getItem('profilePic');

    if (token && username) {
      setUser({
        token,
        username,
        role: role || 'member',
        member_name: member_name || null,
        userId: userId || null,
        id: userId || null, // Add id for consistent access
        profilePic: profilePic || null
      });
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('role', userData.role);

    // Support both id and userId for backward compatibility
    const userId = userData.id || userData.userId;
    localStorage.setItem('userId', userId);

    if (userData.member_name) {
      localStorage.setItem('member_name', userData.member_name);
    }

    if (userData.profilePic) {
      localStorage.setItem('profilePic', userData.profilePic);
    }

    // Update state
    setUser({
      token: userData.token,
      username: userData.username,
      role: userData.role,
      member_name: userData.member_name || null,
      userId: userId,
      id: userId,
      profilePic: userData.profilePic || null
    });
  };

  const updateUser = (updatedUserData) => {
    // Update localStorage with new data
    if (updatedUserData.profilePic) {
      localStorage.setItem('profilePic', updatedUserData.profilePic);
    }

    // Update state
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('member_name');
    localStorage.removeItem('userId');
    localStorage.removeItem('profilePic');

    // Update state
    setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
