import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, error: apiError, setError: setApiError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setApiError(null);
  }, [setApiError]);

  const isSessionExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setApiError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Handled in Context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans">
      <div className="glass-card p-8 rounded-2xl w-full max-w-md fade-in">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            TaskPulse
          </h1>
          <p className="text-gray-500 text-sm">Access your secure tenant workspace</p>
        </div>

        {isSessionExpired && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 text-sm text-center mb-5 font-semibold">
            Your session has expired. Please log in again.
          </div>
        )}

        {(localError || apiError) && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-error text-sm mb-5 text-left font-semibold">
            {localError || apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-semibold">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-white border border-outline-variant text-on-background placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
              placeholder="e.g. member@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 text-sm font-semibold">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-4 pr-11 py-3 rounded-lg bg-white border border-outline-variant text-on-background placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-on-background cursor-pointer select-none leading-none flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-primary to-primary-container shadow-md hover:shadow-primary/20 transform hover:-translate-y-[1px] transition-all duration-300 cursor-pointer disabled:opacity-50 mt-2"
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-bold transition-colors">
            Create an Organization
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
