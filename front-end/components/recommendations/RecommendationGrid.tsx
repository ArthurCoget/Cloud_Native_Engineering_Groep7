// components/RecommendedSections.tsx
import ProductOverviewTable from '@components/products/ProductOverviewTable';
import OrderService from '@services/OrderService';
import ProductService from '@services/ProductService';
import { Customer, Product } from '@types';
import React, { useEffect, useState } from 'react';

const NUM_TO_SHOW = 6;

const RecommendedSections: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useState<Customer | null>(null);
    const [buyAgain, setBuyAgain] = useState<Product[]>([]);
    const [recommended, setRecommended] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // load user from session
        const stored = sessionStorage.getItem('loggedInUser');
        if (!stored) {
            setLoading(false);
            return;
        }
        const user: Customer = JSON.parse(stored);
        setLoggedInUser(user);

        (async () => {
            try {
                if (!user.email) throw new Error('User email is undefined');
                const ordRes = await OrderService.getOrdersByCustomer(user.email);
                let purchased: Product[] = [];
                if (ordRes.ok) {
                    const orders = await ordRes.json();

                    const allItems = orders.flatMap((o: any) => o.items as { product: Product }[]);

                    const seen = new Set<number>();
                    purchased = allItems
                        .map((item: { product: Product }) => item.product)
                        .filter((p: Product) => {
                            if (seen.has(p.id!)) return false;
                            seen.add(p.id!);
                            return true;
                        })
                        .slice(0, NUM_TO_SHOW);
                }

                setBuyAgain(purchased);

                // 2) fetch everything, filter out those already bought, shuffle, take first
                const prodRes = await ProductService.getAllProducts();
                if (prodRes.ok) {
                    const all: Product[] = await prodRes.json();
                    const neverBought = all.filter((p) => !purchased.some((b) => b.id === p.id));
                    const shuffled = neverBought
                        .map((p) => ({ p, r: Math.random() }))
                        .sort((a, b) => a.r - b.r)
                        .map(({ p }) => p)
                        .slice(0, NUM_TO_SHOW);
                    setRecommended(shuffled);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading || !loggedInUser) return null;

    return (
        <div className="max-w-6xl mx-auto my-8 space-y-12">
            {buyAgain.length > 0 && (
                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        Buy Again, {loggedInUser.fullname}
                    </h2>
                    <ProductOverviewTable
                        products={buyAgain}
                        forWishlistpage={false}
                        loggedInUser={loggedInUser}
                        grid
                    />
                </section>
            )}

            {recommended.length > 0 && (
                <section>
                    <h2 className="text-2xl font-semibold mb-4">You May Like</h2>
                    <ProductOverviewTable
                        products={recommended}
                        forWishlistpage={false}
                        loggedInUser={loggedInUser}
                        grid
                    />
                </section>
            )}
        </div>
    );
};

export default RecommendedSections;
