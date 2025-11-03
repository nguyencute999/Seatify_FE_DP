import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAuthFromStorage } from "../redux/auth/authSlice";

const OAuth2RedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const shownRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    
    // Backend redirects FE with token & roles or error & message
    const token = params.get('token');
    const roles = params.get('roles');
    const error = params.get('error');
    const message = params.get('message');
    
    if (error) {
      // Clean query from URL to avoid persisting error params
      window.history.replaceState({}, document.title, '/oauth2/redirect');
      toast.error(message || "Đăng nhập thất bại!");
      navigate("/login");
      return;
    }
    
    // Expect token & roles directly from backend
    if (!token || !roles) {
      // Clean query if any unknown params
      if (location.search) {
        window.history.replaceState({}, document.title, '/oauth2/redirect');
      }
      toast.error("Không lấy được thông tin đăng nhập từ Google");
      navigate("/login");
      return;
    }

    try {
      // Parse roles from comma-separated string
      const rolesArray = (roles || '')
        .split(',')
        .map(role => role.trim())
        .filter(Boolean);
      
      // Save auth data to Redux store and localStorage
      const authData = {
        token,
        roles: rolesArray,
        email: '', // Email will be fetched later if needed
        timestamp: Date.now()
      };
      
      localStorage.setItem('auth', JSON.stringify(authData));
      dispatch(setAuthFromStorage(authData));
      // Clean token from URL immediately
      window.history.replaceState({}, document.title, '/oauth2/redirect');
      
      if (!shownRef.current) {
        shownRef.current = true;
        toast.dismiss();
        toast.success("Đăng nhập Google thành công!");
        
        // Redirect based on user role
        if (rolesArray.includes('ROLE_ADMIN')) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      console.error('Error processing Google login:', error);
      window.history.replaceState({}, document.title, '/oauth2/redirect');
      toast.error("Có lỗi xảy ra khi xử lý đăng nhập");
      navigate("/login");
    }
  }, [location, navigate, dispatch]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Đang xác thực đăng nhập...</h2>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default OAuth2RedirectPage;
