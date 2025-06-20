import CartService from '@services/CartService';
import { Cart, Customer } from '@types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';

const Header: React.FC = () => {
    const router = useRouter();
    const [loggedInUser, setLoggedInUser] = useState<Customer | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('loggedInUser');
        if (stored) {
            setLoggedInUser(JSON.parse(stored));
            // zorg dat SWR meteen de cart laadt
            mutate('cart');
        }
    }, []);

    const handleClick = () => {
        sessionStorage.removeItem('loggedInUser');
        setLoggedInUser(null);
    };

    const getCartByEmail = async (): Promise<Cart> => {
        if (!loggedInUser) {
            throw new Error('Not logged in');
        }
        const res = await CartService.getCartByEmail(loggedInUser.email!);
        if (!res.ok) {
            throw new Error('Failed to fetch cart');
        }
        return res.json();
    };

    const { data: cart, error } = useSWR<Cart>(loggedInUser ? 'cart' : null, getCartByEmail);

    const totalQuantity = cart?.products?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    return (
        <nav className="border-gray-200" style={{ backgroundColor: '#0000a3' }}>
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <div className="w-full flex justify-center mb-4">
                    <Link
                        href="/"
                        className="flex items-center text-3xl font-extrabold tracking-wide text-gray-900 dark:text-white uppercase"
                    >
                        JB-Clothing
                    </Link>
                </div>
                <div className="w-full flex justify-center items-center space-x-4">
                    <Link
                        href="/"
                        className="block py-2 px-4 text-white dark:text-white border-2 border-transparent rounded hover:border-white"
                    >
                        Home
                    </Link>
                    {loggedInUser && (
                        <Link
                            href="/products"
                            className="block py-2 px-4 text-white dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            Products
                        </Link>
                    )}

                    {loggedInUser && (
                        <Link
                            href="/orders"
                            className="block py-2 px-4 text-white dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            Orders
                        </Link>
                    )}

                    {loggedInUser && loggedInUser.role === 'salesman' && (
                        <Link
                            href="/discounts"
                            className="block py-2 px-4 text-white dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            Discounts
                        </Link>
                    )}

                    {!loggedInUser && (
                        <Link
                            href="/login"
                            className="block py-2 px-4 text-white dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            Login
                        </Link>
                    )}
                    {loggedInUser && (
                        <a
                            href="/"
                            className="block py-2 px-4 text-white dark:text-white border-2 border-transparent rounded hover:border-white"
                            onClick={handleClick}
                        >
                            Logout
                        </a>
                    )}
                    {loggedInUser && (
                        <div className="block py-2 px-4 text-white dark:text-white">
                            Welcome, {loggedInUser.fullname}!
                        </div>
                    )}
                    {loggedInUser && loggedInUser.role === 'customer' && (
                        <button
                            onClick={() => router.push('/checkout')}
                            className="flex items-center py-2 px-4 text-white dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            <Image
                                src="/images/shopping-cart.png"
                                alt="Go to checkout"
                                width={30}
                                height={30}
                                className="mr-2"
                            />
                            {totalQuantity > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                                    {totalQuantity}
                                </span>
                            )}
                        </button>
                    )}
                    {loggedInUser && loggedInUser.role === 'customer' && (
                        <button
                            onClick={() => router.push('/wishlist')}
                            className="flex items-center py-2 px-4 text-white dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            <Image
                                src="/images/wishlist.png"
                                alt="Go to wishlist"
                                width={30}
                                height={30}
                                className="mr-2"
                            />
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;
