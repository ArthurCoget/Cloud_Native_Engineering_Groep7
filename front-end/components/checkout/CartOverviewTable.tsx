import React, { useState } from 'react';
import { Cart, Customer } from '@types';
import ProductArticle from '@components/products/ProductArticle';

type Props = {
    loggedInUser: Customer;
    cart: Cart;
    convertCartToOrder: (paymentStatus: string) => void;
    updateQuantity: (id: number, quantity: number) => void;
    openAddDiscountCode: () => void;
};

const CartOverviewTable: React.FC<Props> = ({
    loggedInUser,
    cart,
    convertCartToOrder,
    updateQuantity,
    openAddDiscountCode,
}) => {
    const [paymentStatusInput, setPaymentStatusInput] = useState('unpaid');
    const [orderPlaced, setOrderPlaced] = useState(false);

    const handleOrderPlacement = () => {
        convertCartToOrder(paymentStatusInput);
        setOrderPlaced(true); // Update the state when the order is placed
    };

    return (
        <>
            {cart && cart.products.length > 0 ? (
                <div className="container mx-auto mt-8 px-4 flex flex-row flex-wrap">
                    {cart.products
                        .sort((cartItem1, cartItem2) =>
                            cartItem1.product.name.localeCompare(cartItem2.product.name)
                        )
                        .map((cartItem) => (
                            <ProductArticle
                                key={cartItem.product.id}
                                loggedInUser={loggedInUser}
                                product={cartItem.product}
                                quantity={cartItem.quantity}
                                updateQuantity={updateQuantity}
                            />
                        ))}
                    <div className="container mx-auto mt-8 px-4 flex flex-col space-y-6">
                        <article
                            key="overview"
                            className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-6"
                        >
                            <h2 className="text-xl font-bold text-gray-800">Cart Overview</h2>
                            <p className="text-gray-700">
                                <span className="font-semibold">
                                    Total price without discounts:
                                </span>{' '}
                                $
                                {Math.round(
                                    cart.products.reduce(
                                        (total, item) => total + item.product.price * item.quantity,
                                        0
                                    ) * 100
                                ) / 100}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Total price with discounts:</span> $
                                {Math.round(cart.totalAmount * 100) / 100}
                            </p>
                            <div className="space-y-4">
                                <div className="w-48">
                                    <label
                                        htmlFor="paymentStatus"
                                        className="block text-sm font-medium text-gray-600 mb-1"
                                    >
                                        Payment Type
                                    </label>
                                    <select
                                        id="paymentStatus"
                                        value={paymentStatusInput}
                                        onChange={(e) => setPaymentStatusInput(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="paid">Pay now</option>
                                        <option value="unpaid">Pay later</option>
                                    </select>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        type="button"
                                        onClick={openAddDiscountCode}
                                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
                                    >
                                        Add Discount Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleOrderPlacement}
                                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:ring-2 focus:ring-green-400"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            ) : orderPlaced ? (
                <p className="text-center mt-8 text-green-600 font-semibold">
                    Thank you! Your order has been placed successfully.
                </p>
            ) : (
                <p className="text-center mt-8">No products in cart.</p>
            )}
        </>
    );
};

export default CartOverviewTable;
