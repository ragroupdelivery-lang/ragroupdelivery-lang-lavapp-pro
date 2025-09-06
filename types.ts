import { ReactNode } from "react";

export enum OrderStatus {
  PendingCollection = 'Pending Collection',
  InProgress = 'In Progress',
  ReadyForDelivery = 'Ready for Delivery',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface OrderItem {
  serviceId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerId: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  collectionAddress: string;
  deliveryAddress: string;
  collectionTime: string;
  deliveryTime: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  address: string;
}

export enum ServiceCategory {
  Plan = 'Plan',
  Base = 'Base Service',
  Extra = 'Extra',
  SpecialCare = 'Special Care',
  Packaging = 'Packaging',
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ServiceCategory;
  availability: 'plan' | 'avulso' | 'both'; 
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}
