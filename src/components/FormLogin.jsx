import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  loginUser, 
  registerUser, 
  forgotPassword, 
  resetPassword,
  getGoogleLoginUrl,
  clearError,
  clearMessage 
} from '../redux/auth/authSlice';

// UI Components với Bootstrap
const Card = ({ className = '', children, ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ className = '', children, ...props }) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ className = '', children, ...props }) => {
  return (
    <h3 className={`card-title ${className}`} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ className = '', children, ...props }) => {
  return (
    <p className={`card-text text-muted ${className}`} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ className = '', children, ...props }) => {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
};

const Tabs = ({ defaultValue, className = '', children, ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={`tabs ${className}`} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            activeTab, 
            setActiveTab 
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ className = '', children, activeTab, setActiveTab, ...props }) => {
  return (
    <ul className={`nav nav-tabs nav-fill ${className}`} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            activeTab, 
            setActiveTab 
          });
        }
        return child;
      })}
    </ul>
  );
};

const TabsTrigger = ({ 
  value, 
  className = '', 
  children, 
  activeTab, 
  setActiveTab, 
  ...props 
}) => {
  const isActive = activeTab === value;
  
  return (
    <li className="nav-item">
      <button
        type="button"
        className={`nav-link ${isActive ? 'active' : ''} ${className}`}
        onClick={() => setActiveTab(value)}
        {...props}
      >
        {children}
      </button>
    </li>
  );
};

const TabsContent = ({ 
  value, 
  className = '', 
  children, 
  activeTab, 
  ...props 
}) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={`tab-content ${className}`} {...props}>
      <div className="tab-pane active">
        {children}
      </div>
    </div>
  );
};

const Button = ({ 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseClasses = 'btn';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
    light: 'btn-light',
    dark: 'btn-dark',
    outline: 'btn-outline-primary',
    'outline-secondary': 'btn-outline-secondary',
    'outline-success': 'btn-outline-success',
    'outline-danger': 'btn-outline-danger',
    'outline-warning': 'btn-outline-warning',
    'outline-info': 'btn-outline-info',
    'outline-light': 'btn-outline-light',
    'outline-dark': 'btn-outline-dark'
  };
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  type = 'text', 
  className = '', 
  ...props 
}) => {
  return (
    <input
      type={type}
      className={`form-control ${className}`}
      {...props}
    />
  );
};

const Label = ({ 
  htmlFor, 
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`form-label ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

// Bootstrap Icons
const UserCheck = ({ className = "" }) => (
  <i className={`bi bi-person-check ${className}`}></i>
);

const Users = ({ className = "" }) => (
  <i className={`bi bi-people ${className}`}></i>
);

const FormLogin = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message, token, roles } = useSelector(state => state.auth);
  const hasHandledLoginRef = useRef(false);

  const [studentData, setStudentData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    mssv: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: nhập email, 2: nhập OTP + mật khẩu mới
  const [resetPasswordData, setResetPasswordData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Clear errors and messages when component mounts or modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      dispatch(clearMessage());
    } else {
      // Reset forgot password state when modal closes
      setShowForgotPassword(false);
      setForgotPasswordStep(1);
      setForgotPasswordEmail('');
      setResetPasswordData({ otp: '', newPassword: '', confirmPassword: '' });
    }
  }, [isOpen, dispatch]);

  // Show toast notifications for errors and messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  // Handle successful login - close modal and show success message
  useEffect(() => {
    if (token && roles.length > 0 && !hasHandledLoginRef.current) {
      hasHandledLoginRef.current = true;
      onClose();
      toast.success('Đăng nhập thành công!');
      // Redirect logic is now handled by AuthRedirectHandler
    }
  }, [token, roles, onClose]);

  // Handle form submissions
  const handleStudentLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser(studentData));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    dispatch(registerUser(registerData));
  };

  const handleGoogleLogin = () => {
    dispatch(getGoogleLoginUrl());
  };

  const handleFacebookLogin = () => {
    toast.info('Tính năng đăng nhập Facebook đang được phát triển');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(forgotPasswordEmail))
      .unwrap()
      .then(() => {
        setForgotPasswordStep(2); // Chuyển sang bước 2
      })
      .catch(() => {
        // Error sẽ được hiển thị qua toast
      });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    dispatch(resetPassword({ 
      email: forgotPasswordEmail,
      otp: resetPasswordData.otp, 
      newPassword: resetPasswordData.newPassword,
      confirmPassword: resetPasswordData.confirmPassword
    }))
      .unwrap()
      .then(() => {
        // Reset form và quay về login
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setForgotPasswordEmail('');
        setResetPasswordData({ otp: '', newPassword: '', confirmPassword: '' });
      })
      .catch(() => {
        // Error sẽ được hiển thị qua toast
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            {!showForgotPassword && <h5 className="modal-title">Chào mừng đến với SEATIFY</h5>}
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {!showForgotPassword ? (
              <p className="text-muted mb-4">Đăng nhập hoặc tạo tài khoản để tham gia seminar</p>
            ) : (
              <div className="mb-4">
              </div>
            )}
            
            {!showForgotPassword ? (
              <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="mb-4">
                <TabsTrigger
                  value="login"
                  className="d-flex align-items-center gap-2"
                >
                  <UserCheck className="me-2" />
                  Đăng nhập
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="d-flex align-items-center gap-2"
                >
                  <Users className="me-2" />
                  Đăng ký
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="mb-3">
                    <Label htmlFor="login-email">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="student@fpt.edu.vn"
                      value={studentData.email}
                      onChange={(e) =>
                        setStudentData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <Label htmlFor="login-password">
                      Mật khẩu
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={studentData.password || ""}
                      onChange={(e) =>
                        setStudentData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                   <Button type="submit" className="w-100 mb-3" disabled={loading}>
                     {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                   </Button>

                   {/* Forgot Password Link */}
                   <div className="text-center mb-3">
                     <a 
                       href="#" 
                       className="text-decoration-none"
                       onClick={(e) => {
                         e.preventDefault();
                         setShowForgotPassword(true);
                       }}
                     >
                       Quên mật khẩu?
                     </a>
                   </div>

                   {/* Social Login */}
                  <div className="position-relative mb-3">
                    <div className="position-absolute w-100" style={{ top: '50%' }}>
                      <hr />
                    </div>
                    <div className="text-center">
                      <span className="bg-white px-2 text-muted small">
                        Hoặc đăng nhập bằng
                      </span>
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleLogin}
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        disabled={loading}
                      >
                        <i className="bi bi-google text-danger"></i>
                        Google
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleFacebookLogin}
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        disabled={loading}
                      >
                        <i className="bi bi-facebook text-primary"></i>
                        Facebook
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="mb-3">
                    <Label htmlFor="register-mssv">
                      Mã số sinh viên (MSSV)
                    </Label>
                    <Input
                      id="register-mssv"
                      placeholder="Ví dụ: SE123456"
                      value={registerData.mssv}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          mssv: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <Label htmlFor="register-fullName">
                      Họ và tên
                    </Label>
                    <Input
                      id="register-fullName"
                      placeholder="Nguyễn Văn A"
                      value={registerData.fullName}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <Label htmlFor="register-email">
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="student@fpt.edu.vn"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <Label htmlFor="register-phone">
                      Số điện thoại
                    </Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="0123456789"
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <Label htmlFor="register-password">
                      Mật khẩu
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="mb-3">
                    <Label htmlFor="register-confirm">
                      Xác nhận mật khẩu
                    </Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-100 mb-3" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                  </Button>

                  {/* Social Register */}
                  <div className="position-relative mb-3">
                    <div className="position-absolute w-100" style={{ top: '50%' }}>
                      <hr />
                    </div>
                    <div className="text-center">
                      <span className="bg-white px-2 text-muted small">
                        Hoặc đăng ký bằng
                      </span>
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleLogin}
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        disabled={loading}
                      >
                        <i className="bi bi-google text-danger"></i>
                        Google
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleFacebookLogin}
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        disabled={loading}
                      >
                        <i className="bi bi-facebook text-primary"></i>
                        Facebook
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            ) : (
              <div className="space-y-4">
                {forgotPasswordStep === 1 ? (
                  // Bước 1: Nhập email
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="mb-3">
                      <Label htmlFor="forgot-email">
                        Email
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-100 mb-3" disabled={loading}>
                      {loading ? 'Đang xử lý...' : 'Gửi mã OTP'}
                    </Button>
                    
                    {/* Back to Login Link */}
                    <div className="text-center">
                      <a 
                        href="#" 
                        className="text-decoration-none"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowForgotPassword(false);
                          setForgotPasswordStep(1);
                        }}
                      >
                        Quay lại đăng nhập
                      </a>
                    </div>
                  </form>
                ) : (
                  // Bước 2: Nhập OTP và mật khẩu mới
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="mb-3">
                      <Label htmlFor="reset-otp">
                        Mã OTP
                      </Label>
                      <Input
                        id="reset-otp"
                        type="text"
                        placeholder="Nhập mã OTP"
                        value={resetPasswordData.otp}
                        onChange={(e) => setResetPasswordData(prev => ({
                          ...prev,
                          otp: e.target.value
                        }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <Label htmlFor="reset-new-password">
                        Mật khẩu mới
                      </Label>
                      <Input
                        id="reset-new-password"
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        value={resetPasswordData.newPassword}
                        onChange={(e) => setResetPasswordData(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="mb-3">
                      <Label htmlFor="reset-confirm-password">
                        Xác nhận mật khẩu mới
                      </Label>
                      <Input
                        id="reset-confirm-password"
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        value={resetPasswordData.confirmPassword}
                        onChange={(e) => setResetPasswordData(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-100 mb-3" disabled={loading}>
                      {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormLogin;
