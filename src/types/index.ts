export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderProduct {
  product: Product;
  quantity: number;
  price: number;
}

export interface OrderUser {
  _id: string;
  name: string;
  email: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  _id: string;
  user?: OrderUser;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  products: OrderProduct[];
  total: number;
  status: OrderStatus;
  paymentIntentId?: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}

export interface CartItem {
  product: Product;
  quantity: number;
}
