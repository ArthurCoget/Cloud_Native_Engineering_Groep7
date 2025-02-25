import React, { useState } from 'react';
import { Product, Customer, StatusMessage } from '@types';
import ProductArticle from './ProductArticle';
import Image from 'next/image';
import CustomerService from '@services/CustomerService';
import CartService from '@services/CartService';
import ProductService from '@services/ProductService';
import classNames from 'classnames';
import useSWR, { mutate } from 'swr';
import useInterval from 'use-interval';

type Props = {
    products?: Array<Product>;
    forWishlistpage: boolean;
    loggedInUser: Customer;
    updateProduct?: (product: Product) => void;
    reloadProducts?: () => void;
};

const ProductOverviewTable: React.FC<Props> = ({
    products,
    forWishlistpage,
    loggedInUser,
    updateProduct,
    reloadProducts,
}) => {
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

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

            {!forWishlistpage && products && products.length > 0 ? (
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
