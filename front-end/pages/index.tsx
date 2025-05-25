import Header from '@components/header';
import WelcomeToSite from '@components/home/Welcome';
import styles from '@styles/home.module.css';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useEffect, useState } from 'react';

const Home: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const item = sessionStorage.getItem('loggedInUser');
        if (item) {
            try {
                setLoggedInUser(JSON.parse(item));
            } catch {
                console.warn('Kon loggedInUser niet parsen:', item);
            }
        }
    }, []);

    return (
        <>
            <Head>
                <title>JB-Clothing</title>
                <meta name="description" content="Clothing Store App" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <main className={styles.main}>
                <WelcomeToSite loggedInUser={loggedInUser} />
            </main>
        </>
    );
};

export default Home;
