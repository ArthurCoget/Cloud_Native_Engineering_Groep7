import Header from '@components/header';
import OrdersTable from '@components/orders/ordersTable';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Order: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Head>
                <title>Orders</title>
            </Head>
            <Header />
            <OrdersTable />
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

export default Order;
