import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../../services/api';

const ClientSignup: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', pass: '', confirmPass: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.pass !== formData.confirmPass) {
            setError("Passwords do not match.");
            return;
        }
        const user = await api.signup(formData);
        if (user) {
            navigate('/profile'); // Log them in and redirect
        } else {
            setError('An account with this email already exists.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-4xl font-bold text-center mb-2 text-purple-600">🧺 Lavapp</h1>
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Create Your Account</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="w-full p-3 border rounded-lg" />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full p-3 border rounded-lg" />
                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Phone" required className="w-full p-3 border rounded-lg" />
                    <input name="address" value={formData.address} onChange={handleChange} placeholder="Full Address" required className="w-full p-3 border rounded-lg" />
                    <input name="pass" type="password" value={formData.pass} onChange={handleChange} placeholder="Password" required className="w-full p-3 border rounded-lg" />
                    <input name="confirmPass" type="password" value={formData.confirmPass} onChange={handleChange} placeholder="Confirm Password" required className="w-full p-3 border rounded-lg" />
                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700">
                        Sign Up
                    </button>
                </form>
                <p className="text-center mt-6 text-sm">
                    Already have an account? <Link to="/login" className="text-purple-600 font-semibold hover:underline">Log in</Link>
                </p>
                 <p className="text-center mt-2 text-sm">
                    <Link to="/" className="text-gray-500 hover:underline">← Back to Order Page</Link>
                </p>
            </div>
        </div>
    );
};

export default ClientSignup;
