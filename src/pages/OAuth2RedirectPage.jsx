import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAuthFromStorage } from "../redux/auth/authSlice";
import { googleLoginWithCode } from "../redux/auth/authSlice";

const OAuth2RedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const shownRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    
    // Check for token and roles from backend callback
    const code = params.get('code');
    const token = params.get('token');
    const roles = params.get('roles');
    const error = params.get('error');
    const message = params.get('message');
    
    if (error) {
      toast.error(message || "Đăng nhập thất bại!");
      navigate("/login");
      return;
    }
    
    // Flow 1: Google redirects to FE with `code`, FE exchanges code with backend
    // Backend endpoint: POST /api/v1/auth/google/code
    if (code) {
      // redirectUri phải khớp với redirectUri đã đăng ký trong Google OAuth Console
      // và phải khớp với redirectUri mà backend sử dụng khi tạo Google login URL (GET /api/v1/auth/google-login)
      // Sử dụng window.location.origin để hỗ trợ cả localhost và production
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      dispatch(googleLoginWithCode({ code, redirectUri }))
        .then((action) => {
          if (action.meta?.requestStatus === 'fulfilled') {
            const receivedToken = action.payload?.token;
            const receivedRoles = action.payload?.roles || [];

            const authData = {
              token: receivedToken,
              roles: receivedRoles,
              email: '',
              timestamp: Date.now()
            };
            localStorage.setItem('auth', JSON.stringify(authData));
            dispatch(setAuthFromStorage(authData));

            if (!shownRef.current) {
              shownRef.current = true;
              toast.dismiss();
              toast.success("Đăng nhập Google thành công!");
              if (receivedRoles.includes('ROLE_ADMIN')) {
                navigate("/admin/dashboard", { replace: true });
              } else {
                navigate("/", { replace: true });
              }
            }
          } else {
            const errMsg = action.payload?.message || "Đăng nhập Google thất bại";
            toast.error(errMsg);
            navigate("/login");
          }
        })
        .catch(() => {
          toast.error("Có lỗi xảy ra khi xử lý đăng nhập");
          navigate("/login");
        });
      return;
    }

    // Flow 2: Backend callback redirects FE with token & roles directly
    // Backend endpoint: GET /api/v1/auth/oauth2/callback/google
    // Backend redirects to: https://www.seatify.com.vn/oauth2/redirect?token=...&roles=...
    if (token && roles) {
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
        toast.error("Có lỗi xảy ra khi xử lý đăng nhập");
        navigate("/login");
        return;
      }
    }
    
    // Nếu không có code, token, roles hoặc error - có thể là URL không hợp lệ
    if (!code && !token && !error) {
      toast.error("Không lấy được thông tin đăng nhập từ Google");
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
