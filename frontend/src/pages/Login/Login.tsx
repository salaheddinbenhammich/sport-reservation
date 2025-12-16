import React, { useState } from 'react';
import InputField from '../../components/InputField';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // ADDED useLocation
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); 
  const { login, loading } = useAuth();

  // Extract redirect URL if exists
  const params = new URLSearchParams(location.search);
  const redirectUrl = params.get("redirect");

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) ? '' : 'Invalid email format';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passError = validatePassword(password);
    if (emailError || passError) {
      setErrors({ email: emailError, password: passError });
      return;
    }

    setError('');
    const success = await login(email, password);
    if (success) {
      // ✅ Redirect to the page user came from
      navigate(redirectUrl || "/"); 
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen p-2 bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/images/test.jpg')" }}
    >
      <div className="absolute inset-0 z-0 bg-black/40" />
      <div className="relative z-10 flex h-[90vh] w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-white">
        <div className="relative hidden w-1/2 bg-center bg-cover md:flex"
          style={{ backgroundImage: "url('/images/panel.png')" }}>
          <div className="absolute z-10 w-full text-sm text-center text-white bottom-4 right-7 opacity-80">
            Developed by <span className="font-semibold">Salaheddin</span>!
          </div>
        </div>
        <div
          className="relative flex flex-col items-center justify-center w-full bg-center bg-cover md:w-1/2"
          style={{
            backgroundImage: "url('/src/assets/maradona.png')",
          }}
        >
          <form
            onSubmit={handleLogin}
            className="p-10 space-y-6 bg-white shadow-xl rounded-xl w-80 sm:w-96 opacity-90"
          >
            <h2 className="text-3xl font-semibold text-center text-gray-800">
              Sign in to your account
            </h2>

            {error && <p className="text-center text-red-500">{error}</p>}

            <InputField
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() =>
                setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
              }
              placeholder="you@example.com"
              error={errors.email}
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() =>
                setErrors((prev) => ({ ...prev, password: validatePassword(password) }))
              }
              placeholder="********"
              error={errors.password}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 font-semibold text-white transition-all duration-200 bg-green-600 rounded-lg shadow-md hover:bg-green-700"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-sm text-center text-gray-600">
              Don’t have an account?{' '}
              <Link to="/register" className="font-medium text-green-600 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
