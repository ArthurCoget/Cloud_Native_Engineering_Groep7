import CartService from '@services/CartService';
import CustomerService from '@services/CustomerService';
import ProductService from '@services/ProductService';
import { Customer, Product, StatusMessage } from '@types';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import useInterval from 'use-interval';
import ProductArticle from './ProductArticle';

type Props = {
    products?: Array<Product>;
    forWishlistpage: boolean;
    loggedInUser: Customer;
    updateProduct?: (product: Product) => void;
    reloadProducts?: () => void;
    grid?: boolean;
};

const ProductOverviewTable: React.FC<Props> = ({
    products,
    forWishlistpage,
    loggedInUser,
    updateProduct,
    reloadProducts,
    grid = false,
}) => {
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

    // Notification state
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Auto-dismiss toast after 3 seconds
    useEffect(() => {
        if (toastMessage) {
            const id = setTimeout(() => setToastMessage(null), 3000);
            return () => clearTimeout(id);
        }
    }, [toastMessage]);

    const deleteProduct = async (id: number) => {
        setStatusMessages([]);
        const response = await ProductService.deleteProduct(id.toString());
        if (!response.ok) {
            if (response.status === 401) {
                setStatusMessages([
                    {
                        message: 'You must be an admin to delete a product.',
                        type: 'error',
                    },
                ]);
            } else {
                const error = await response.json();
                setStatusMessages([
                    {
                        message: 'Failed to delete product: ' + error.message,
                        type: 'error',
                    },
                ]);
            }
        }
        if (reloadProducts) {
            reloadProducts();
        }
    };

    const addItemToCart = async (productId: number) => {
        setStatusMessages([]);

        const response = await CartService.addItemToCart(
            loggedInUser?.email!,
            productId.toString(),
            '1'
        );

        if (response.ok) {
            mutate('cart');
            setToastMessage('Product toegevoegd aan winkelwagen!');
        }

        if (!response.ok) {
            if (response.status === 401) {
                setStatusMessages([
                    {
                        message: 'You must be logged in as a customer to add an item to your cart.',
                        type: 'error',
                    },
                ]);
            } else {
                const error = await response.json();
                setStatusMessages([
                    {
                        message: 'Failed to add product to cart: ' + error.message,
                        type: 'error',
                    },
                ]);
            }
        }
    };

    const addToWishlist = async (productId: number) => {
        setStatusMessages([]);

        const response = await CustomerService.addToWishlist(
            loggedInUser?.email!,
            productId.toString()
        );
        setToastMessage('Product toegevoegd aan wishlist!');

        if (!response.ok) {
            if (response.status === 401) {
                setStatusMessages([
                    {
                        message: 'You must be logged in to add a product to your wishlist.',
                        type: 'error',
                    },
                ]);
            } else {
                const error = await response.json();
                setStatusMessages([
                    {
                        message: 'Failed to add product to wishlist: ' + error.message,
                        type: 'error',
                    },
                ]);
            }
        } else {
            mutate('wishlist', getWishlist());
        }
    };

    const removeFromWishlist = async (productId: number) => {
        setStatusMessages([]);

        const response = await CustomerService.removeFromWishlist(
            loggedInUser?.email!,
            productId.toString()
        );
        setToastMessage('Product verwijderd van wishlist!');

        if (!response.ok) {
            if (response.status === 401) {
                setStatusMessages([
                    {
                        message: 'You must be logged in to remove a product from your wishlist.',
                        type: 'error',
                    },
                ]);
            } else {
                const error = await response.json();
                setStatusMessages([
                    {
                        message: 'Failed to remove product from wishlist: ' + error.message,
                        type: 'error',
                    },
                ]);
            }
        } else {
            mutate('wishlist', getWishlist());
        }
    };

    const getWishlist = async () => {
        const response = await CustomerService.getWishlist(loggedInUser.email!);
        if (response.ok) {
            const wishlist = await response.json();
            return wishlist;
        }
    };

    const { data: wishlist, isLoading, error } = useSWR('wishlist', getWishlist);

    useInterval(() => {
        mutate('wishlist', getWishlist());
    }, 4000);

    return (
        <>
            {statusMessages && statusMessages.length > 0 && (
                <div className="row">
                    <ul className="list-none mb-3 mx-auto">
                        {statusMessages.map(({ message, type }, index) => (
                            <li
                                key={index}
                                className={classNames({
                                    'text-red-800': type === 'error',
                                    'text-green-800': type === 'success',
                                })}
                            >
                                {message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded shadow-lg">
                    {toastMessage}
                </div>
            )}
            {grid && products && products.length > 0 ? (
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <ProductArticle
                            key={product.id}
                            loggedInUser={loggedInUser}
                            product={product}
                            wishlist={wishlist ?? []}
                            updateProduct={updateProduct}
                            addItemToCart={addItemToCart}
                            addToWishlist={addToWishlist}
                            removeFromWishlist={removeFromWishlist}
                            grid={grid}
                        />
                    ))}
                </div>
            ) : !forWishlistpage && products && products.length > 0 ? (
                <div className="container mx-auto px-4 flex flex-row flex-wrap">
                    <div>
                        {products.map((product) => (
                            <ProductArticle
                                loggedInUser={loggedInUser}
                                product={product}
                                wishlist={wishlist ?? []}
                                updateProduct={updateProduct}
                                addItemToCart={addItemToCart}
                                addToWishlist={addToWishlist}
                                removeFromWishlist={removeFromWishlist}
                                deleteProduct={deleteProduct}
                            ></ProductArticle>
                        ))}
                    </div>
                </div>
            ) : forWishlistpage && wishlist && wishlist.length > 0 ? (
                <div className="container mx-auto px-4 flex flex-row flex-wrap">
                    <div>
                        {wishlist.map((product: Product) => (
                            <ProductArticle
                                loggedInUser={loggedInUser}
                                product={product}
                                wishlist={wishlist}
                                addItemToCart={addItemToCart}
                                addToWishlist={addToWishlist}
                                removeFromWishlist={removeFromWishlist}
                            ></ProductArticle>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-center mt-8">No products or wishlist items available.</p>
            )}
        </>
    );
};
export default ProductOverviewTable;
