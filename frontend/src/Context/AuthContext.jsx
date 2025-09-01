import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  // sauvegarde automatiquement et token quand ils changent

  useEffect(()=>{
    if (user){
      localStorage.setItem('user',JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },[user]);

  useEffect(()=>{
    if (token){
      localStorage.setItem('token',token)
    } else{
      localStorage.removeItem('token')
    }
  },[token])

  const value = {
    user,
    token,
    setUser,
    setToken,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};