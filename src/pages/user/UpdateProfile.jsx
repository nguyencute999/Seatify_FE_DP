import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import './css/Profile.css';

export default function UpdateProfile() {
  const [formData, setFormData] = useState({
    fullName: '',
    avatarUrl: '',
    phone: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        const data = res?.data;
        if (data) {
          setFormData({
            fullName: data.fullName || '',
            avatarUrl: data.avatarUrl || '',
            phone: data.phone || ''
          });
          setAvatarPreview(data.avatarUrl || '');
        }
      } catch (err) {
        setError('Không thể tải thông tin hồ sơ');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection for avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Upload avatar and get URL
  const uploadAvatar = async (file) => {
    try {
      setIsUploading(true);
      const response = await userService.uploadAvatar(file);
      return response.data; // This should be the image URL
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return 'Vui lòng nhập họ và tên';
    }
    if (formData.fullName.trim().length < 2) {
      return 'Họ và tên phải có ít nhất 2 ký tự';
    }
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      return 'Số điện thoại không hợp lệ';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      let avatarUrl = formData.avatarUrl;
      
      // Upload avatar if a new file is selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const payload = {
        fullName: formData.fullName.trim(),
        avatarUrl: avatarUrl || '',
        phone: formData.phone.trim() || ''
      };

      const res = await userService.updateProfile(payload);
      const msg = res?.message || 'Cập nhật thông tin thành công';
      setMessage(msg);
      
      // Update the form data with the new avatar URL
      setFormData(prev => ({ ...prev, avatarUrl }));
    } catch (err) {
      setError(err?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4 d-flex flex-column align-items-center">
        <div className="alert alert-info">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="update-profile-container">
      <div className="container py-4 d-flex flex-column align-items-center">
        <h3 className="mb-3">Cập nhật thông tin</h3>

        {message && (
          <div className="alert alert-success" role="alert">{message}</div>
        )}
        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="card update-profile-form">
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">
            Họ và tên <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="form-control"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Số điện thoại</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="avatar" className="form-label">Ảnh đại diện</label>
          <div className="mb-2">
            <input
              type="file"
              id="avatar"
              name="avatar"
              className="form-control"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <small className="text-muted">Chọn file hình ảnh (JPG, PNG, GIF)</small>
          </div>
          {avatarPreview && (
            <div className="mt-2">
              <small className="text-muted">Xem trước:</small>
              <div className="mt-1">
                <img 
                  src={avatarPreview} 
                  alt="Avatar preview" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    objectFit: 'cover', 
                    borderRadius: '50%',
                    border: '1px solid #ddd'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          {isUploading && (
            <div className="mt-2">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Uploading...</span>
              </div>
              <small className="text-muted">Đang tải lên ảnh đại diện...</small>
            </div>
          )}
        </div>

        <div className="update-profile-actions">
          <button 
            type="submit" 
            className="btn btn-primary update-profile-submit-btn" 
            disabled={submitting}
          >
            {submitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary update-profile-cancel-btn"
            onClick={() => window.history.back()}
          >
            Hủy
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}


