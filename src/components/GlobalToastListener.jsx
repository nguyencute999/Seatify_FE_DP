import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearError as clearAuthError, clearMessage as clearAuthMessage } from '../redux/auth/authSlice';

const GlobalToastListener = () => {
  const dispatch = useDispatch();
  const { error: authError, message: authMessage, token } = useSelector(state => state.auth);
  const lastShownRef = useRef({ authError: null, authMessage: null });

  // Reset refs when user logs out (token becomes null)
  useEffect(() => {
    if (!token) {
      lastShownRef.current = { authError: null, authMessage: null };
    }
  }, [token]);

  useEffect(() => {
    if (authError && lastShownRef.current.authError !== authError) {
      lastShownRef.current.authError = authError;
      toast.error(authError);
      dispatch(clearAuthError());
    }
  }, [authError, dispatch]);

  useEffect(() => {
    // Only show message if user is authenticated (has token)
    // This prevents showing login success messages after logout
    if (authMessage && token && lastShownRef.current.authMessage !== authMessage) {
      lastShownRef.current.authMessage = authMessage;
      toast.success(authMessage);
      dispatch(clearAuthMessage());
    } else if (authMessage && !token) {
      // If message exists but user is not authenticated, clear it silently
      dispatch(clearAuthMessage());
    }
  }, [authMessage, token, dispatch]);

  return null;
};

export default GlobalToastListener;


