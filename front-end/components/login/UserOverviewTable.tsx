import React from 'react';
import { Product, Customer } from '@types';
import Image from 'next/image';
import styles from '@styles/home.module.css';
import { useTranslation } from 'next-i18next';

type Props = {};

const UserOverviewTable: React.FC<Props> = ({}: Props) => {
    const { t } = useTranslation();

    const users: Customer[] = [
        { email: 'john.doe@example.com', password: 'password123', role: 'customer' },
        { email: 'jane.smith@example.com', password: 'password456', role: 'customer' },
        { email: 'alice.johnson@example.com', password: 'password789', role: 'customer' },
        { email: 'admin@example.com', password: 'admin123', role: 'admin' },
        { email: 'salesman@example.com', password: 'salesman123', role: 'salesman' },
    ];

    return (
        <>
            {users && (
                <div className="container mx-auto p-4 flex flex-row flex-wrap">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-yellow-300">
                            <tr>
                                <th scope="col" className="py-2 px-4 text-left">
                                    {t('home.email')}
                                </th>
                                <th scope="col" className="py-2 px-4 text-left">
                                    {t('home.password')}
                                </th>
                                <th scope="col" className="py-2 px-4 text-left">
                                    {t('home.role')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr
                                    key={user.email}
                                    className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
                                >
                                    <td className="py-2 px-4 w-1/3">{user.email}</td>
                                    <td className="py-2 px-4 w-1/3">{user.password}</td>
                                    <td className="py-2 px-4 w-1/3">{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

export default UserOverviewTable;
