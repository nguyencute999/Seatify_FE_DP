import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '../redux/auth/authSlice';
import './css/Header.css';
import AnimatedLoginButton from './ui/AnimatedLoginButton.jsx';
import logo from '../images/logo.jpg';
import userService from '../services/userService';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, userEmail, roles } = useSelector(state => state.auth);
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileAccountRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fullName, setFullName] = useState('');

  // Navigation items configuration
  const navItems = [
    { id: 'home', label: 'Trang chủ', href: '/' },
    { id: 'events', label: 'Sự kiện', href: '/events' },
    { id: 'news', label: 'Tin tức', href: '/news' },
    { id: 'about', label: 'Giới thiệu', href: '/about' }
  ];

  // Scroll spy effect for in-page sections
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update active nav on route/pathname change
  useEffect(() => {
    const currentNav = navItems.find(item => item.href === location.pathname);
    if (currentNav) {
      setActiveSection(currentNav.id);
    }
  }, [location.pathname]);

  // Fetch user profile to get avatar when authenticated
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (!token) {
        setAvatarUrl('');
        setFullName('');
        return;
      }
      try {
        const res = await userService.getProfile();
        const data = res?.data;
        if (isMounted) {
          setAvatarUrl(data?.avatarUrl || '');
          setFullName(data?.fullName || '');
        }
      } catch (_) {
        if (isMounted) {
          setAvatarUrl('');
          setFullName('');
        }
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [token]);

  // Handle navigation click
  const handleNavClick = (item) => {
    setActiveSection(item.id);
    setIsMobileMenuOpen(false); // Đóng mobile menu khi click nav item
    
    // If it's a section on the same page, scroll to it
    const element = document.getElementById(item.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle login navigation
  const handleLoginClick = () => {
    navigate('/login');
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-btn')) {
        setIsMobileMenuOpen(false);
      }
      if (mobileAccountRef.current && !mobileAccountRef.current.contains(event.target)) {
        setIsMobileAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Đóng account dropdown khi đóng mobile menu
      setIsMobileAccountOpen(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Mobile Menu Button*/}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <i className={`bi ${isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>

        {/* Logo Section - Center*/}
        <Link to="/" className="logo-section" aria-label="Go to home">
          <div className="logo-icon">
            <img 
              src={logo} 
              alt="Seatify Logo" 
              className="logo-image"
            />
          </div>
          <div className="brand-info">
            <h1 className="brand-name">SEATIFY</h1>
            {/* <p className="brand-subtitle">FPT Seminar Check-in</p> */}
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li 
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              >
                <Link 
                  to={item.href} 
                  className="nav-link"
                  onClick={(e) => {
                    const element = document.getElementById(item.id);
                    if (element) {
                      e.preventDefault();
                      handleNavClick(item);
                    }
                    // Otherwise let Link navigate normally
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Login/User Section */}
        <div className="login-section">
          {token ? (
            <div className="user-info" ref={menuRef}>
              <button className="user-avatar-btn" onClick={() => setIsMenuOpen(v => !v)} aria-haspopup="menu" aria-expanded={isMenuOpen}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName || 'Avatar'}
                    className="user-avatar-img"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <i className="bi bi-person"></i>
                )}
              </button>
              {/* Hidden email text intentionally to keep header clean */}
              {isMenuOpen && (
                <div className="profile-menu" role="menu">
                  <Link to="/profile" className="profile-menu-item" onClick={() => setIsMenuOpen(false)}>
                    <i className="bi bi-info-circle me-2"></i>Thông tin cá nhân
                  </Link>
                  <Link to="/profile/update" className="profile-menu-item" onClick={() => setIsMenuOpen(false)}>
                    <i className="bi bi-pencil-square me-2"></i>Cập nhật thông tin
                  </Link>
                  <Link to="/profile/password" className="profile-menu-item" onClick={() => setIsMenuOpen(false)}>
                    <i className="bi bi-key me-2"></i>Đổi mật khẩu
                  </Link>
                  <Link to="/booking-history" className="profile-menu-item" onClick={() => setIsMenuOpen(false)}>
                    <i className="bi bi-clock-history me-2"></i>Lịch sử đặt chỗ
                  </Link>
                  {roles.includes('ROLE_ADMIN') && (
                    <Link to="/admin/dashboard" className="profile-menu-item" onClick={() => setIsMenuOpen(false)}>
                      <i className="bi bi-gear me-2"></i>Admin
                    </Link>
                  )}
                  <button className="profile-menu-item danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <AnimatedLoginButton onClick={handleLoginClick} />
          )}
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div 
        className={`mobile-sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`mobile-sidebar ${isMobileMenuOpen ? 'active' : ''}`}
          ref={mobileMenuRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-sidebar-header">
            <h3>Menu</h3>
            <button 
              className="mobile-sidebar-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <ul className="mobile-nav-list">
            {navItems.map((item) => (
              <li 
                key={item.id}
                className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
              >
                <Link 
                  to={item.href} 
                  className="mobile-nav-link"
                  onClick={() => handleNavClick(item)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Login Button hoặc Account Dropdown trong Mobile Sidebar */}
          <div className="mobile-sidebar-footer">
            {token ? (
              <div className="mobile-account-section" ref={mobileAccountRef}>
                <button 
                  className="mobile-account-btn"
                  onClick={() => setIsMobileAccountOpen(v => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isMobileAccountOpen}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  Tài khoản
                  <i className={`bi bi-chevron-${isMobileAccountOpen ? 'up' : 'down'} ms-auto`}></i>
                </button>
                {isMobileAccountOpen && (
                  <div className="mobile-account-dropdown">
                    <Link 
                      to="/profile" 
                      className="mobile-account-menu-item" 
                      onClick={() => {
                        setIsMobileAccountOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <i className="bi bi-info-circle me-2"></i>
                      Thông tin cá nhân
                    </Link>
                    <Link 
                      to="/profile/update" 
                      className="mobile-account-menu-item" 
                      onClick={() => {
                        setIsMobileAccountOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <i className="bi bi-pencil-square me-2"></i>
                      Cập nhật thông tin
                    </Link>
                    <Link 
                      to="/profile/password" 
                      className="mobile-account-menu-item" 
                      onClick={() => {
                        setIsMobileAccountOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <i className="bi bi-key me-2"></i>
                      Đổi mật khẩu
                    </Link>
                    <Link 
                      to="/booking-history" 
                      className="mobile-account-menu-item" 
                      onClick={() => {
                        setIsMobileAccountOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <i className="bi bi-clock-history me-2"></i>
                      Lịch sử đặt chỗ
                    </Link>
                    {roles && roles.includes('ROLE_ADMIN') && (
                      <Link 
                        to="/admin/dashboard" 
                        className="mobile-account-menu-item" 
                        onClick={() => {
                          setIsMobileAccountOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <i className="bi bi-gear me-2"></i>
                        Admin
                      </Link>
                    )}
                    <button 
                      className="mobile-account-menu-item danger" 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="mobile-login-btn"
                onClick={() => {
                  handleLoginClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
