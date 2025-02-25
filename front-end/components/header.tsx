import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Customer } from '@types';
import { useTranslation } from 'next-i18next';
import Language from './language/Language';

const Header: React.FC = () => {
    const router = useRouter();
    const [loggedInUser, setLoggedInUser] = useState<Customer | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        setLoggedInUser(JSON.parse(sessionStorage.getItem('loggedInUser')!));
    }, []);

    const handleClick = () => {
        sessionStorage.removeItem('loggedInUser');
        setLoggedInUser(null);
    };

    return (
        <nav className="border-gray-200" style={{ backgroundColor: '#0000a3' }}>
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <div className="w-full flex justify-center mb-4">
                    <Link
                        href="/"
                        className="flex items-center text-3xl font-extrabold tracking-wide text-gray-900 dark:text-white uppercase"
                    >
                        {t('app.title')}
                    </Link>
                </div>
                <div className="w-full flex justify-center items-center space-x-4">
                    <Link
                        href="/"
                        className="block py-2 px-4 text-gray-900 dark:text-white border-2 border-transparent rounded hover:border-white"
                    >
                        {t('header.nav.home')}
                    </Link>
                    {loggedInUser && (
                        <Link
                            href="/products"
                            className="block py-2 px-4 text-gray-900 dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            {t('header.nav.products')}
                        </Link>
                    )}

                    {loggedInUser && (
                        <Link
                            href="/orders"
                            className="block py-2 px-4 text-gray-900 dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            {t('header.nav.orders')}
                        </Link>
                    )}

                    {loggedInUser && loggedInUser.role === 'salesman' && (
                        <Link
                            href="/discounts"
                            className="block py-2 px-4 text-gray-900 dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            {t('header.nav.discounts')}
                        </Link>
                    )}

                    {!loggedInUser && (
                        <Link
                            href="/login"
                            className="block py-2 px-4 text-gray-900 dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            {t('header.nav.login')}
                        </Link>
                    )}
                    {loggedInUser && (
                        <a
                            href="/login"
                            className="block py-2 px-4 text-gray-900 dark:text-white border-2 border-transparent rounded hover:border-white"
                            onClick={handleClick}
                        >
                            {t('header.nav.logout')}
                        </a>
                    )}
                    {loggedInUser && (
                        <div className="block py-2 px-4 text-gray-900 dark:text-white">
                            {t('header.welcomeUser')}, {loggedInUser.fullname}!
                        </div>
                    )}
                    {loggedInUser && loggedInUser.role === 'customer' && (
                        <button
                            onClick={() => router.push('/checkout')}
                            className="flex items-center py-2 px-4 text-gray-900 dark:text-white border-2 border-transparent rounded hover:border-white"
                        >
                            <Image
                                src="/images/shopping-cart.png"
                                alt="Go to checkout"
                                width={30}
                                height={30}
                                className="mr-2"
                            />
                        </button>
                    )}
                    {loggedInUser && loggedInUser.role === 'customer' && (
                        <button
                            onClick={() => router.push('/wishlist')}
                            className="flex items-center py-2 px-4 text-gray-900 dark:text-white border-2 border-transparent rounded hover:border-white"
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
                    <Language />
                </div>
            </div>
        </nav>
    );
};

export default Header;
