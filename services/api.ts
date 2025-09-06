import { supabase } from './supabaseClient';
import { Order, Customer, Service, OrderStatus, OrderItem, User } from '../types';

// --- API FUNCTIONS ---

// Dashboard (This would need more complex SQL queries or database functions in a real scenario)
export const getDashboardData = async () => { 
    const { data: orders, error: ordersError } = await supabase.from('orders').select('*');
    const { data: customers, error: customersError } = await supabase.from('customers').select('*');
    if (ordersError || customersError) {
        console.error(ordersError || customersError);
        throw new Error('Failed to fetch dashboard data');
    }
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    
    // Weekly sales data would need a more complex query, so we'll keep it static for now.
    const weeklySales = [
        { name: 'Mon', sales: 400 }, { name: 'Tue', sales: 300 }, { name: 'Wed', sales: 500 },
        { name: 'Thu', sales: 280 }, { name: 'Fri', sales: 450 }, { name: 'Sat', sales: 600 },
        { name: 'Sun', sales: 350 },
    ];

    return {
        stats: {
            totalRevenue,
            totalOrders: orders.length,
            newCustomers: customers.length,
            pendingOrders: orders.filter(o => o.status === OrderStatus.PendingCollection).length
        },
        weeklySales,
        recentOrders: recentOrders.map(o => ({...o, id: o.order_uid, date: o.created_at.split('T')[0]})) // map to legacy Order type
    };
}

// Orders
export const getOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(o => ({...o, id: o.order_uid, date: new Date(o.created_at).toISOString().split('T')[0]}));
};
export const getOrderById = async (uid: string) => {
    const { data, error } = await supabase.from('orders').select('*').eq('order_uid', uid).single();
    if (error) throw error;
    return data ? {...data, id: data.order_uid, date: new Date(data.created_at).toISOString().split('T')[0]} : null;
};
export const getOrdersByCustomerId = async (customerId: string) => {
    const { data, error } = await supabase.from('orders').select('*').eq('customer_id', customerId);
    if (error) throw error;
    return data.map(o => ({...o, id: o.order_uid, date: new Date(o.created_at).toISOString().split('T')[0]}));
};
export const updateOrderStatus = async (uid: string, status: OrderStatus) => {
    const { data, error } = await supabase.from('orders').update({ status }).eq('order_uid', uid).select().single();
    if (error) throw error;
    return data ? {...data, id: data.order_uid, date: new Date(data.created_at).toISOString().split('T')[0]} : null;
};
export const createOrder = async (orderData: { customerId: string, customerName: string; address: string; phone: string; items: OrderItem[]; total: number; collectionTime: string; }): Promise<Order> => {
    const { data, error } = await supabase.from('orders').insert({
        customer_id: orderData.customerId,
        customer_name: orderData.customerName,
        total: orderData.total,
        items: orderData.items,
        collection_address: orderData.address,
        collection_time: orderData.collectionTime,
    }).select().single();
    if (error) throw error;
    return {...data, id: data.order_uid, date: new Date(data.created_at).toISOString().split('T')[0]};
}

// Customers
export const getCustomers = async () => {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) throw error;
    return data.map(c => ({...c, joinedDate: c.joined_date}));
};
export const getCustomerById = async (id: string) => {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
    if (error) throw error;
    return data ? {...data, joinedDate: data.joined_date} : null;
};


// Services
export const getServices = async (): Promise<Service[]> => {
    const { data, error } = await supabase.from('services').select('*');
    if (error) throw error;
    return data;
}
export const createService = async (service: Omit<Service, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('services').insert(service).select().single();
    if (error) throw error;
    return data;
}
export const updateService = async (service: Service) => {
    const { data, error } = await supabase.from('services').update({ ...service }).eq('id', service.id).select().single();
    if (error) throw error;
    return data;
}
export const deleteService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
}

// Auth
export const login = async (email: string, pass: string): Promise<User | null> => {
    // FIX: The parameter for password is `pass`, so we need to map it to the `password` property.
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    if (data.user) {
        // Here you might fetch profile data to determine role if not in JWT
        // For simplicity, we assume admins log in via /admin/login and have a specific email pattern or a role in metadata
        const role = email === 'admin@lavapp.com' ? 'admin' : 'customer';
        return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.name || data.user.email!,
            role: role,
        };
    }
    return null;
}

export const signup = async(details: {name: string, email: string, phone: string, address: string, pass: string}): Promise<User | null> => {
    const { data, error } = await supabase.auth.signUp({
        email: details.email,
        password: details.pass,
        options: {
            data: {
                name: details.name,
                phone: details.phone,
                address: details.address,
            }
        }
    });
    if (error) throw error;
    if (data.user) {
        // Also create a customer profile
        const { error: customerError } = await supabase.from('customers').insert({
            id: data.user.id,
            name: details.name,
            email: details.email,
            phone: details.phone,
            address: details.address
        });
        if (customerError) throw customerError;

        return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.name,
            phone: data.user.user_metadata.phone,
            address: data.user.user_metadata.address,
            role: 'customer'
        };
    }
    return null;
}

export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Session check
export const getSessionUser = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
         const role = session.user.email === 'admin@lavapp.com' ? 'admin' : 'customer';
         return {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name || session.user.email!,
            address: session.user.user_metadata.address,
            phone: session.user.user_metadata.phone,
            role,
        };
    }
    return null;
}