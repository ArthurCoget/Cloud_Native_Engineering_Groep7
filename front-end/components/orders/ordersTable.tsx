import OrderService from '@services/OrderService';
import { Order, StatusMessage } from '@types';
import { useEffect, useState } from 'react';
import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import router from 'next/router';

const OrderTable = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Order | 'customerName' | 'paymentAmount' | 'paymentStatus';
        direction: 'ascending' | 'descending';
    } | null>(null);
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

    useEffect(() => {
        setStatusMessages([]);
        const fetchOrders = async () => {
            try {
                const data = await OrderService.getAllOrders();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
        const intervalId = setInterval(fetchOrders, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const sortedOrders = React.useMemo(() => {
        if (sortConfig !== null) {
            const sorted = [...orders].sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortConfig.key) {
                    case 'id':
                        aValue = a.id;
                        bValue = b.id;
                        break;
                    case 'customerName':
                        aValue = `${a.customer.firstName} ${a.customer.lastName}`;
                        bValue = `${b.customer.firstName} ${b.customer.lastName}`;
                        break;
                    case 'paymentAmount':
                        aValue = a.payment.amount;
                        bValue = b.payment.amount;
                        break;
                    case 'paymentStatus':
                        aValue = a.payment.paymentStatus;
                        bValue = b.payment.paymentStatus;
                        break;
                    default:
                        aValue = '';
                        bValue = '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
            return sorted;
        }
        return orders;
    }, [orders, sortConfig]);

    const requestSort = (key: keyof Order | 'customerName' | 'paymentAmount' | 'paymentStatus') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (
        key: keyof Order | 'customerName' | 'paymentAmount' | 'paymentStatus'
    ) => {
        if (!sortConfig || sortConfig.key !== key) {
            return (
                <svg
                    className="w-6 h-6 ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            );
        }
        if (sortConfig.direction === 'ascending') {
            return (
                <svg
                    className="w-6 h-6 ml-1 transform rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            );
        }

        return (
            <svg
                className="w-6 h-6 ml-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        );
    };

    return (
        <div className="overflow-x-auto shadow-lg rounded-lg max-w-6xl mx-auto pt-4">
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
            <table className="min-w-full bg-white text-base">
                <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left font-medium cursor-pointer"
                            onClick={() => requestSort('id')}
                        >
                            <div className="flex items-center">
                                Order ID
                                {renderSortIcon('id')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left font-medium cursor-pointer"
                            onClick={() => requestSort('customerName')}
                        >
                            <div className="flex items-center">
                                Customer Name
                                {renderSortIcon('customerName')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left font-medium cursor-pointer"
                            onClick={() => requestSort('paymentAmount')}
                        >
                            <div className="flex items-center">
                                Amount
                                {renderSortIcon('paymentAmount')}
                            </div>
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left font-medium cursor-pointer"
                            onClick={() => requestSort('paymentStatus')}
                        >
                            <div className="flex items-center">
                                Payment Status
                                {renderSortIcon('paymentStatus')}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedOrders.map((order, index) => (
                        <tr
                            key={order.id}
                            className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => router.push(`/orders/${order.id}`)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                {order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                {order.customer.firstName} {order.customer.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                ${order.payment.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                {order.payment.paymentStatus}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;
