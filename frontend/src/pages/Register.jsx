import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const { firstName, lastName, email, password, confirmPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const res = await register({ firstName, lastName, email, password });
        if (res.success) {
            navigate('/customer/dashboard');
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
                        Create an Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join Mahalaxmi Tailoring for exclusive designs
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="flex gap-2 mb-4">
                            <input
                                name="firstName"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-1/2 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                                placeholder="First Name"
                                value={firstName}
                                onChange={onChange}
                            />
                            <input
                                name="lastName"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-1/2 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={onChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-maroon hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition duration-150"
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link to="/login" className="font-medium text-brand-maroon hover:text-brand-gold">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
