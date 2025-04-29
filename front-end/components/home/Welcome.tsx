import React from 'react';
import { useTranslation } from 'next-i18next';

const WelcomeToSite: React.FC = () => {
    

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-gray-800 tracking-wide">
                    Welcome <span className="text-blue-600">JB-Clothing</span>
                </h1>
                <p className="text-lg text-gray-600 mt-4">Discover your style with our exclusive collection.</p>
            </div>
        </div>
    );
};

export default WelcomeToSite;
