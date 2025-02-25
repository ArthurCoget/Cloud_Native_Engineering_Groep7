import Header from '@components/header';
import { Customer, DiscountCode, StatusMessage } from '@types';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import CartService from '@services/CartService';
import useSWR, { mutate } from 'swr';
import useInterval from 'use-interval';
import CustomerService from '@services/CustomerService';
import DiscountService from '@services/DiscountService';
import DiscountOverviewTable from '@components/discounts/DiscountOverviewTable';
import DiscountCodeEditor from '@components/discounts/DiscountEditor';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Discounts: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useState<Customer | null>(null);

    const [selectedDiscountcode, setSelectedDiscountCode] = useState<DiscountCode | null>(null);
    const [isCreateDiscountCodeOpen, setIsCreateDiscountCodeOpen] = useState(false);
    const { t } = useTranslation();

    const openCreateDiscountCode = () => {
        setSelectedDiscountCode(null);
        setIsCreateDiscountCodeOpen(true);
    };

    const closeDiscountCodeEditor = () => setIsCreateDiscountCodeOpen(false);

    const openUpdateDiscountCode = (discountCode: DiscountCode) => {
        setSelectedDiscountCode(discountCode);
        setIsCreateDiscountCodeOpen(true);
    };

    const handleSaveDiscountCode = async () => {
        setSelectedDiscountCode(null);
        setIsCreateDiscountCodeOpen(false);
        mutate('discounts', getDiscounts());
    };

    const getDiscounts = async () => {
        if (loggedInUser) {
            const response = await DiscountService.getAllDiscounts();
            if (response.ok) {
                const discountCodes = await response.json();
                return discountCodes;
            }
        }
    };

    const reloadDiscounts = () => {
        mutate('discounts', getDiscounts());
    };

    const { data: discounts, isLoading, error } = useSWR('discounts', getDiscounts);

    useEffect(() => {
        setLoggedInUser(JSON.parse(sessionStorage.getItem('loggedInUser')!));
        mutate('discounts', getDiscounts());
    }, []);

    useInterval(() => {
        mutate('discounts', getDiscounts());
    }, 4000);

    return (
        <>
            <Head>
                <title>DiscountCodes</title>
            </Head>
            <Header />
            <main className="d-flex flex-column justify-content-center align-items-center">
                {error && <div className="text-red-800">{error}</div>}
                {isLoading && <p className="text-green-800">Loading...</p>}
                <div className="p-4">
                    {discounts && loggedInUser && (
                        <DiscountOverviewTable
                            discounts={discounts}
                            reloadDiscounts={reloadDiscounts}
                            openCreateDiscountCode={openCreateDiscountCode}
                            openUpdateDiscountCode={openUpdateDiscountCode}
                        />
                    )}
                    <DiscountCodeEditor
                        isOpen={isCreateDiscountCodeOpen}
                        onClose={closeDiscountCodeEditor}
                        onSave={handleSaveDiscountCode}
                        discountToUpdate={selectedDiscountcode}
                    />
                </div>
            </main>
        </>
    );
};

export const getServerSideProps = async (context: { locale: any }) => {
    const { locale } = context;

    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};

export default Discounts;
