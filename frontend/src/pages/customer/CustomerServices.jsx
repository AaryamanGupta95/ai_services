import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformService, bookingService } from '../../api';

function formatLocalDateTimeForInput(isoValue) {
  if (!isoValue) return '';
  return isoValue.length >= 16 ? isoValue.slice(0, 16) : isoValue;
}

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d5db', fontSize: 16 }}>★</span>
    );
  }
  return <span>{stars}</span>;
}

export default function CustomerServices() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  // Booking flow state
  const [bookingService_, setBookingService] = useState(null); // the service being booked
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => {
      const hay = `${s.title || ''} ${s.description || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [services, search]);

  useEffect(() => {
    platformService.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (selectedCategory === 'ALL') {
          const res = await platformService.getServices();
          setServices(res.data);
        } else {
          const res = await platformService.getServicesByCategory(selectedCategory);
          setServices(res.data);
        }
      } catch (e) {
        setServices([]);
      }
    };
    load();
  }, [selectedCategory]);

  const openBooking = async (service) => {
    setBookingService(service);
    setSelectedProvider(null);
    setNotes('');
    setMessage('');
    const d = new Date();
    d.setHours(d.getHours() + 1);
    const iso = d.toISOString().slice(0, 19);
    setScheduledTime(formatLocalDateTimeForInput(iso));

    // Load providers for this service
    setLoadingProviders(true);
    try {
      const res = await platformService.getProvidersForService(service.id);
      setProviders(res.data || []);
    } catch (e) {
      setProviders([]);
    }
    setLoadingProviders(false);
  };

  const closeBooking = () => {
    setBookingService(null);
    setScheduledTime('');
    setNotes('');
    setProviders([]);
    setSelectedProvider(null);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      const isoTime = scheduledTime.length === 16 ? `${scheduledTime}:00` : scheduledTime;
      await bookingService.requestBooking({
        serviceId: bookingService_.id,
        providerId: selectedProvider?.userId || null,
        scheduledTime: isoTime,
        customerNotes: notes,
      });
      closeBooking();
      navigate('/customer/bookings');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to request booking');
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeaderInner">
          <div className="pagePill">
            <span className="pagePillDot" />
            Find & book services
          </div>
          <h1 className="pageTitle">Choose a service, then book a time</h1>
          <p className="pageSubtitle">Browse services, view provider profiles & reviews, and book with confidence.</p>
        </div>
      </header>

      {message && (
        <div className="alert alert--error">{message}</div>
      )}

      <section className="panel">
        <div className="rowBetween" style={{ marginBottom: 12 }}>
          <div className="pillRow">
            <button
              className={`pillBtn ${selectedCategory === 'ALL' ? 'pillBtn--active' : ''}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`pillBtn ${selectedCategory === cat.id ? 'pillBtn--active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="searchBox">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="authInput"
            />
          </div>
        </div>

        <div className="grid3">
          {filteredServices.map((service) => (
            <div key={service.id} className="cardItem">
              <div className="cardItemTop">
                <div>
                  <div className="mutedUpper">{service.category?.name || 'Service'}</div>
                  <div className="cardTitle">{service.title}</div>
                </div>
                <div className="priceBox">
                  <div className="price">₹{service.price}</div>
                  <div className="meta">{service.durationMinutes} mins</div>
                </div>
              </div>

              <div className="cardText">{service.description}</div>

              <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn-primary btnSmall" onClick={() => openBooking(service)}>
                  Book
                </button>
              </div>
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="panelDesc" style={{ textAlign: 'center', padding: '28px 0' }}>
              No services found. Try a different category or search term.
            </div>
          )}
        </div>
      </section>

      {/* ===== BOOKING MODAL WITH PROVIDER SELECTION ===== */}
      {bookingService_ && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modalTopBar" />
            <div className="modalBody" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <h3 className="modalTitle">{bookingService_.title}</h3>
              <p className="modalText">Select a provider, choose a date and time to book.</p>

              {/* Provider Selection */}
              <div style={{ marginTop: 16 }}>
                <div className="authLabel" style={{ marginBottom: 10, fontSize: 14 }}>Choose a Provider</div>

                {loadingProviders ? (
                  <div className="panelDesc" style={{ textAlign: 'center', padding: '16px 0' }}>Loading providers...</div>
                ) : providers.length === 0 ? (
                  <div className="panelDesc" style={{ textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
                    No providers currently offer this service. AI will try to match automatically.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {providers.map((p) => {
                      const isSelected = selectedProvider?.userId === p.userId;
                      return (
                        <div
                          key={p.userId}
                          onClick={() => setSelectedProvider(isSelected ? null : p)}
                          style={{
                            border: isSelected ? '2px solid #000' : '1px solid #e5e7eb',
                            background: isSelected ? 'rgba(0,0,0,0.03)' : '#fff',
                            padding: '14px 16px',
                            cursor: 'pointer',
                            transition: 'all 150ms ease',
                            boxShadow: isSelected ? '4px 4px 0px rgba(0,0,0,1)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div>
                              <div style={{ fontWeight: 900, fontSize: 15, color: '#0f172a' }}>{p.name}</div>
                              <div className="meta" style={{ marginTop: 2 }}>
                                {p.city || 'Unknown city'} • {p.experienceYears || 0} yrs experience
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <StarRating rating={Math.round(p.averageRating || 0)} />
                                <span style={{ fontWeight: 900, fontSize: 14, color: '#0f172a' }}>
                                  {p.averageRating > 0 ? p.averageRating.toFixed(1) : 'New'}
                                </span>
                              </div>
                              <div className="meta" style={{ marginTop: 2 }}>{p.completedBookings || 0} jobs done</div>
                            </div>
                          </div>

                          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span className={`badge ${p.verifiedStatus ? 'badge--good' : 'badge--warn'}`} style={{ fontSize: 11 }}>
                              {p.verifiedStatus ? '✓ Verified' : 'Pending'}
                            </span>
                            {isSelected && (
                              <span className="badge badge--info" style={{ fontSize: 11 }}>✓ Selected</span>
                            )}
                          </div>

                          {p.bio && (
                            <div className="cardText" style={{ marginTop: 8, fontSize: 13 }}>{p.bio}</div>
                          )}

                          {/* Reviews */}
                          {p.reviews && p.reviews.length > 0 && (
                            <div style={{ marginTop: 10, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                              <div style={{ fontSize: 12, fontWeight: 900, color: '#64748b', marginBottom: 6 }}>
                                REVIEWS ({p.reviews.length})
                              </div>
                              {p.reviews.slice(0, 3).map((r, idx) => (
                                <div key={idx} style={{ marginBottom: 6, fontSize: 13, color: '#475569' }}>
                                  <StarRating rating={r.rating} />
                                  <span style={{ marginLeft: 6, fontWeight: 700 }}>{r.customerName}</span>
                                  {r.feedback && <div style={{ marginTop: 2, color: '#64748b' }}>"{r.feedback}"</div>}
                                </div>
                              ))}
                              {p.reviews.length > 3 && (
                                <div className="meta">+{p.reviews.length - 3} more reviews</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Booking Form */}
              <form onSubmit={submitBooking} className="authForm" style={{ marginTop: 16 }}>
                <div className="authField">
                  <label className="authLabel">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="authInput"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
                <div className="authField">
                  <label className="authLabel">Special Instructions (Optional)</label>
                  <textarea
                    className="authInput"
                    rows={3}
                    placeholder="Anything the provider should know..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {message && (
                  <div className="authAlert authAlert--error">{message}</div>
                )}

                <div className="modalActions">
                  <button type="button" onClick={closeBooking} className="btn-secondary btnSmall">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary btnSmall">
                    {selectedProvider ? `Book with ${selectedProvider.name}` : 'Book (AI auto-assign)'}
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
