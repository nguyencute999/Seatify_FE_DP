import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLocationDot,
  faPhone,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTiktok } from '@fortawesome/free-brands-svg-icons';
import './css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Branding and Social Media */}
          <div className="footer-section branding-section">
            <h3 className="brand-name">SEATIFY</h3>
            <p className="brand-description">
              Giải pháp Check-in thông minh cho các sự kiện tại FPT University
            </p>
            <div className="social-media">
              <a href="https://www.facebook.com/share/167ZQFPa6L/" className="social-icon facebook" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="https://www.tiktok.com/@seatify.organization?_t=ZS-90YqnWdsDv5&_r=1" className="social-icon tik-tok" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTiktok} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="section-title">Liên kết nhanh</h4>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/events">Sự kiện</Link></li>
              <li><Link to="/news">Tin tức</Link></li>
              <li><Link to="/about">Giới thiệu</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="section-title">Hỗ trợ</h4>
            <ul className="footer-links">
              <li><a href="/guide">Hướng dẫn sử dụng</a></li>
              <li><a href="/faq">Câu hỏi thường gặp</a></li>
              <li><a href="/privacy">Chính sách bảo mật</a></li>
              <li><a href="/terms">Điều khoản sử dụng</a></li>
              <li><a href="/report">Báo cáo lỗi</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="section-title">Liên hệ</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FontAwesomeIcon icon={faLocationDot} className="contact-icon" />
                <span>FPT University, Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ</span>
              </div>
              <div className="contact-item">
                <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                <span>0964227067</span>
              </div>
              <div className="contact-item">
                <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                <span>seatify.system9@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <hr className="footer-divider" />
          <p className="copyright">
            © 2025 SEATIFY - FPT University. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
