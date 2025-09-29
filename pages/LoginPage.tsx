import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BuildingIcon } from '../components/icons/Icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@nyumbasys.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        navigate('/');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-xl border border-border shadow-xl">
        <div className="text-center">
            <BuildingIcon className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl font-bold text-text-primary">NyumbaSys</h1>
            <p className="mt-2 text-text-secondary">Sign in to manage your properties</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 text-text-primary p-3 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
           {error && <p className="text-sm text-danger text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-500 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
         <div className="text-center text-sm text-text-secondary space-y-2">
            <p><strong>Test Credentials:</strong></p>
            <p><strong>Admin:</strong> admin@nyumbasys.com (pw: adminpass)</p>
            <p><strong>Accountant:</strong> accountant@nyumbasys.com (pw: accountantpass)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;