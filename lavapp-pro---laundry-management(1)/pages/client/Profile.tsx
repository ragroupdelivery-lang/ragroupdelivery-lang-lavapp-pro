import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getOrdersByCustomerId } from '../../services/api';
import { Order } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const Profile: React.FC = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && user) {
            const fetchOrders = async () => {
                try {
                    const data = await getOrdersByCustomerId(user.id);
                    setOrders(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [user, authLoading]);
    
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (authLoading || loading) {
        return <div className="text-center p-8">Loading profile...</div>;
    }
    
    if (!user) {
        return <div className="text-center p-8">User not found.</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                     <Link to="/" className="text-3xl font-bold text-purple-600">🧺 Lavapp</Link>
                    <div className="flex items-center space-x-4">
                        <span className="font-semibold">Olá, {user.name}</span>
                        <button onClick={handleLogout} className="text-sm text-purple-600 hover:underline">Sair</button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Meus Pedidos</h1>
                <Card>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-brand-gray-200">
                            <thead className="bg-brand-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Pedido ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-brand-gray-200">
                                {orders.length > 0 ? orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-brand-gray-900">{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-brand-gray-500">{new Date(order.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 text-sm text-brand-gray-500">R$ {order.total.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm"><Badge status={order.status} /></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">Você ainda não fez nenhum pedido.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
                 <div className="text-center mt-8">
                     <Link to="/" className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700">Fazer Novo Pedido</Link>
                </div>
            </main>
        </div>
    );
};

export default Profile;
