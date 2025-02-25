// components/orders/OrderInfo.tsx
import { Order } from '@types';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '@styles/home.module.css';

type OrderInfoProps = {
    order: Order;
};

const OrderInfo: React.FC<OrderInfoProps> = ({ order }) => {
    const router = useRouter();

    const handleGoBack = () => {
        router.push('/orders');
    };

    return (
        <section className="py-20 bg-gray-100 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="p-8 lg:p-20 bg-white shadow-lg rounded-lg">
                    <h2 className="mb-8 lg:mb-20 text-2xl font-bold">Order Details</h2>
                    <div className="mb-8">
                        <p>
                            <strong>Order ID:</strong> {order.id}
                        </p>
                        <p>
                            <strong>Order Date:</strong> {new Date(order.date).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Payment Status:</strong> {order.payment.paymentStatus}
                        </p>
                        <p>
                            <strong>Total Amount:</strong> ${order.payment.amount.toFixed(2)}
                        </p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Customer Information</h3>
                        <p>
                            <strong>Name:</strong> {order.customer.firstName}{' '}
                            {order.customer.lastName}
                        </p>
                        <p>
                            <strong>Email:</strong> {order.customer.email}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4">Ordered Items</h3>
                        <div className="border-b pb-2 mb-4 hidden lg:flex">
                            <div className="w-3/6 text-gray-500 text-sm font-semibold">
                                Description
                            </div>
                            <div className="w-1/6 text-gray-500 text-sm font-semibold text-center">
                                Price
                            </div>
                            <div className="w-1/6 text-gray-500 text-sm font-semibold text-center">
                                Quantity
                            </div>
                            <div className="w-1/6 text-gray-500 text-sm font-semibold text-right">
                                Subtotal
                            </div>
                        </div>
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col lg:flex-row items-center border-t border-b py-6"
                            >
                                <div className="flex w-full lg:w-3/6 items-center mb-4 lg:mb-0">
                                    <div className="w-24 h-32 bg-gray-200 flex items-center justify-center mr-4">
                                        {/* <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="object-contain h-full"
                                        /> */}
                                        <Image
                                            src={`/images/${item.product.images}.png`}
                                            alt="Product image"
                                            className={`${styles.vercelLogo} object-contain h-full`}
                                            width={300}
                                            height={350}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold">
                                            {item.product.name}
                                        </h4>
                                        <p className="text-gray-500 text-sm">
                                            {item.product.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full lg:w-1/6 text-center mb-4 lg:mb-0">
                                    <p className="text-blue-500 font-bold">
                                        ${item.product.price.toFixed(2)}
                                    </p>
                                </div>

                                <div className="w-full lg:w-1/6 text-center mb-4 lg:mb-0">
                                    <p>{item.quantity}</p>
                                </div>

                                <div className="w-full lg:w-1/6 text-right">
                                    <p className="text-blue-500 font-bold">
                                        ${(item.product.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleGoBack}
                        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Go Back to Orders
                    </button>
                </div>
            </div>
        </section>
    );
};

export default OrderInfo;
