import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const OrderDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            try {
                const data = await getOrderById(orderId);
                setOrder(data || null);
            } catch (error) {
                console.error("Failed to fetch order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);
    
    const handleStatusChange = async (status: OrderStatus) => {
        if (!order) return;
        const updatedOrder = await updateOrderStatus(order.id, status);
        if (updatedOrder) {
            setOrder(updatedOrder);
        }
    };

    if (loading) return <div className="text-center p-8">Loading order details...</div>;
    if (!order) return <div className="text-center p-8 text-red-500">Order not found.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-gray-800">Order #{order.id}</h1>
                <div className="flex items-center space-x-4">
                    <Badge status={order.status} />
                     <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                        className="p-2 border border-brand-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    >
                        {Object.values(OrderStatus).map(status => (
                            <option key={status} value={status}>Set to: {status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Customer Details" className="md:col-span-1">
                    <p className="font-semibold text-brand-blue hover:underline">
                        <Link to={`/admin/customers/${order.customerId}`}>{order.customerName}</Link>
                    </p>
                    <p className="text-sm text-brand-gray-500">{order.collectionAddress}</p>
                    <p className="text-sm text-brand-gray-500">{order.collectionTime}</p>
                </Card>

                <Card title="Order Summary" className="md:col-span-2">
                    <div className="flex justify-between text-brand-gray-500">
                        <span>Order Date:</span>
                        <span className="font-medium text-brand-gray-800">{order.date}</span>
                    </div>
                     <div className="flex justify-between text-brand-gray-500 mt-2">
                        <span>Total Amount:</span>
                        <span className="font-bold text-2xl text-brand-blue-dark">R$ {order.total.toFixed(2)}</span>
                    </div>
                </Card>
            </div>

            <Card title="Order Items">
                <table className="min-w-full">
                    <thead className="border-b">
                        <tr>
                            <th className="text-left py-2">Item</th>
                            <th className="text-center py-2">Quantity</th>
                            <th className="text-right py-2">Price</th>
                            <th className="text-right py-2">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.serviceId} className="border-b">
                                <td className="py-3 font-medium">{item.name}</td>
                                <td className="text-center py-3">{item.quantity}</td>
                                <td className="text-right py-3">R$ {item.price.toFixed(2)}</td>
                                <td className="text-right py-3 font-semibold">R$ {(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default OrderDetail;
