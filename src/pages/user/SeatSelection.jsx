import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventById } from '../../redux/event/eventSlice';
import { createBooking, clearError, clearMessage } from '../../redux/booking/bookingSlice';
import seatService from '../../services/seatService';
import UserSeatLayout from '../../components/user/UserSeatLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import './css/SeatSelection.css';

const SeatSelection = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEvent, loading, error } = useSelector(state => state.events);
  const { token } = useSelector(state => state.auth);
  const { loading: bookingLoading, error: bookingError, message: bookingMessage } = useSelector(state => state.booking);
  
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(true);

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearMessage());
    };
  }, [dispatch]);

  // Show booking messages
  useEffect(() => {
    if (bookingMessage) {
      // You can replace alert with a toast notification
      toast.success(bookingMessage);
      dispatch(clearMessage());
    }
  }, [bookingMessage, dispatch]);

  // Show booking errors
  useEffect(() => {
    if (bookingError) {
      // You can replace alert with a toast notification
      toast.error(bookingError);
      dispatch(clearError());
    }
  }, [bookingError, dispatch]);

  // Load event details
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
    }
  }, [dispatch, eventId]);

  // Load seats
  useEffect(() => {
    loadSeats();
  }, [eventId]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const loadSeats = async () => {
    try {
      setLoadingSeats(true);
      const response = await seatService.getSeatsByEventId(eventId);
      console.log('Raw seats data from API:', response);
      
      const mappedSeats = response.map(seat => {
        console.log('Individual seat data:', seat);
        
        // Try different possible field names for ID
        const seatId = seat.id || seat.seatId || seat.seat_id || seat.seatID;
        
        if (!seatId) {
          console.error('No seat ID found in seat data:', seat);
        }
        
        return {
          id: seatId,
          row: seat.seatRow || seat.row || seat.seat_row,
          number: seat.seatNumber || seat.number || seat.seat_number,
          isAvailable: seat.isAvailable !== false, // Default to true if not specified
          isBooked: seat.isBooked || seat.booked || false,
          price: seat.price || 0
        };
      });
      
      console.log('Mapped seats:', mappedSeats);
      setSeats(mappedSeats);
    } catch (error) {
      console.error('Error loading seats:', error);
      // Fallback to empty array if API fails
      setSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSeatSelect = (seat) => {
    if (!seat.isAvailable || seat.isBooked) {
      return; // Can't select unavailable or booked seats
    }

    // Chỉ cho phép chọn 1 ghế vì backend chỉ accept 1 seat
    setSelectedSeats([seat]);
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế!');
      return;
    }


    // Chuẩn bị dữ liệu đặt chỗ - chỉ cần eventId và seatId
    const bookingData = {
      eventId: parseInt(eventId),
      seatId: selectedSeats[0].id // Chỉ lấy ghế đầu tiên vì backend chỉ accept 1 seat
    };

    console.log('Booking data to send:', bookingData);
    console.log('Selected seats:', selectedSeats);
    console.log('Event ID:', eventId);

    try {
      const result = await dispatch(createBooking(bookingData)).unwrap();
      console.log('Booking result:', result);
      
      // Nếu đặt chỗ thành công, chuyển đến trang chi tiết đặt chỗ
      if (result && result.bookingId) {
        navigate(`/`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error details:', error);
      // Error sẽ được hiển thị từ Redux state
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
  };

  const getSeatStatus = (seat) => {
    if (seat.isBooked) return 'booked';
    if (!seat.isAvailable) return 'locked';
    return 'available';
  };

  const getSeatStatusText = (seat) => {
    if (seat.isBooked) return 'Đã đặt';
    if (!seat.isAvailable) return 'Khóa';
    return 'Trống';
  };

  const getSeatStatusBadge = (seat) => {
    const status = getSeatStatus(seat);
    const variants = {
      available: 'success',
      locked: 'danger', 
      booked: 'primary'
    };
    return (
      <Badge variant={variants[status]} size="sm">
        {getSeatStatusText(seat)}
      </Badge>
    );
  };

  if (loading || loadingSeats || bookingLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !currentEvent) {
    return (
      <div className="alert alert-danger">
        <h4>Không tìm thấy sự kiện</h4>
        <p>Sự kiện không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={() => navigate('/events')}>
          Quay lại danh sách sự kiện
        </Button>
      </div>
    );
  }

  return (
    <div className="seat-selection-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Chọn ghế</h2>
          <p className="text-muted mb-0">
            <strong>Sự kiện:</strong> {currentEvent.eventName}
          </p>
          <p className="text-muted">
            <strong>Địa điểm:</strong> {currentEvent.location}
          </p>
        </div>
        <Button 
          variant="outline-secondary"
          onClick={() => navigate(`/events/${eventId}`)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </Button>
      </div>

      <div className="row">
        {/* Seat Layout */}
        <div className="col-lg-8">
          <Card>
            <CardHeader>
              <CardTitle>
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Sơ đồ ghế
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserSeatLayout
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="col-lg-4">
          <Card className="sticky-top">
            <CardHeader>
              <CardTitle>
                <i className="bi bi-ticket-perforated me-2"></i>
                Tóm tắt đặt chỗ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSeats.length > 0 ? (
                <div className="booking-summary">
                  <h6>Ghế đã chọn:</h6>
                  <div className="selected-seats">
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="selected-seat-item">
                        <span className="seat-info">
                          Ghế {seat.row}{seat.number}
                        </span>
                        {seat.price > 0 && (
                          <span className="seat-price">
                            {seat.price.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setSelectedSeats([])}
                        >
                          <i className="bi bi-x"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="total-section">
                    <div className="d-flex justify-content-between">
                      <span>Tổng cộng:</span>
                      <strong>
                        {getTotalPrice() > 0 
                          ? `${getTotalPrice().toLocaleString('vi-VN')}đ` 
                          : 'Miễn phí'
                        }
                      </strong>
                    </div>
                  </div>

                  <Button 
                    variant="primary"
                    size="lg"
                    className="w-100 mt-3"
                    onClick={handleBooking}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Xác nhận đặt chỗ
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-cursor" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2">Chọn ghế để đặt chỗ</p>
                  <small className="text-info">Chỉ có thể chọn 1 ghế mỗi lần</small>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>
                <i className="bi bi-info-circle me-2"></i>
                Chú thích
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="legend">
                <div className="legend-item">
                  <div className="seat-icon available"></div>
                  <span>Ghế trống</span>
                </div>
                <div className="legend-item">
                  <div className="seat-icon locked"></div>
                  <span>Ghế khóa</span>
                </div>
                <div className="legend-item">
                  <div className="seat-icon booked"></div>
                  <span>Đã đặt</span>
                </div>
                <div className="legend-item">
                  <div className="seat-icon selected"></div>
                  <span>Đã chọn</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
