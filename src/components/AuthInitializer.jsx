import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthFromStorage } from '../redux/auth/authSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore auth state from localStorage for persistence across sessions
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);
        // Only require token; roles/email are optional and can be populated later
        if (parsedAuth.token) {
          const normalized = {
            token: parsedAuth.token,
            roles: Array.isArray(parsedAuth.roles) ? parsedAuth.roles : [],
            email: parsedAuth.email || '',
            timestamp: parsedAuth.timestamp || Date.now()
          };
          dispatch(setAuthFromStorage(normalized));
        }
      } catch (error) {
        console.error('Error parsing auth data from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('auth');
      }
    }
  }, [dispatch]);

  return children;
};

export default AuthInitializer;
