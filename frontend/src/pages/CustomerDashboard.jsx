import React, { useState, useEffect } from 'react';
import { platformService, bookingService, notificationService, reviewService } from '../api';

export default function CustomerDashboard() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [bookings, setBookings] = useState([]);
  
  const [bookingForm, setBookingForm] = useState(null); // holds service being booked
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [reviewModal, setReviewModal] = useState(null); // booking
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchMyBookings();
    fetchNotifications();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await platformService.getCategories();
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.list();
      setNotifications(res.data.slice(0, 10));
    } catch (err) { console.error(err); }
  };

  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      const res = await platformService.getServicesByCategory(categoryId);
      setServices(res.data);
    } catch (err) { console.error(err); }
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    try {
      // Keep the user's local date-time (do NOT convert to UTC).
      // datetime-local returns "YYYY-MM-DDTHH:mm" so we normalize to seconds.
      const isoTime = scheduledTime.length === 16 ? `${scheduledTime}:00` : scheduledTime;
      await bookingService.requestBooking({
        serviceId: bookingForm.id,
        scheduledTime: isoTime,
        customerNotes: notes
      });
      setMessage('Booking requested successfully! Our AI is assigning the best provider.');
      setBookingForm(null);
      fetchMyBookings();
      fetchNotifications();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to book service');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await reviewService.create({
        bookingId: reviewModal.id,
        rating: reviewRating,
        feedback: reviewFeedback
      });
      setMessage('Review submitted. Thank you!');
      setReviewModal(null);
      setReviewFeedback('');
      setReviewRating(5);
      fetchMyBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/70 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-indigo-50 to-transparent" />
        <div className="relative p-6 sm:p-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-slate-100 w-fit">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
            Customer Dashboard
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Book trusted local services</h1>
          <p className="text-slate-600 mt-2">
            Verified providers + availability + location-aware AI matching.
          </p>
        </div>
      </header>

      {message && (
        <div className="p-4 rounded-md bg-blue-50 text-blue-700 font-medium">
          {message}
        </div>
      )}

      {/* Book a Service Section */}
      <section className="card p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Book a Service</h2>
        
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button key={cat.id} 
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === cat.id 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {selectedCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service.id} className="border border-slate-200 rounded-lg p-5 hover:border-primary-300 transition-colors">
                <h3 className="font-bold text-lg text-slate-900">{service.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{service.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-primary-600 font-bold">${service.price}</span>
                    <span className="text-xs text-slate-500 ml-1">/ {service.durationMinutes} mins</span>
                  </div>
                  <button onClick={() => setBookingForm(service)} className="btn-primary text-xs py-1.5 px-3">
                    Select
                  </button>
                </div>
              </div>
            ))}
            {services.length === 0 && <p className="text-slate-500 text-sm">No services found in this category.</p>}
          </div>
        )}

        {/* Booking Form Modal Overlay */}
        {bookingForm && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="h-2.5 w-full rounded-t-xl bg-gradient-to-r from-primary-500 to-indigo-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Book {bookingForm.title}</h3>
              <p className="text-sm text-slate-500 mb-6">Select your preferred date and time.</p>
              
              <form onSubmit={handleBookService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date & Time</label>
                  <input type="datetime-local" required className="input-field mt-1" 
                    value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Special Instructions (Optional)</label>
                  <textarea className="input-field mt-1 rows-3" placeholder="Any specific requirements..."
                    value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                </div>
                <div className="flex space-x-3 pt-4 border-t">
                  <button type="button" onClick={() => setBookingForm(null)} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary">Confirm Book</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* Booking History */}
      <section className="card p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">My Bookings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookings.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{booking.service.title}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(booking.scheduledTime).toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{booking.provider ? booking.provider.name : 'Assigning...'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        booking.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {booking.status === 'COMPLETED' && (
                      <button className="btn-secondary py-1.5 text-sm" onClick={() => setReviewModal(booking)}>
                        Add review
                      </button>
                    )}
                    {(booking.status === 'ASSIGNED' || booking.status === 'ACCEPTED' || booking.status === 'REQUESTED') && (
                      <button className="btn-secondary py-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50"
                        onClick={async () => { await bookingService.updateStatus(booking.id, 'CANCELLED'); fetchMyBookings(); }}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">You haven't made any bookings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notifications */}
      <section className="card p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Notifications</h2>
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

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Review: {reviewModal.service.title}</h3>
            <p className="text-sm text-slate-500 mb-6">Rate your provider and share feedback.</p>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Rating (1-5)</label>
                <input type="number" min="1" max="5" className="input-field mt-1"
                  value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Feedback</label>
                <textarea className="input-field mt-1" rows="3"
                  value={reviewFeedback} onChange={e => setReviewFeedback(e.target.value)} />
              </div>
              <div className="flex space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setReviewModal(null)} className="flex-1 btn-secondary">Close</button>
                <button type="submit" className="flex-1 btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
