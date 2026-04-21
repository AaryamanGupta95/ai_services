import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      }));
      window.dispatchEvent(new Event('authChanged'));
      
      if (response.data.role === 'ROLE_CUSTOMER') {
        navigate('/customer/services');
      } else {
        if (response.data.role === 'ROLE_PROVIDER') {
          navigate('/provider/jobs');
        } else {
          navigate('/admin/providers');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="authPage">
      <div className="authGrid">
        <aside className="authSide">
          <div className="authPill">
            <span className="authPillDot" />
            AI matching powered
          </div>

          <h2 className="authSideTitle">Find the best provider in seconds.</h2>
          <p className="authSideText">
            Verified providers + availability + location-aware scoring. Clean booking flow for customers and providers.
          </p>

          <div className="authSteps">
            <div className="authStep">
              <div className="authStepNum authStepNum--one">1</div>
              <div>
                <div className="authStepLabel">Book</div>
                <div className="authStepDesc">Select service + time</div>
              </div>
            </div>
            <div className="authStep">
              <div className="authStepNum authStepNum--two">2</div>
              <div>
                <div className="authStepLabel">Assign</div>
                <div className="authStepDesc">AI selects best match</div>
              </div>
            </div>
            <div className="authStep">
              <div className="authStepNum authStepNum--three">3</div>
              <div>
                <div className="authStepLabel">Deliver</div>
                <div className="authStepDesc">Accept/reject + completion</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="authCard">
          <div className="authHeader">
            <h2 className="authTitle">Sign in</h2>
            <p className="authSubtitle">
              Or{' '}
              <Link className="authLink" to="/register">
                register a new account
              </Link>
            </p>
          </div>

          {error && <div className="authAlert authAlert--error">{error}</div>}

          <form className="authForm" onSubmit={handleLogin}>
            <div className="authField">
              <label className="authLabel">Email address</label>
              <input
                type="email"
                required
                className="authInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="authField">
              <label className="authLabel">Password</label>
              <input
                type="password"
                required
                className="authInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="authActions">
              <button type="submit" className="authBtn authBtn--primary">
                Sign in
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
