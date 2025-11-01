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
    
    // Backend callback redirects FE with token & roles directly
    const token = params.get('token');
    const roles = params.get('roles');
    const error = params.get('error');
    const message = params.get('message');
    
    // Handle error from backend callback
    if (error) {
      if (!shownRef.current) {
        shownRef.current = true;
        toast.error(message || "Đăng nhập Google thất bại!");
        navigate("/login", { replace: true });
      }
      return;
    }

    // Check if token and roles are present
    if (!token || !roles) {
      if (!shownRef.current) {
        shownRef.current = true;
        toast.error("Không lấy được thông tin đăng nhập từ Google");
        navigate("/login", { replace: true });
      }
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
      if (!shownRef.current) {
        shownRef.current = true;
        toast.error("Có lỗi xảy ra khi xử lý đăng nhập");
        navigate("/login", { replace: true });
      }
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
