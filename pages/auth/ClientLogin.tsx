import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ClientLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = await login(email, password);
        if (user) {
            navigate('/profile');
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-4xl font-bold text-center mb-2 text-purple-600">🧺 Lavapp</h1>
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Welcome Back!</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
                        />
                        <p className="text-xs text-gray-400 mt-1">Hint: Try 'john.doe@example.com' and 'password123'</p>
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700">
                        Login
                    </button>
                </form>
                <p className="text-center mt-6 text-sm">
                    Don't have an account? <Link to="/signup" className="text-purple-600 font-semibold hover:underline">Sign up</Link>
                </p>
                 <p className="text-center mt-2 text-sm">
                    <Link to="/" className="text-gray-500 hover:underline">← Back to Order Page</Link>
                </p>
            </div>
        </div>
    );
};

export default ClientLogin;
