import ProductOverviewTable from '@components/products/ProductOverviewTable';
import ProductService from '@services/ProductService';
import { Customer, Product } from '@types';
import React, { useEffect, useState } from 'react';

/**
 * RecommendedProducts Component
 * Fetches all products and displays a random selection of them using existing ProductOverviewTable styling.
 */
const RecommendedProducts: React.FC = () => {
    const [recommended, setRecommended] = useState<Product[]>([]);
    const [loggedInUser, setLoggedInUser] = useState<Customer | null>(null);
    const count = 8; // number of products to recommend

    useEffect(() => {
        // load logged-in user from sessionStorage
        const stored = sessionStorage.getItem('loggedInUser');
        if (stored) {
            try {
                setLoggedInUser(JSON.parse(stored));
            } catch {
                console.warn('Kon loggedInUser niet parsen:', stored);
            }
        }

        // fetch and pick random recommendations
        const loadRecommendations = async () => {
            const res = await ProductService.getAllProducts();
            if (!res.ok) return;
            const products: Product[] = await res.json();
            const shuffled = products
                .map((p) => ({ p, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ p }) => p);
            setRecommended(shuffled.slice(0, count));
        };
        loadRecommendations();
    }, []);

    if (!loggedInUser || recommended.length === 0) {
        return null;
    }

    return (
        <section className="w-full max-w-6xl mx-auto my-8">
            <h2 className="text-2xl text-center font-semibold mb-4">
                Aanbevolen Producten voor {loggedInUser.fullname}
            </h2>
            <ProductOverviewTable
                products={recommended}
                forWishlistpage={false}
                loggedInUser={loggedInUser}
                grid={true}
            />
        </section>
    );
};

export default RecommendedProducts;
