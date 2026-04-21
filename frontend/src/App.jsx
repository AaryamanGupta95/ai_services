import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerServices from './pages/customer/CustomerServices';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerNotifications from './pages/customer/CustomerNotifications';
import ProviderJobs from './pages/provider/ProviderJobs';
import ProviderSchedule from './pages/provider/ProviderSchedule';
import ProviderProfile from './pages/provider/ProviderProfile';
import ProviderNotifications from './pages/provider/ProviderNotifications';
import AdminProviders from './pages/admin/AdminProviders';
import AdminCatalog from './pages/admin/AdminCatalog';
import { authService } from './api';

const PrivateRoute = ({ children, role }) => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  const refreshUser = useMemo(() => () => {
    try {
      setUser(authService.getCurrentUser());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Same-tab auth updates (login/logout) won't trigger the 'storage' event,
    // so we also listen to a custom 'authChanged' event.
    const onAuthChanged = () => refreshUser();
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'user') refreshUser();
    };

    window.addEventListener('authChanged', onAuthChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('authChanged', onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshUser]);

  return (
    <Router>
      <div className="appShell">
        <nav className="appNav">
          <div className="container">
            <div className="navInner">
              <div className="brand">
                <div className="brandMark" />
                <div>
                  <h1 className="brandTitle">AI Local Services</h1>
                  <p className="brandTagline">Book with confidence • Providers stay in control</p>
                </div>
              </div>

              {user ? (
                <div className="navRight">
                  <div className="helloPill">Hello, {user.name}</div>

                  <div className="navLinks">
                    {user.role === 'ROLE_CUSTOMER' && (
                      <>
                        <Link to="/customer/services" className="navLink">Services</Link>
                        <Link to="/customer/bookings" className="navLink">My Bookings</Link>
                        <Link to="/customer/notifications" className="navLink">Notifications</Link>
                      </>
                    )}
                    {user.role === 'ROLE_PROVIDER' && (
                      <>
                        <Link to="/provider/jobs" className="navLink">Jobs</Link>
                        <Link to="/provider/schedule" className="navLink">Schedule</Link>
                        <Link to="/provider/profile" className="navLink">Profile</Link>
                        <Link to="/provider/notifications" className="navLink">Notifications</Link>
                      </>
                    )}
                    {user.role === 'ROLE_ADMIN' && (
                      <>
                        <Link to="/admin/providers" className="navLink">Providers</Link>
                        <Link to="/admin/catalog" className="navLink">Catalog</Link>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      authService.logout();
                      window.dispatchEvent(new Event('authChanged'));
                      window.location.href = '/login';
                    }}
                    className="logoutBtn"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </nav>

        <main className="appMain">
          <div className="pageBg" />
          <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Backward-compatible redirects (older links may point to these) */}
            <Route path="/customer" element={<Navigate to="/customer/services" replace />} />
            <Route path="/provider" element={<Navigate to="/provider/jobs" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/providers" replace />} />

            <Route path="/customer/services" element={
              <PrivateRoute role="ROLE_CUSTOMER">
                <CustomerServices />
              </PrivateRoute>
            } />
            <Route path="/customer/bookings" element={
              <PrivateRoute role="ROLE_CUSTOMER">
                <CustomerBookings />
              </PrivateRoute>
            } />
            <Route path="/customer/notifications" element={
              <PrivateRoute role="ROLE_CUSTOMER">
                <CustomerNotifications />
              </PrivateRoute>
            } />

            <Route path="/provider/jobs" element={
              <PrivateRoute role="ROLE_PROVIDER">
                <ProviderJobs />
              </PrivateRoute>
            } />
            <Route path="/provider/schedule" element={
              <PrivateRoute role="ROLE_PROVIDER">
                <ProviderSchedule />
              </PrivateRoute>
            } />
            <Route path="/provider/profile" element={
              <PrivateRoute role="ROLE_PROVIDER">
                <ProviderProfile />
              </PrivateRoute>
            } />
            <Route path="/provider/notifications" element={
              <PrivateRoute role="ROLE_PROVIDER">
                <ProviderNotifications />
              </PrivateRoute>
            } />

            <Route path="/admin/providers" element={
              <PrivateRoute role="ROLE_ADMIN">
                <AdminProviders />
              </PrivateRoute>
            } />
            <Route path="/admin/catalog" element={
              <PrivateRoute role="ROLE_ADMIN">
                <AdminCatalog />
              </PrivateRoute>
            } />

            <Route path="/" element={
              user ? (
                user.role === 'ROLE_CUSTOMER'
                  ? <Navigate to="/customer/services" />
                  : user.role === 'ROLE_PROVIDER'
                    ? <Navigate to="/provider/jobs" />
                    : <Navigate to="/admin/providers" />
              ) : (
                <Navigate to="/login" />
              )
            } />
          </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
