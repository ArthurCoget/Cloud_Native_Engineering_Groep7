import React, { useState } from 'react';
import { Product, Customer, DiscountCode, StatusMessage } from '@types';
import Image from 'next/image';
import styles from '@styles/home.module.css';
import DiscountService from '@services/DiscountService';
import classNames from 'classnames';

type Props = {
    discounts: Array<DiscountCode>;
    reloadDiscounts: () => void;
    openCreateDiscountCode: () => void;
    openUpdateDiscountCode: (discountCode: DiscountCode) => void;
};

const DiscountOverviewTable: React.FC<Props> = ({
    discounts,
    reloadDiscounts,
    openCreateDiscountCode,
    openUpdateDiscountCode,
}) => {
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

    const deleteDiscount = async (code: string) => {
        setStatusMessages([]);
        const response = await DiscountService.deleteDiscountCode(code);
        if (!response.ok) {
            if (response.status === 401) {
                setStatusMessages([
                    {
                        message: 'You must be an admin to delete a discount code.',
                        type: 'error',
                    },
                ]);
            } else {
                const error = await response.json();
                setStatusMessages([
                    {
                        message: 'Failed to delete discount code: ' + error.message,
                        type: 'error',
                    },
                ]);
            }
        }
        reloadDiscounts();
    };
    return (
        <>
            {discounts && (
                <div className="container mx-auto px-4 flex flex-col items-center">
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
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-4">
                        <thead className="bg-yellow-300">
                            <tr>
                                <th scope="col" className="py-2 px-4 text-left">
                                    Code
                                </th>
                                <th scope="col" className="py-2 px-4 text-left">
                                    Type
                                </th>
                                <th scope="col" className="py-2 px-4 text-left">
                                    Value
                                </th>
                                <th scope="col" className="py-2 px-4 text-left">
                                    Expiration date
                                </th>
                                <th scope="col" className="py-2 px-4 text-left">
                                    isActive
                                </th>
                                <th scope="col" className="py-2 px-4 text-left">
                                    Delete
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map((discount, index) => (
                                <tr
                                    key={discount.id}
                                    className={`${
                                        index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                                    } hover:bg-yellow-50 hover:text-yellow-500 font-medium text-gray-800 cursor-pointer`}
                                    onClick={() => openUpdateDiscountCode(discount)}
                                >
                                    <td className="py-2 px-4 w-1/5">{discount.code}</td>
                                    <td className="py-2 px-4 w-1/5">{discount.type}</td>
                                    {discount.type === 'percentage' && (
                                        <td className="py-2 px-4 w-1/5">{discount.value}%</td>
                                    )}
                                    {discount.type === 'fixed' && (
                                        <td className="py-2 px-4 w-1/5">{discount.value}$</td>
                                    )}
                                    <td className="py-2 px-4 w-1/5">
                                        {new Date(discount.expirationDate).toLocaleDateString(
                                            'en-GB'
                                        )}
                                    </td>
                                    <td
                                        className={`${
                                            discount.isActive === true
                                                ? 'text-green-800'
                                                : 'text-red-800'
                                        } py-2 px-4 w-1/5`}
                                    >
                                        {discount.isActive.toString()}
                                    </td>
                                    <td className={`py-2 px-4 w-1/5`}>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                deleteDiscount(discount.code);
                                            }}
                                            className="w-min bg-black text-white py-2 rounded px-1"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            onClick={() => openCreateDiscountCode()}
                            className="w-min bg-black text-white py-2 rounded px-4"
                        >
                            Create discount code
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default DiscountOverviewTable;
