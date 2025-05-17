import RecommendedProducts from '@components/recommendations/RecommendationGrid';
import { useTranslation } from 'next-i18next';
import React from 'react';

type WelcomeToSiteProps = {
    loggedInUser: any | null;
};
const WelcomeToSite: React.FC<WelcomeToSiteProps> = ({ loggedInUser }) => {
    const { t } = useTranslation();

    return (
        <>
            {loggedInUser ? (
                <>
                    <div className="flex justify-center items-center m-[3rem]">
                        <div className="text-center mb-8">
                            <h1 className="text-5xl font-bold text-gray-800 tracking-wide">
                                {t('header.welcome')}{' '}
                                <span className="text-blue-600">{t('app.title')}</span>
                            </h1>
                            <p className="text-lg text-gray-600 mt-4">{t('home.discoverStyle')}</p>
                        </div>
                    </div>
                    <RecommendedProducts></RecommendedProducts>
                </>
            ) : (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-gray-800 tracking-wide">
                            {t('header.welcome')}{' '}
                            <span className="text-blue-600">{t('app.title')}</span>
                        </h1>
                        <p className="text-lg text-gray-600 mt-4">{t('home.discoverStyle')}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default WelcomeToSite;
