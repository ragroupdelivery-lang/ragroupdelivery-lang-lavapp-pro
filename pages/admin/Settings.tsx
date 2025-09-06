import React, { useState } from 'react';
import Card from '../../components/ui/Card';

const Settings: React.FC = () => {
    const [formData, setFormData] = useState({
        laundryName: 'Lavapp Pro',
        address: '123 Laundry Lane, Clean City, 12345',
        phone: '555-0101',
        email: 'contact@lavapp.pro',
    });
    const [feedback, setFeedback] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd call an API service here.
        console.log('Saved data:', formData);
        setFeedback('Settings saved successfully!');
        setTimeout(() => setFeedback(''), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Business Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="laundryName" className="block text-sm font-medium text-brand-gray-700">Laundry Name</label>
                        <input type="text" name="laundryName" id="laundryName" value={formData.laundryName} onChange={handleChange} className="mt-1 block w-full p-2 border border-brand-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-brand-gray-700">Phone</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full p-2 border border-brand-gray-300 rounded-md"/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-brand-gray-700">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border border-brand-gray-300 rounded-md"/>
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-brand-gray-700">Address</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full p-2 border border-brand-gray-300 rounded-md"/>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end items-center space-x-4">
                {feedback && <p className="text-green-600">{feedback}</p>}
                <button
                    type="submit"
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-6 rounded-lg"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default Settings;
