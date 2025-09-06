import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SwatchIcon } from '../../components/icons/Icons';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = await login(email, password);
        if (user && user.role === 'admin') {
            navigate('/admin');
        } else {
            setError('Invalid credentials or not an admin account.');
        }
    };

    return (
        <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <div className="flex justify-center items-center mb-6">
                    <SwatchIcon className="h-10 w-10 text-brand-blue" />
                    <h1 className="text-3xl font-bold ml-2 text-brand-gray-800">Lavapp Pro</h1>
                </div>
                <h2 className="text-2xl font-semibold text-center text-brand-gray-700 mb-6">Admin Login</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-brand-gray-600">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full p-3 border border-brand-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 w-full p-3 border border-brand-gray-300 rounded-lg"
                        />
                         <p className="text-xs text-gray-400 mt-1">Hint: Use 'admin@lavapp.com' and 'password123'</p>
                    </div>
                    <button type="submit" className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-blue-dark">
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
