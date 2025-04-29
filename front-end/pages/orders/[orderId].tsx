import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import OrderInfo from '@components/orders/orderInfo';
import OrderService from '@services/OrderService';
import { Order, StatusMessage } from '@types';
import Header from '@components/header';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import classNames from 'classnames';

const OrderPage: React.FC = () => {
    const [order, setOrder] = useState<Order | null>(null);
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
    const router = useRouter();
    const { orderId } = router.query;

    useEffect(() => {
        setStatusMessages([]);
        if (orderId) {
            const fetchOrder = async () => {
                try {
                    const data = await OrderService.getOrderById(orderId as string);
                    setOrder(data);
                } catch (error) {
                    console.error('Failed to fetch order:', error);
                }
            };

            fetchOrder();
        }
    }, [orderId]);

    if (!order) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Header />
            <OrderInfo order={order} />
            {statusMessages && (
                <div className="row">
                    <ul className="list-none mb-3 mx-auto">
                        {statusMessages.map(({ message, type }, index) => (
                            <li
                                key={index}
                                className={classNames({
                                    'text-red-800': type === 'error',
                                    'text-green-800': type === 'success',
                                })}
                            >
                                {message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};



export default OrderPage;
