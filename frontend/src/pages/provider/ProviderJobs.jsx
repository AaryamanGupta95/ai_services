import React, { useEffect, useState } from 'react';
import { bookingService, providerService } from '../../api';
import { authService } from '../../api';

export default function ProviderJobs() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const currentUser = authService.getCurrentUser();

  const load = async () => {
    try {
      const profRes = await providerService.getProfile(currentUser.id);
      setProfile(profRes.data);
      const bookRes = await bookingService.getMyBookings();
      setBookings(bookRes.data || []);
    } catch (e) {
      setBookings([]);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const updateStatus = async (bookingId, newStatus) => {
    setMessage('');
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeaderInner">
          <div className="pagePill">
            <span className="pagePillDot" />
            Jobs
          </div>
          <h1 className="pageTitle">Manage assigned bookings</h1>
          <p className="pageSubtitle">Accept, reject (auto-reassign), start service, and complete jobs.</p>
        </div>
      </header>

      {message && (
        <div className="alert alert--error">{message}</div>
      )}

      {profile && (
        <section className="panel">
          <div className="rowBetween">
            <div>
              <div className="panelDesc" style={{ margin: 0, fontWeight: 800 }}>Rating</div>
              <div style={{ marginTop: 6, fontSize: 28, fontWeight: 950, letterSpacing: '-0.02em', color: '#c026d3' }}>
                {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : 'New'}
              </div>
              <div className="meta" style={{ marginTop: 4 }}>
                {profile.completedBookings} Jobs • Verified: {profile.verifiedStatus ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="badge" style={{ borderColor: profile.verifiedStatus ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.20)', background: profile.verifiedStatus ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.10)', color: profile.verifiedStatus ? '#059669' : '#b45309' }}>
              {profile.verifiedStatus ? 'Verified' : 'Pending verification'}
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Customer</th>
                <th>Time</th>
                <th>Status</th>
                <th className="tdRight">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="tdStrong">{b.service.title}</td>
                  <td>{b.customer?.name}</td>
                  <td>{new Date(b.scheduledTime).toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        b.status === 'ACCEPTED'
                          ? 'badge--info'
                          : b.status === 'IN_PROGRESS'
                            ? 'badge--warn'
                            : b.status === 'COMPLETED'
                              ? 'badge--good'
                              : b.status === 'CANCELLED'
                                ? 'badge--danger'
                                : 'badge--info'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="tdRight">
                    {b.status === 'ASSIGNED' && (
                      <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button className="btn-primary btnSmall" onClick={() => updateStatus(b.id, 'ACCEPTED')}>
                          Accept
                        </button>
                        <button className="btn-secondary btnSmall" onClick={() => updateStatus(b.id, 'REJECTED')}>
                          Reject
                        </button>
                      </span>
                    )}
                    {b.status === 'ACCEPTED' && (
                      <button className="btn-primary btnSmall" onClick={() => updateStatus(b.id, 'IN_PROGRESS')}>
                        Start service
                      </button>
                    )}
                    {b.status === 'IN_PROGRESS' && (
                      <button className="btn-primary btnSmall" onClick={() => updateStatus(b.id, 'COMPLETED')}>
                        Mark completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '28px 0', color: '#64748b', fontWeight: 700 }}>
                    No jobs assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

