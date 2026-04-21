import React, { useEffect, useMemo, useState } from 'react';
import { bookingService, notificationService, reviewService } from '../../api';

function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString();
}

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('UPCOMING');
  const [message, setMessage] = useState('');

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');

  const upcomingStatuses = useMemo(() => new Set(['REQUESTED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS']), []);
  const historyStatuses = useMemo(() => new Set(['COMPLETED', 'CANCELLED']), []);

  const loadBookings = async () => {
    const res = await bookingService.getMyBookings();
    setBookings(res.data || []);
  };

  useEffect(() => {
    loadBookings().catch(() => {});
  }, []);

  const showList = bookings.filter((b) => (tab === 'UPCOMING' ? upcomingStatuses.has(b.status) : historyStatuses.has(b.status)));

  const cancelBooking = async (id) => {
    try {
      setMessage('');
      await bookingService.updateStatus(id, 'CANCELLED');
      await loadBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      await reviewService.create({
        bookingId: reviewModal.id,
        rating: reviewRating,
        feedback: reviewFeedback,
      });
      setReviewModal(null);
      setReviewFeedback('');
      setReviewRating(5);
      await loadBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeaderInner">
          <div className="pagePill">
            <span className="pagePillDot" />
            My bookings
          </div>
          <h1 className="pageTitle">Upcoming + history</h1>
          <p className="pageSubtitle">Track your service status. Add reviews only after completion.</p>
        </div>
      </header>

      {message && (
        <div className="alert alert--error">{message}</div>
      )}

      <section className="panel">
        <div className="pillRow">
          <button
            className={`pillBtn ${tab === 'UPCOMING' ? 'pillBtn--active' : ''}`}
            onClick={() => setTab('UPCOMING')}
          >
            Upcoming
          </button>
          <button
            className={`pillBtn ${tab === 'HISTORY' ? 'pillBtn--active' : ''}`}
            onClick={() => setTab('HISTORY')}
          >
            History
          </button>
        </div>

        <div className="tableWrap" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Provider</th>
                <th>Status</th>
                <th className="tdRight">Actions</th>
              </tr>
            </thead>
            <tbody>
              {showList.map((booking) => (
                <tr key={booking.id}>
                  <td className="tdStrong">{booking.service.title}</td>
                  <td>{formatDateTime(booking.scheduledTime)}</td>
                  <td>{booking.provider ? booking.provider.name : 'Assigning...'}</td>
                  <td>
                    <span
                      className={`badge ${
                        booking.status === 'COMPLETED'
                          ? 'badge--good'
                          : booking.status === 'CANCELLED'
                            ? 'badge--danger'
                            : booking.status === 'ASSIGNED'
                              ? 'badge--info'
                              : 'badge--warn'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="tdRight">
                    {booking.status === 'COMPLETED' ? (
                      <button className="btn-secondary btnSmall" onClick={() => setReviewModal(booking)}>
                        Add review
                      </button>
                    ) : (
                      (booking.status === 'REQUESTED' || booking.status === 'ASSIGNED' || booking.status === 'ACCEPTED') && (
                        <button className="btn-secondary btnSmall" onClick={() => cancelBooking(booking.id)}>
                          Cancel
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {showList.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '28px 0', color: '#64748b', fontWeight: 700 }}>
                    No bookings in this section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {reviewModal && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modalTopBar" />
            <div className="modalBody">
              <h3 className="modalTitle">Review: {reviewModal.service.title}</h3>
              <p className="modalText">Rate your provider and share feedback.</p>

              <form onSubmit={submitReview} className="authForm" style={{ marginTop: 14 }}>
                <div className="authField">
                  <label className="authLabel">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="authInput"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                />
                </div>
                <div className="authField">
                  <label className="authLabel">Feedback</label>
                <textarea
                  className="authInput"
                  rows={4}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Optional feedback..."
                />
                </div>
                <div className="modalActions">
                  <button type="button" className="btn-secondary btnSmall" onClick={() => setReviewModal(null)}>
                    Close
                  </button>
                  <button type="submit" className="btn-primary btnSmall">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

