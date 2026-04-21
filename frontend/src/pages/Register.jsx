import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { authService } from '../api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'CUSTOMER', city: '', phone: ''
  });
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ latitude: lat, longitude: lon });
          
          try {
             const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
             const data = await res.json();
             const detectedCity = data.address.city || data.address.town || data.address.village || data.address.county;
             if (detectedCity) {
                setFormData(prev => ({ ...prev, city: detectedCity }));
                setSuccess(`Location captured! City detected: ${detectedCity}`);
             } else {
                setSuccess('Coordinates captured successfully!');
             }
          } catch(e) {
             setSuccess('Coordinates captured successfully!');
          }
        },
        (err) => {
          setError('Could not get location. Type it manually.');
        }
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, ...coords };
      await authService.register(payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="authPage">
      <div className="authGrid authGrid--register">
        <aside className="authSide authSide--register">
          <div className="authPill authPill--alt">
            <span className="authPillDot authPillDot--alt" />
            Women professionals
          </div>
          <h2 className="authSideTitle">Create your profile and start delivering.</h2>
          <p className="authSideText">
            Customers book services; verified providers accept/reject. AI matching helps assign the best provider at booking time.
          </p>

          <div className="authHighlights">
            <div className="authHighlight">
              <div className="authIcon authIcon--ai">A</div>
              <div>
                <div className="authHighlightTitle">AI assignment</div>
                <div className="authHighlightDesc">Location + availability + ratings</div>
              </div>
            </div>
            <div className="authHighlight">
              <div className="authIcon authIcon--verify">V</div>
              <div>
                <div className="authHighlightTitle">Verification</div>
                <div className="authHighlightDesc">Admin approves providers</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="authCard">
          <div className="authHeader authHeader--register">
            <h2 className="authTitle authTitle--center">Create an account</h2>
            <p className="authSubtitle authSubtitle--center">
              Already have one?{' '}
              <Link className="authLink" to="/login">
                Sign in here
              </Link>
            </p>
          </div>

          {error && <div className="authAlert authAlert--error">{error}</div>}
          {success && <div className="authAlert authAlert--success">{success}</div>}

          <form className="authForm" onSubmit={handleRegister} autoComplete="off">
            <div className="authRow">
              <div className="authField">
                <label className="authLabel">Full Name</label>
                <input
                  type="text"
                  required
                  className="authInput"
                  autoComplete="none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="authField">
                <label className="authLabel">Role</label>
                <select
                  className="authInput authSelect"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="PROVIDER">Provider</option>
                </select>
              </div>
            </div>

            <div className="authField">
              <label className="authLabel">Email address</label>
              <input
                type="email"
                required
                className="authInput"
                autoComplete="none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="authField">
              <label className="authLabel">Password</label>
              <input
                type="password"
                required
                className="authInput"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="authRow">
              <div className="authField">
                <label className="authLabel">Phone</label>
                <input
                  type="tel"
                  className="authInput"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="authField" style={{ position: 'relative' }}>
                <label className="authLabel">City (Required)</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    className="authInput"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ flex: 1, paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={handleLocation} 
                    title="Auto-detect location"
                    style={{ 
                      position: 'absolute', right: '10px', top: '34px', 
                      background: 'none', border: 'none', cursor: 'pointer', color: '#111827'
                    }}
                  >
                    <MapPin size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="authActions authActions--center">
              <button type="submit" className="authBtn authBtn--primary">
                Register Account
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
