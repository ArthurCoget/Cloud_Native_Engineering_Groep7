import Header from '@components/header';
import Head from 'next/head';
import Image from 'next/image';
import styles from '@styles/home.module.css';
import UserOverviewTable from '@components/login/UserOverviewTable';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import WelcomeToSite from '@components/home/Welcome';

const Home: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Head>
                <title>{t('app.title')}</title>
                <meta name="description" content="Clothing Store App" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <main className={styles.main}>
                <WelcomeToSite />
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

export default Home;
