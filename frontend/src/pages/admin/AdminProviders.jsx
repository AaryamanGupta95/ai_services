import React, { useEffect, useState } from 'react';
import { adminService } from '../../api';

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const res = await adminService.providers();
      setProviders(res.data || []);
    } catch (e) {
      setProviders([]);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const toggleVerify = async (userId, verified) => {
    setMessage('');
    try {
      await adminService.verifyProvider(userId, !verified);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update provider');
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeaderInner">
          <div className="pagePill">
            <span className="pagePillDot" />
            Admin
          </div>
          <h1 className="pageTitle">Provider verification</h1>
          <p className="pageSubtitle">Approve providers to enable AI matching.</p>
        </div>
      </header>

      {message && (
        <div className="alert alert--error">{message}</div>
      )}

      <section className="panel">
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>City</th>
                <th>Verified</th>
                <th className="tdRight">Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="tdStrong">{p.user?.name}</div>
                    <div className="meta">{p.user?.email}</div>
                  </td>
                  <td>{p.user?.city}</td>
                  <td>
                    <span className={`badge ${p.verifiedStatus ? 'badge--good' : 'badge--warn'}`}>
                      {p.verifiedStatus ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="tdRight">
                    <button
                      className="btn-primary btnSmall"
                      onClick={() => toggleVerify(p.user.id, p.verifiedStatus)}
                    >
                      {p.verifiedStatus ? 'Unverify' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '28px 0', color: '#64748b', fontWeight: 700 }}>No providers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

