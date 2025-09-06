import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers } from '../../services/api';
import { Customer } from '../../types';
import Card from '../../components/ui/Card';

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getCustomers();
                setCustomers(data);
            } catch (error) {
                console.error("Failed to fetch customers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Loading customers...</div>;
    }

    return (
        <Card title="Customer List">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-gray-200">
                    <thead className="bg-brand-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-brand-gray-200">
                        {customers.map(customer => (
                            <tr key={customer.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-blue hover:underline">
                                    <Link to={`/admin/customers/${customer.id}`}>{customer.name}</Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{customer.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{customer.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{customer.joinedDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default Customers;
