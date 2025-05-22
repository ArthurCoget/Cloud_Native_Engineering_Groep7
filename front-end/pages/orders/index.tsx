import Header from '@components/header';
import OrdersTable from '@components/orders/ordersTable';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Order: React.FC = () => {

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



export default Order;
