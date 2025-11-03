import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '../redux/auth/authSlice';
import logo from '../images/logo.jpg';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userEmail, roles } = useSelector(state => state.auth);

  const isAdmin = roles.includes('ROLE_ADMIN');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: 'bi bi-speedometer2',
      path: '/admin/dashboard'
    },
    {
      id: 'events',
      label: 'Quản lý sự kiện',
      icon: 'bi bi-calendar-event',
      path: '/admin/events'
    },
    {
      id: 'news',
      label: 'Tin tức & Sự kiện',
      icon: 'bi bi-newspaper',
      path: '/admin/news'
    },
    {
      id: 'seat-layouts',
      label: 'Quản lý sơ đồ ghế',
      icon: 'bi bi-plus-circle',
      path: '/admin/seat-layouts'
    },
    {
      id: 'users',
      label: 'Quản lý người dùng',
      icon: 'bi bi-people',
      path: '/admin/users'
    },
    {
      id: 'bookings',
      label: 'Quản lý đặt chỗ',
      icon: 'bi bi-ticket-perforated',
      path: '/admin/bookings'
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: 'bi bi-graph-up',
      path: '/admin/reports'
    }
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  // This check is now handled by ProtectedRoute, but keeping as fallback
  if (!isAdmin) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="text-center">
          <h3 className="text-danger">Không có quyền truy cập</h3>
          <p>Bạn cần quyền admin để truy cập trang này.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <img 
              src={logo}
              alt="Seatify" 
              className="sidebar-logo me-2"
              style={{ width: '32px', height: '32px' }}
            />
            {sidebarOpen && <h5 className="mb-0 text-white">Seatify Admin</h5>}
          </div>
          <button 
            className="btn btn-link text-white p-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`bi bi-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.path)}
            >
              <i className={item.icon}></i>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <i className="bi bi-person-circle"></i>
            {sidebarOpen && (
              <div>
                <div className="user-name">{userEmail}</div>
                <div className="user-role">Administrator</div>
              </div>
            )}
          </div>
          <button 
            className="btn btn-outline-light btn-sm"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <i className="bi bi-box-arrow-right"></i>
            {sidebarOpen && <span className="ms-1">Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="admin-header">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="mb-0">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Dashboard'}
              </h4>
              <small className="text-muted">Quản lý hệ thống Seatify</small>
            </div>
            <div className="d-flex align-items-center gap-3">
              {/* <div className="text-end">
                <div className="fw-medium">{userEmail}</div>
                <small className="text-muted">Administrator</small>
              </div> */}
              <div className="dropdown">
                {/* <button 
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-gear"></i>
                </button> */}
                <ul className="dropdown-menu">
                  {/* <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>Hồ sơ</a></li>
                  <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>Cài đặt</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                    </button>
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .admin-sidebar {
          width: 280px;
          background: linear-gradient(135deg, #f97316 0%, #000080 100%);
          color: white;
          transition: all 0.3s ease;
          position: fixed;
          height: 100vh;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .admin-sidebar.closed {
          width: 70px;
        }

        .sidebar-header {
          padding: 1.5rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-logo {
          border-radius: 4px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-item {
          width: 100%;
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          color: rgba(255, 255, 255, 0.8);
          text-align: left;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }

        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          border-left-color: white;
        }

        .nav-item i {
          font-size: 1.1rem;
          min-width: 20px;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .user-info i {
          font-size: 2rem;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .user-role {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .admin-main {
          flex: 1;
          margin-left: 280px;
          transition: margin-left 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .admin-main.sidebar-closed {
          margin-left: 70px;
        }

        .admin-header {
          background: white;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .admin-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar.open {
            transform: translateX(0);
          }

          .admin-main {
            margin-left: 0;
          }

          .admin-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
