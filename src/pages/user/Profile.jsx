import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import './css/Profile.css';
import userService from '../../services/userService';
import bookingService from '../../services/bookingService';

const Profile = ({ user = null }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingStats, setBookingStats] = useState({ totalParticipated: 0, presentCount: 0, absentCount: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const navigate = useNavigate();

  const defaultUser = null;

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Prefer explicit user prop if passed (e.g., from parent), else call API
        if (user && (user.fullName || user.email)) {
          if (isMounted) setProfile(user);
        } else {
          const res = await userService.getProfile();
          // ResponseWrapper shape: { status, code, message, data }
          const data = res?.data;
          if (isMounted) setProfile(data || null);
        }
      } catch (err) {
        if (isMounted) {
          // Handle 403 error specifically
          if (err?.response?.status === 403 || err?.status === 403) {
            setError('Không có quyền truy cập hoặc token hết hạn');
          } else {
            setError(err?.message || 'Không thể tải thông tin hồ sơ');
          }
          setProfile(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setIsStatsLoading(true);
        const res = await bookingService.getUserBookingStats();
        const data = res?.data || {};
        const nextStats = {
          totalParticipated: Number(data.totalParticipated) || 0,
          presentCount: Number(data.presentCount) || 0,
          absentCount: Number(data.absentCount) || 0,
        };
        if (isMounted) setBookingStats(nextStats);
      } catch (err) {
        if (isMounted) setBookingStats({ totalParticipated: 0, presentCount: 0, absentCount: 0 });
      } finally {
        if (isMounted) setIsStatsLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'attended':
        return <Badge variant="success" className="profile-status-badge">Đã tham gia</Badge>;
      case 'missed':
        return <Badge variant="danger" className="profile-status-badge">Vắng mặt</Badge>;
      default:
        return <Badge variant="secondary" className="profile-status-badge">Chưa rõ</Badge>;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SV';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const attendanceHistory = [];

  const displayName = profile?.fullName || user?.fullName || user?.name || '';
  const displayEmail = profile?.email || user?.email || '';
  const displayPhone = profile?.phone || '';
  const displayAvatar = profile?.avatarUrl || user?.avatarUrl || '';

  return (
    <div className="profile-container">
      <div className="container-fluid px-4 py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">

            {isLoading && (
              <div className="alert alert-info" role="alert">
                Đang tải thông tin hồ sơ...
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>
                    <strong>Lỗi:</strong> {error}
                  </div>
                </div>
              </div>
            )}
            
            {/* Profile Header */}
            <Card className="profile-header-card mb-4">
              <CardContent className="p-4">
                <div className="d-flex align-items-center">
                  <div className="profile-avatar me-4">
                    {displayAvatar ? (
                      <img 
                        src={displayAvatar} 
                        alt="Avatar" 
                        className="profile-avatar-circle"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="profile-avatar-circle"
                      style={{ display: displayAvatar ? 'none' : 'flex' }}
                    >
                      <i className="bi bi-person" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h2 className="profile-name mb-1">{displayName}</h2>
                    <p className="profile-mssv text-muted mb-2">{displayEmail}</p>
                  </div>
                  {/* edit actions are available from header dropdown */}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="profile-info-card mb-4">
              <CardHeader className="profile-card-header">
                <CardTitle className="profile-card-title">
                  <i className="bi bi-person-circle me-2"></i>
                  Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <div className="profile-info-header d-flex align-items-center">
                      <i className="bi bi-person profile-info-icon me-2"></i>
                      <span className="profile-info-label">Họ và tên:</span>
                    </div>
                    <div className="profile-info-data">
                      <span className="profile-info-value">{displayName || '—'}</span>
                    </div>
                  </div>
                  <div className="profile-info-item">
                    <div className="profile-info-header d-flex align-items-center">
                      <i className="bi bi-envelope profile-info-icon me-2"></i>
                      <span className="profile-info-label">Email:</span>
                    </div>
                    <div className="profile-info-data">
                      <span className="profile-info-value">{displayEmail}</span>
                    </div>
                  </div>
                  <div className="profile-info-item">
                    <div className="profile-info-header d-flex align-items-center">
                      <i className="bi bi-telephone profile-info-icon me-2"></i>
                      <span className="profile-info-label">Số điện thoại:</span>
                    </div>
                    <div className="profile-info-data">
                      <span className="profile-info-value">{displayPhone || '—'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <Card className="profile-stat-card text-center">
                  <CardContent className="p-4">
                    <div className="profile-stat-number text-primary">{isStatsLoading ? '…' : bookingStats.totalParticipated}</div>
                    <p className="profile-stat-label">Sự kiện tham gia</p>
                  </CardContent>
                </Card>
              </div>
              <div className="col-md-4 mb-3">
                <Card className="profile-stat-card text-center">
                  <CardContent className="p-4">
                    <div className="profile-stat-number text-success">{isStatsLoading ? '…' : bookingStats.presentCount}</div>
                    <p className="profile-stat-label">Có mặt</p>
                  </CardContent>
                </Card>
              </div>
              <div className="col-md-4 mb-3">
                <Card className="profile-stat-card text-center">
                  <CardContent className="p-4">
                    <div className="profile-stat-number text-warning">{isStatsLoading ? '…' : bookingStats.absentCount}</div>
                    <p className="profile-stat-label">Vắng mặt</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Attendance History */}
            {/* <Card className="profile-history-card">
              <CardHeader className="profile-card-header">
                <CardTitle className="profile-card-title">
                  <i className="bi bi-award me-2"></i>
                  Lịch sử tham gia
                </CardTitle>
                <CardDescription>
                  Các sự kiện gần đây bạn đã đăng ký
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="profile-history-list text-muted">Chưa có dữ liệu.</div>
              </CardContent>
            </Card> */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
