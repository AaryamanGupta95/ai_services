import React, { useEffect, useState } from 'react';
import { notificationService } from '../../api';

export default function ProviderNotifications() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const res = await notificationService.list();
      setItems(res.data || []);
    } catch (e) {
      setItems([]);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const markRead = async (id) => {
    setMessage('');
    try {
      await notificationService.markRead(id);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeaderInner">
          <div className="pagePill">
            <span className="pagePillDot" />
            Notifications
          </div>
          <h1 className="pageTitle">Job updates & alerts</h1>
          <p className="pageSubtitle">When customers book and when services progress.</p>
        </div>
      </header>

      {message && (
        <div className="alert alert--error">{message}</div>
      )}

      <section className="panel">
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((n) => (
            <div
              key={n.id}
              className="cardItem"
              style={{
                background: n.isRead ? '#ffffff' : 'rgba(194, 38, 211, 0.06)',
                borderColor: n.isRead ? '#f1f5f9' : 'rgba(194, 38, 211, 0.18)'
              }}
            >
              <div className="rowBetween" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div className="tdStrong">{n.title}</div>
                  <div className="cardText" style={{ marginTop: 6 }}>{n.message}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="meta">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </div>
                  {!n.isRead && (
                    <button className="btn-secondary btnSmall" style={{ marginTop: 10 }} onClick={() => markRead(n.id)}>
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="panelDesc" style={{ textAlign: 'center', padding: '28px 0' }}>No notifications yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

