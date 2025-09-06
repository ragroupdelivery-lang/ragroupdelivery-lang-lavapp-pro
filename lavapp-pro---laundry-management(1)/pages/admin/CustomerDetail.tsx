import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomerById, getOrdersByCustomerId } from '../../services/api';
import { Customer, Order } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const CustomerDetail: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!customerId) return;
            try {
                const customerData = await getCustomerById(customerId);
                const customerOrders = await getOrdersByCustomerId(customerId);
                setCustomer(customerData || null);
                setOrders(customerOrders);
            } catch (error) {
                console.error("Failed to fetch customer details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [customerId]);

    if (loading) return <div className="text-center p-8">Loading customer details...</div>;
    if (!customer) return <div className="text-center p-8 text-red-500">Customer not found.</div>;

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-brand-gray-800">{customer.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Contact Information">
                    <p className="text-brand-gray-800">{customer.email}</p>
                    <p className="text-brand-gray-800">{customer.phone}</p>
                    <p className="text-brand-gray-500 mt-2">{customer.address}</p>
                </Card>
                <Card title="Customer Stats">
                    <p className="text-sm text-brand-gray-500">Joined Date</p>
                    <p className="font-semibold text-brand-gray-800">{customer.joinedDate}</p>
                    <p className="text-sm text-brand-gray-500 mt-2">Total Orders</p>
                    <p className="font-semibold text-brand-gray-800">{orders.length}</p>
                    <p className="text-sm text-brand-gray-500 mt-2">Total Spent</p>
                    <p className="font-bold text-xl text-brand-blue-dark">R$ {totalSpent.toFixed(2)}</p>
                </Card>
            </div>

            <Card title="Order History">
                <table className="min-w-full divide-y divide-brand-gray-200">
                    <thead className="bg-brand-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-brand-gray-200">
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 text-sm font-medium text-brand-blue hover:underline">
                                    <Link to={`/admin/orders/${order.id}`}>{order.id}</Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-brand-gray-500">{order.date}</td>
                                <td className="px-6 py-4 text-sm text-brand-gray-500">R$ {order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 text-sm"><Badge status={order.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default CustomerDetail;
