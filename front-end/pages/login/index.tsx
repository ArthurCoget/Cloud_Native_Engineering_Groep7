import Head from 'next/head';
import Header from '@components/header';
import UserLoginForm from '@components/login/UserLoginForm';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import UserOverviewTable from '@components/login/UserOverviewTable';

const Login: React.FC = () => {

    return (
        <>
            <Head>
                <title>User login</title>
            </Head>
            <Header />
            <main>
                <section className="p-6 min-h-screen flex flex-col items-center">
                    <UserOverviewTable />
                    <UserLoginForm />
                </section>
            </main>
        </>
    );
};



export default Login;
