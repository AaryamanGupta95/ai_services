import React, { useEffect, useMemo, useState } from 'react';
import { platformService, providerService } from '../../api';

export default function ProviderSchedule() {
  const [availabilities, setAvailabilities] = useState([]);
  const [services, setServices] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [message, setMessage] = useState('');

  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('17:00:00');

  const load = async () => {
    const availRes = await providerService.getMyAvailability();
    setAvailabilities(availRes.data || []);

    const servicesRes = await platformService.getServices();
    setServices(servicesRes.data || []);

    const offeringsRes = await platformService.myOfferings();
    setOfferings(offeringsRes.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const offeredServiceIds = useMemo(
    () => new Set((offerings || []).map((o) => o.service?.id)),
    [offerings]
  );

  const addAvailability = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await providerService.addAvailability({
        dayOfWeek,
        startTime,
        endTime,
      });
      setMessage('Availability added successfully!');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add availability');
    }
  };

  const offerService = async (serviceId) => {
    setMessage('');
    try {
      await platformService.offerService(serviceId);
      setMessage('Service added to your offerings');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to offer service');
    }
  };

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeaderInner">
          <div className="pagePill">
            <span className="pagePillDot" />
            Schedule
          </div>
          <h1 className="pageTitle">Set availability & offer services</h1>
          <p className="pageSubtitle">Providers must be verified and available to be assigned.</p>
        </div>
      </header>

      {message && (
        <div className="alert alert--info">{message}</div>
      )}

      <div className="grid2" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
        <section className="panel">
          <h2 className="panelTitle">Availability</h2>
          <p className="panelDesc">Add time slots for matching.</p>

          <form onSubmit={addAvailability} className="authForm" style={{ marginTop: 14 }}>
            <div className="authField">
              <label className="authLabel">Day</label>
              <select
                className="authInput authSelect"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
              >
                {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="authRow">
              <div className="authField">
                <label className="authLabel">Start</label>
                <input
                  type="time"
                  className="authInput"
                  value={startTime.slice(0,5)}
                  onChange={(e) => setStartTime(`${e.target.value}:00`)}
                />
              </div>
              <div className="authField">
                <label className="authLabel">End</label>
                <input
                  type="time"
                  className="authInput"
                  value={endTime.slice(0,5)}
                  onChange={(e) => setEndTime(`${e.target.value}:00`)}
                />
              </div>
            </div>
            <div className="authActions">
              <button className="btn-primary btnSmall" type="submit">Add slot</button>
            </div>
          </form>

          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {availabilities.map((av) => (
              <div key={av.id} className="cardItem" style={{ padding: 12 }}>
                <div className="rowBetween">
                  <span className="tdStrong">{av.dayOfWeek?.slice(0, 3)}</span>
                  <span className="meta">{av.startTime?.slice(0,5)} - {av.endTime?.slice(0,5)}</span>
                </div>
              </div>
            ))}
            {availabilities.length === 0 && (
              <div className="panelDesc" style={{ fontStyle: 'italic' }}>No availability added yet.</div>
            )}
          </div>
        </section>

        <section className="panel">
          <h2 className="panelTitle">Offer services</h2>
          <p className="panelDesc">Select which services you can provide.</p>

          <div className="grid2" style={{ marginTop: 14 }}>
            {services.map((s) => (
              <div key={s.id} className="cardItem">
                <div className="cardItemTop">
                  <div>
                    <div className="tdStrong">{s.title}</div>
                    <div className="meta" style={{ marginTop: 4 }}>
                      {s.durationMinutes} mins • ₹{s.price}
                    </div>
                    <div className="meta" style={{ marginTop: 6 }}>
                      Category: {s.category?.name || '-'}
                    </div>
                  </div>
                  <button
                    className="btn-secondary btnSmall"
                    disabled={offeredServiceIds.has(s.id)}
                    onClick={() => offerService(s.id)}
                    style={{
                      opacity: offeredServiceIds.has(s.id) ? 0.6 : 1,
                      cursor: offeredServiceIds.has(s.id) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {offeredServiceIds.has(s.id) ? 'Offered' : 'Offer'}
                  </button>
                </div>
                {s.description && (
                  <div className="cardText">{s.description}</div>
                )}
              </div>
            ))}
            {services.length === 0 && (
              <div className="panelDesc" style={{ textAlign: 'center', padding: '28px 0' }}>No catalog items yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

