import Header from '@components/header';
import { Customer, Product, StatusMessage } from '@types';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import ProductService from '@services/ProductService';
import ProductOverviewTable from '@components/products/ProductOverviewTable';
import CartService from '@services/CartService';
import useSWR, { mutate } from 'swr';
import useInterval from 'use-interval';
import ProductCreator from '@components/products/ProductEditor';
import CustomerService from '@services/CustomerService';
import ProductArticle from '@components/products/ProductArticle';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Wishlist: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useState<Customer | null>(null);

    useEffect(() => {
        setLoggedInUser(JSON.parse(sessionStorage.getItem('loggedInUser')!));
    }, []);

    return (
        <>
            <Head>
                <title>Wishlist</title>
            </Head>
            <Header />
            <main className="d-flex flex-column justify-content-center align-items-center">
                {/* {error && <div className="text-red-800">{error}</div>}
                {isLoading && <p className="text-green-800">Loading...</p>} */}
                <div className="w-4/5 p-4">
                    {loggedInUser && (
                        <ProductOverviewTable loggedInUser={loggedInUser} forWishlistpage={true} />
                    )}
                </div>
            </main>
        </>
    );
};


export default Wishlist;
