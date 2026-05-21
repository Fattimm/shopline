const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = {
  async getProducts() {
    const res = await fetch(`${API_URL}/api/products`);
    return res.json();
  },

  async getProduct(id: string) {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    return res.json();
  },

  async register(name: string, email: string, password: string, phone?: string) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    return res.json();
  },

  async createPaymentIntent(items: any[], shippingAddress: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/checkout/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items, shippingAddress }),
    });
    return res.json();
  },

  async getMyOrders() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/orders/myorders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};