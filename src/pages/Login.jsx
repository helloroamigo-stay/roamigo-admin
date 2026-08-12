import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, ShieldAlert, Loader2 } from 'lucide-react';

const Login = () => {
  const { login, error: authError, setError } = useAuth();
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setFormError('');
      await login(email, password);
    } catch (err) {

      setFormError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[60%] rounded-full bg-[#bf923c]/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4 animate-pulse">
            <Compass className="w-8 h-8 text-white stroke-[1.5]" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">
            Roamigo <span className="text-brand-400">Admin</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Luxury Vacation Rentals Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111827]/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

          {(formError || authError) && (
            <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-2xl p-4 mb-6 text-red-300 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>{formError || authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@roamigo.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError('');
                    setError(null);
                  }}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError('');
                    setError(null);
                  }}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-2xl font-semibold shadow-lg shadow-brand-600/10 hover:shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Quick Help note */}
        <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
          Use the seeded administrator credentials:<br />
          <span className="text-gray-400 font-mono">admin@roamigo.in</span> / <span className="text-gray-400 font-mono">Password123</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
