import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearError as clearAuthError, clearMessage as clearAuthMessage } from '../redux/auth/authSlice';

const GlobalToastListener = () => {
  const dispatch = useDispatch();
  const { error: authError, message: authMessage } = useSelector(state => state.auth);
  const lastShownRef = useRef({ authError: null, authMessage: null });

  useEffect(() => {
    if (authError && lastShownRef.current.authError !== authError) {
      lastShownRef.current.authError = authError;
      toast.error(authError);
      dispatch(clearAuthError());
    }
  }, [authError, dispatch]);

  useEffect(() => {
    if (authMessage && lastShownRef.current.authMessage !== authMessage) {
      lastShownRef.current.authMessage = authMessage;
      toast.success(authMessage);
      dispatch(clearAuthMessage());
    }
  }, [authMessage, dispatch]);

  return null;
};

export default GlobalToastListener;


