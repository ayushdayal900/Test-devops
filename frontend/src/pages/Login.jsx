import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            if (res.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/customer/dashboard');
            }
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-ivory py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-brand-gold/20">
                <div>
                    <img src="/logo.png" alt="Mahalaxmi Tailors" className="h-20 mx-auto mb-4" />
                    <h2 className="mt-6 text-center text-3xl font-serif font-bold text-brand-maroon">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to access your orders and designs
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-maroon hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition duration-150"
                        >
                            Sign In
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <span className="text-gray-500">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-brand-maroon hover:text-brand-gold">
                            Register now
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
