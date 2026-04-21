import React, { useState, useEffect } from 'react';
import { bookingService, providerService, authService, platformService, notificationService } from '../api';

export default function ProviderDashboard() {
  const [profile, setProfile] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('17:00:00');
  const [message, setMessage] = useState('');

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profRes = await providerService.getProfile(currentUser.id);
      setProfile(profRes.data);
      
      const availRes = await providerService.getMyAvailability();
      setAvailabilities(availRes.data);
      
      const bookRes = await bookingService.getMyBookings();
      setBookings(bookRes.data);

      const servicesRes = await platformService.getServices();
      setServices(servicesRes.data);

      const offeringsRes = await platformService.myOfferings();
      setOfferings(offeringsRes.data);

      const notifRes = await notificationService.list();
      setNotifications(notifRes.data.slice(0, 10));
    } catch (err) { console.error(err); }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    try {
      await providerService.addAvailability({ dayOfWeek, startTime, endTime });
      setMessage('Availability added successfully!');
      fetchData();
    } catch (err) {
      setMessage('Failed to add availability');
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingService.updateStatus(bookingId, newStatus);
      fetchData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleOfferService = async (serviceId) => {
    try {
      await platformService.offerService(serviceId);
      setMessage('Service added to your offerings');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to offer service');
    }
  };

  const offeredServiceIds = new Set((offerings || []).map(o => o.service?.id));

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/70 shadow-sm p-6 sm:p-7">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-indigo-50 to-transparent" />
        <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Provider Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage your schedule and service requests.</p>
          </div>
        {profile && (
          <div className="text-right">
            <div className="text-sm font-medium text-slate-600">Rating</div>
            <div className="text-xl font-bold text-primary-600 flex items-center justify-end">
              <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : 'New'}
            </div>
            <div className="text-xs text-slate-400 mt-1">{profile.completedBookings} Jobs</div>
          </div>
        )}
        </div>
      </header>

      {message && <div className="p-4 bg-green-50 text-green-700 rounded-lg">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Availability Section */}
        <section className="card p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Availability</h2>
          
          <form onSubmit={handleAddAvailability} className="space-y-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">Add New Slot</h3>
            <div>
              <label className="block text-xs text-slate-500">Day</label>
              <select className="input-field mt-1 py-1.5" value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
                {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500">Start</label>
                <input type="time" required className="input-field mt-1 py-1.5" value={startTime} onChange={e => setStartTime(e.target.value + ':00')} />
              </div>
              <div>
                <label className="block text-xs text-slate-500">End</label>
                <input type="time" required className="input-field mt-1 py-1.5" value={endTime} onChange={e => setEndTime(e.target.value + ':00')} />
              </div>
            </div>
            <button type="submit" className="w-full btn-primary py-2 text-sm mt-2">Add Slot</button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {availabilities.map(av => (
              <div key={av.id} className="flex justify-between items-center text-sm p-3 border border-slate-100 rounded-md bg-white shadow-sm">
                <span className="font-medium text-slate-700">{av.dayOfWeek.substring(0,3)}</span>
                <span className="text-slate-500">{av.startTime.substring(0,5)} - {av.endTime.substring(0,5)}</span>
              </div>
            ))}
            {availabilities.length === 0 && <p className="text-sm text-slate-500 italic">No availability set.</p>}
          </div>
        </section>

        {/* Offer Services Section */}
        <section className="card p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">Offer Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(s => (
              <div key={s.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-900">{s.title}</div>
                  <div className="text-xs text-slate-500">{s.durationMinutes} min • ₹{s.price}</div>
                </div>
                <button
                  className="btn-secondary py-1.5 text-sm"
                  disabled={offeredServiceIds.has(s.id)}
                  onClick={() => handleOfferService(s.id)}
                >
                  {offeredServiceIds.has(s.id) ? 'Offered' : 'Offer'}
                </button>
              </div>
            ))}
            {services.length === 0 && <p className="text-sm text-slate-500">No services in catalog yet (ask admin to add).</p>}
          </div>
        </section>

        {/* Notifications */}
        <section className="card p-6 lg:col-span-3">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Notifications</h2>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded border ${n.isRead ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="text-sm font-semibold text-slate-800">{n.title}</div>
                <div className="text-sm text-slate-600">{n.message}</div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications.</p>}
          </div>
        </section>

        {/* Jobs / Bookings Section */}
        <section className="card p-6 lg:col-span-3">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6">Assigned Jobs</h2>
          
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{booking.service.title}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full 
                      ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        booking.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Customer: <span className="font-medium text-slate-800">{booking.customer.name}</span> • {booking.customer.city}</p>
                  <p className="text-sm font-medium text-primary-600 mb-2">
                    {new Date(booking.scheduledTime).toLocaleString()}
                  </p>
                  {booking.customerNotes && (
                    <div className="text-xs bg-slate-50 p-2 rounded text-slate-600 border border-slate-100 mt-2">
                      <span className="font-semibold">Notes:</span> {booking.customerNotes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 min-w-[140px]">
                  {booking.status === 'ASSIGNED' && (
                    <>
                      <button onClick={() => handleUpdateStatus(booking.id, 'ACCEPTED')} className="btn-primary py-1.5 text-sm">Accept Job</button>
                      <button onClick={() => handleUpdateStatus(booking.id, 'REJECTED')} className="btn-secondary text-red-600 py-1.5 text-sm border-red-200 hover:bg-red-50">Reject</button>
                    </>
                  )}
                  {booking.status === 'ACCEPTED' && (
                    <button onClick={() => handleUpdateStatus(booking.id, 'IN_PROGRESS')} className="btn-primary py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500">Start Service</button>
                  )}
                  {booking.status === 'IN_PROGRESS' && (
                    <button onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')} className="btn-primary py-1.5 text-sm bg-green-600 hover:bg-green-700 focus:ring-green-600">Mark Completed</button>
                  )}
                </div>

              </div>
            ))}
            {bookings.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="mt-2 text-sm font-medium text-slate-900">No jobs assigned</p>
                <p className="mt-1 text-xs text-slate-500">Our AI will match you with customers automatically.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
