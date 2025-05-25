type Role = 'admin' | 'salesman' | 'customer';

type Customer = {
    id?: number;
    firstName?: string;
    lastName?: string;
    fullname?: string;
    email?: string;
    password?: string;
    wishlist?: Product[];
    role?: Role;
    reviews?: Review[];
};

type Review = {
    id?: number;
    rating: number;
    comment?: string;
    createdAt: string;
    productId: number;
    customerId: number;
    customer: Customer;
    date: Date;
};

type DiscountCode = {
    id?: number;
    code: string;
    type: string;
    value: number;
    expirationDate: Date;
    isActive: boolean;
};

type Cart = {
    id?: number;
    customer: Customer;
    products: CartItem[];
    totalAmount: number;
};

type CartItem = {
    id?: number;
    product: Product;
    quantity: number;
};

type Order = {
    id?: number;
    customer: Customer;
    items: OrderItem[];
    date: Date;
    payment: Payment;
};

type OrderItem = {
    id?: number;
    order: Order;
    product: Product;
    quantity: number;
};

type Payment = {
    id?: number;
    amount: number;
    date: Date;
    paymentStatus: string;
};

type Product = {
    id?: number;
    name: string;
    price: number;
    stock: number;
    categories: string[];
    description: string;
    images: string;
    sizes: string[];
    colors: string[];
    rating: number[];
    reviews?: Review[];
};

type StatusMessage = {
    message: string;
    type: 'error' | 'success';
};

export type {
    Cart,
    CartItem,
    Customer,
    DiscountCode,
    Order,
    OrderItem,
    Payment,
    Product,
    Review,
    StatusMessage,
};
