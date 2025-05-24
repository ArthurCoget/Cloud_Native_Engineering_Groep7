import { Customer } from './customer';
import { OrderItem } from './orderItem';
import { Payment } from './payment';
import { Product } from './product';
import {
    Customer as CustomerPrisma,
    Product as ProductPrisma,
    OrderItem as OrderItemPrisma,
    Order as OrderPrisma,
    Payment as PaymentPrisma,
} from '@prisma/client';

export class Order {
    private id?: number;
    private customer: Customer;
    private items: OrderItem[];
    private date: Date;
    private payment: Payment;

    constructor(order: {
        customer: Customer;
        items: OrderItem[];
        date: Date;
        payment: Payment;
        id?: number;
    }) {
        this.validate(order);
        this.id = order.id;
        this.customer = order.customer;
        this.items = order.items;
        this.date = order.date;
        this.payment = order.payment;
    }

    getId(): number | undefined {
        return this.id;
    }

    getCustomer(): Customer {
        return this.customer;
    }

    getItems(): OrderItem[] {
        return this.items;
    }

    getDate(): Date {
        return this.date;
    }

    getPayment(): Payment {
        return this.payment;
    }

    calculateTotalAmount(): number {
        return this.items.reduce((total, item) => total + item.getTotalPrice(), 0);
    }

    validate(order: { customer: Customer; items: OrderItem[]; date: Date; payment: Payment }) {
        if (!order.customer) {
            throw new Error('Customer cannot be null or undefined.');
        }

        if (!(order.date instanceof Date) || isNaN(order.date.getTime())) {
            throw new Error('Invalid date provided.');
        }

        const currentDate = new Date();

        if (order.date > currentDate) {
            throw new Error('Order date cannot be in the future.');
        }
        if (!order.payment) {
            throw new Error('Payment cannot be null or undefined.');
        }
    }

    addItem(product: Product, quantity: number) {
        const orderItem = new OrderItem({ product, quantity });
        this.items.push(orderItem);
        this.payment.setAmount(this.calculateTotalAmount());
    }

    static from({
        customer,
        items,
        date,
        payment,
        id,
    }: OrderPrisma & {
        customer: CustomerPrisma;
        items: (OrderItemPrisma & { product: ProductPrisma })[];
        payment: PaymentPrisma;
    }) {
        const order = new Order({
            id,
            customer: Customer.fromWithoutWishlist(customer),
            items: items.map((item: OrderItemPrisma & { product: ProductPrisma }) =>
                OrderItem.from(item)
            ),
            date,
            payment: Payment.from(payment),
        });
        return order;
    }
}
