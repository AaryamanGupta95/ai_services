import React, { useEffect, useState } from 'react';
import { providerService, reviewService } from '../../api';
import { authService } from '../../api';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString();
}

export default function ProviderProfile() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState('');
  const currentUser = authService.getCurrentUser();

  const load = async () => {
    try {
      const profRes = await providerService.getProfile(currentUser.id);
      setProfile(profRes.data);
      const revRes = await reviewService.myProviderReviews();
      setReviews(revRes.data || []);
    } catch (e) {
      setProfile(null);
      setReviews([]);
    }
  };

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeaderInner">
          <div className="pagePill">
            <span className="pagePillDot" />
            Provider profile
          </div>
          <h1 className="pageTitle">Your reputation & feedback</h1>
          <p className="pageSubtitle">Average rating updates automatically after completed bookings.</p>
        </div>
      </header>

      {message && (
        <div className="alert alert--error">{message}</div>
      )}

      {profile && (
        <section className="panel">
          <div className="grid2">
            <div className="cardItem">
              <div className="panelDesc" style={{ margin: 0, fontWeight: 800 }}>Average rating</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 950, letterSpacing: '-0.02em', color: '#c026d3' }}>
                {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : 'New'}
              </div>
              <div className="meta" style={{ marginTop: 4 }}>Completed: {profile.completedBookings}</div>
            </div>

            <div className="cardItem">
              <div className="panelDesc" style={{ margin: 0, fontWeight: 800 }}>Verification</div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div className="tdStrong">{profile.verifiedStatus ? 'Verified provider' : 'Pending verification'}</div>
                <span className={`badge ${profile.verifiedStatus ? 'badge--good' : 'badge--warn'}`}>
                  {profile.verifiedStatus ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="cardText" style={{ marginTop: 10 }}>Admin approval is required for AI matching.</div>
              {profile.bio && <div className="cardText">{profile.bio}</div>}
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <h2 className="panelTitle">Reviews</h2>
        <p className="panelDesc">Based on completed bookings.</p>
        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          {reviews.map((r) => (
            <div key={r.id} className="cardItem">
              <div className="rowBetween">
                <div className="tdStrong">Rating: {r.rating}/5</div>
                <div className="meta">{formatDate(r.createdAt)}</div>
              </div>
              {r.feedback && <div className="cardText">{r.feedback}</div>}
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="panelDesc" style={{ textAlign: 'center', padding: '28px 0' }}>No reviews yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

