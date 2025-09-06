import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrders();
                setOrders(data);
                setFilteredOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;
        if (statusFilter !== 'All') {
            result = result.filter(order => order.status === statusFilter);
        }
        if (searchTerm) {
            result = result.filter(order =>
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredOrders(result);
    }, [searchTerm, statusFilter, orders]);

    const handleStatusChange = async (id: string, status: OrderStatus) => {
        const updatedOrder = await updateOrderStatus(id, status);
        if (updatedOrder) {
            setOrders(prevOrders => prevOrders.map(o => o.id === id ? updatedOrder : o));
        }
    };
    
    if (loading) {
        return <div className="text-center p-8">Loading orders...</div>;
    }

    return (
        <Card title="Manage Orders">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <input
                    type="text"
                    placeholder="Search by Order ID or Customer..."
                    className="w-full md:w-1/3 p-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="w-full md:w-auto p-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    {Object.values(OrderStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-brand-gray-200">
                    <thead className="bg-brand-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-brand-gray-200">
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-blue hover:underline">
                                    <Link to={`/admin/orders/${order.id}`}>{order.id}</Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{order.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">{order.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">R$ {order.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500"><Badge status={order.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                        className="p-1 border border-brand-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Object.values(OrderStatus).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default Orders;
