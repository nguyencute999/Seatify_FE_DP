import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  forgotPassword,
  resetPassword,
  clearError,
  clearMessage 
} from '../../redux/auth/authSlice';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector(state => state.auth);

  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [resetData, setResetData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  // Phản ứng với message/error (toast hiển thị toàn cục)
  useEffect(() => {
    if (error) {
      // Clear để tránh lặp; toast đã được GlobalToastListener hiển thị
      dispatch(clearError());
    }
    if (message) {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        navigate('/login', { replace: true });
      }
      // Clear message do listener đã show xong
      dispatch(clearMessage());
    }
  }, [error, message, dispatch, step, navigate]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    
    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    
    dispatch(resetPassword({ 
      email,
      otp: resetData.otp, 
      newPassword: resetData.newPassword,
      confirmPassword: resetData.confirmPassword
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h2 className="forgot-password-title">
              {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
            </h2>
            <p className="forgot-password-subtitle">
              {step === 1 
                ? 'Nhập email để nhận mã OTP' 
                : 'Nhập mã OTP và mật khẩu mới'
              }
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-danger mt-2" style={{ fontSize: '0.9rem' }}>{error}</p>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-forgot"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Gửi mã OTP'}
              </button>

              <div className="text-center mt-4">
                <Link to="/login" className="back-to-login-link">
                  <i className="bi bi-arrow-left me-2"></i>
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="otp" className="form-label">
                  Mã OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã OTP"
                  value={resetData.otp}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  Mật khẩu mới
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Nhập mật khẩu mới"
                    value={resetData.newPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    <i className={showNewPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu mới
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Nhập lại mật khẩu mới"
                    value={resetData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-danger mt-2" style={{ fontSize: '0.9rem' }}>{error}</p>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-reset"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  className="btn btn-link back-to-email-link"
                  onClick={() => setStep(1)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Quay lại nhập email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
