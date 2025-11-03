import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthRedirectHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, roles, userEmail } = useSelector(state => state.auth);

  useEffect(() => {
    // Chỉ redirect khi có token và roles, và không đang ở trang admin
    // Bỏ qua redirect nếu đang ở trang login/register để cho các trang đó tự xử lý
    if (token && roles && roles.length > 0 && userEmail) {
      const isAdmin = roles.includes('ROLE_ADMIN');
      const isOnAdminPage = location.pathname.startsWith('/admin');
      const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
      
      // Không redirect nếu đang ở trang auth - để các trang auth tự xử lý
      if (isAuthPage) {
        return;
      }
      
      // Nếu là admin và không đang ở trang admin, redirect đến admin
      if (isAdmin && !isOnAdminPage) {
        console.log('Admin detected, redirecting to /admin/dashboard');
        navigate('/admin/dashboard', { replace: true });
      }
      // Nếu là user thường và đang ở trang admin, redirect về trang chủ
      else if (!isAdmin && isOnAdminPage) {
        console.log('Regular user detected on admin page, redirecting to home');
        navigate('/', { replace: true });
      }
    }
  }, [token, roles, userEmail, navigate, location.pathname]);

  return children;
};

export default AuthRedirectHandler;
