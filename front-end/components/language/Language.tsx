import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const Language: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { locale, pathname, asPath, query } = router;

    const handleLanguageChange = (event: { target: { value: string } }) => {
        const newLocale = event.target.value;
        const { pathname, asPath, query } = router;
        router.push({ pathname, query }, asPath, { locale: newLocale });
    };

    return (
        <div className="ml-6">
            <label htmlFor="language" className="text-white">
                {t('header.nav.language')}
            </label>
            <select
                id="language"
                className="ml-2 p-1"
                value={locale}
                onChange={handleLanguageChange}
            >
                <option value="en">{t('header.nav.languageOption1')}</option>
                <option value="nl">{t('header.nav.languageOption2')}</option>
            </select>
        </div>
    );
};

export default Language;
