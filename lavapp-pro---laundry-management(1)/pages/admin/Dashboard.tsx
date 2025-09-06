import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardData } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Order } from '../../types';
import { ChartBarIcon, CurrencyDollarIcon, PackageIcon, UsersIcon } from '../../components/icons/Icons';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
    <Card>
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-brand-blue-light mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-brand-gray-500">{title}</p>
                <p className="text-2xl font-bold text-brand-gray-800">{value}</p>
            </div>
        </div>
    </Card>
);

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, newCustomers: 0, pendingOrders: 0 });
    const [weeklySales, setWeeklySales] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDashboardData();
                setStats(data.stats);
                setWeeklySales(data.weeklySales);
                setRecentOrders(data.recentOrders);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<CurrencyDollarIcon className="h-6 w-6 text-brand-blue-dark" />} title="Total Revenue" value={`R$ ${stats.totalRevenue.toFixed(2)}`} />
                <StatCard icon={<PackageIcon className="h-6 w-6 text-brand-blue-dark" />} title="Total Orders" value={stats.totalOrders.toString()} />
                <StatCard icon={<UsersIcon className="h-6 w-6 text-brand-blue-dark" />} title="Total Customers" value={stats.newCustomers.toString()} />
                <StatCard icon={<ChartBarIcon className="h-6 w-6 text-brand-blue-dark" />} title="Pending Orders" value={stats.pendingOrders.toString()} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2" title="Weekly Sales">
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={weeklySales}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#718096', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#718096', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#EBF8FF' }}/>
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                <Bar dataKey="sales" fill="#3182CE" name="Sales (R$)" barSize={30} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card title="Recent Orders">
                    <div className="space-y-4">
                        {recentOrders.map(order => (
                            <div key={order.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-brand-gray-700">{order.customerName}</p>
                                    <p className="text-sm text-brand-gray-500">{order.id}</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-semibold text-brand-gray-800">R$ {order.total.toFixed(2)}</p>
                                     <Badge status={order.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
