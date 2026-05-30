import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupType, setSignupType] = useState('new'); // 'new' or 'join'
  const [tenantName, setTenantName] = useState('');
  const [tenantId, setTenantId] = useState('');
  
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signup, error: apiError, setError: setApiError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setApiError(null);
  }, [setApiError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setApiError(null);

    if (!name || !email || !password) {
      setLocalError('Please fill in all core fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (signupType === 'new' && !tenantName.trim()) {
      setLocalError('Please provide an Organization name to create.');
      return;
    }

    if (signupType === 'join' && !tenantId.trim()) {
      setLocalError('Please provide the Organization Tenant ID code to join.');
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: signupType === 'new' ? 'ADMIN' : 'MEMBER',
        tenantName: signupType === 'new' ? tenantName.trim() : null,
        tenantId: signupType === 'join' ? tenantId.trim() : null
      });
      navigate('/dashboard');
    } catch (err) {
      // Handled in Context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 font-sans">
      <div className="glass-card p-8 rounded-2xl w-full max-w-lg fade-in">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Get Started
          </h1>
          <p className="text-gray-500 text-sm">Set up your secure multi-tenant workspace</p>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-surface-container-low border border-outline-variant/40 p-1 rounded-xl mb-6">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer ${
              signupType === 'new'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:text-on-background hover:bg-white/40'
            }`}
            onClick={() => {
              setSignupType('new');
              setLocalError('');
              setApiError(null);
            }}
          >
            Create Organization
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all duration-300 cursor-pointer ${
              signupType === 'join'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:text-on-background hover:bg-white/40'
            }`}
            onClick={() => {
              setSignupType('join');
              setLocalError('');
              setApiError(null);
            }}
          >
            Join Organization
          </button>
        </div>

        {(localError || apiError) && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-error text-sm mb-5 text-left font-semibold">
            {localError || apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-semibold">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-white border border-outline-variant text-on-background placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
              placeholder="e.g. Peter Parker"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 text-sm font-semibold">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-white border border-outline-variant text-on-background placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
              placeholder="e.g. peter@stark.com"
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
                placeholder="Min. 6 characters"
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

          {signupType === 'new' ? (
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-semibold">
                Company / Organization Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-white border border-outline-variant text-on-background placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
                placeholder="e.g. Stark Industries"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                disabled={submitting}
              />
              <span className="text-2xs text-gray-500 block mt-1.5 font-medium">
                Creating an organization registers you automatically as the Administrator.
              </span>
            </div>
          ) : (
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-semibold">
                Organization Tenant ID Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-white border border-outline-variant text-on-background placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
                placeholder="e.g. 475403db-8adc-49f3-b307..."
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                disabled={submitting}
              />
              <span className="text-2xs text-gray-500 block mt-1.5 font-medium">
                Paste the specific Tenant ID code shared by your company's Administrator.
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-primary to-primary-container shadow-md hover:shadow-primary/20 transform hover:-translate-y-[1px] transition-all duration-300 cursor-pointer disabled:opacity-50 mt-2"
            disabled={submitting}
          >
            {submitting ? 'Setting up Workspace...' : signupType === 'new' ? 'Create & Sign Up' : 'Join & Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold transition-colors">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;
