// pages/products/[id].tsx

import Header from '@components/header';
import ProductCard from '@components/products/ProductArticle';
import CartService from '@services/CartService';
import CustomerService from '@services/CustomerService';
import ProductService from '@services/ProductService';
import { Product, Review, StatusMessage } from '@types';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { mutate } from 'swr';

const ProductPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [newRating, setNewRating] = useState<number>(3);
    const [newComment, setNewComment] = useState<string>('');
    const [reviewError, setReviewError] = useState<string | null>(null);

    // Load product details
    useEffect(() => {
        if (!id) return;
        ProductService.getProductById(id as string)
            .then(async (res) => {
                if (!res || !res.ok) {
                    setError('Product not found');
                } else {
                    const p: Product = await res.json();
                    setProduct(p);
                }
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load product');
            });
    }, [id]);

    useEffect(() => {
        setLoggedInUser(JSON.parse(sessionStorage.getItem('loggedInUser')!));
    }, []);

    if (error) {
        return <p className="text-red-500 p-4">{error}</p>;
    }
    if (!product) {
        return <p className="p-4">Loading…</p>;
    }

    // handle review submit
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewError(null);

        if (newRating < 1 || newRating > 5) {
            setReviewError('Rating must be between 1 and 5');
            return;
        }

        try {
            const resp = await ProductService.addReviewToProduct(
                product.id!,
                newRating,
                newComment
            );
            if (!resp.ok) {
                const body = await resp.json();
                setReviewError(body.message || 'Failed to submit review');
            } else {
                // re-fetch updated product
                const fresh = await (
                    await ProductService.getProductById(product.id!.toString())
                ).json();
                setProduct(fresh as Product);
                // reset form
                setNewRating(3);
                setNewComment('');
                setToastMessage('Review submitted!');
            }
        } catch (err) {
            console.error(err);
            setReviewError('Failed to submit review');
        }
    };

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

    return (
        <div>
            <Header></Header>
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">{product.name}</h1>
                {/* Reuse your ProductCard in “list” mode */}
                <ProductCard
                    loggedInUser={loggedInUser}
                    product={product}
                    grid={false}
                    addItemToCart={addItemToCart}
                    addToWishlist={addToWishlist}
                    removeFromWishlist={removeFromWishlist}
                    deleteProduct={deleteProduct}
                />
                <section className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                    {product.reviews && product.reviews.length === 0 ? (
                        <p>No reviews yet.</p>
                    ) : (
                        product.reviews!.map((r: Review) => (
                            <div key={r.id} className="border-b py-2">
                                <p>
                                    <strong>Customer {r.customerId}:</strong> {r.comment || '—'}
                                </p>
                                <p>Rating: {r.rating}/5</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(r.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}

                    {/* leave a review */}
                    {loggedInUser?.role === 'customer' && (
                        <form onSubmit={handleSubmitReview} className="mt-6 border p-4 rounded">
                            <h3 className="text-xl font-semibold mb-2">Leave a Review</h3>
                            <div className="mb-2">
                                <label className="block">
                                    Rating (1–5){' '}
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={newRating}
                                        onChange={(e) => setNewRating(Number(e.target.value))}
                                        required
                                        className="border p-1 w-16 ml-2"
                                    />
                                </label>
                            </div>
                            <div className="mb-2">
                                <label className="block">
                                    Comment (optional)
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="border p-2 w-full h-24 mt-1"
                                    />
                                </label>
                            </div>
                            {reviewError && <p className="text-red-500 mb-2">{reviewError}</p>}
                            <button
                                type="submit"
                                className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
                            >
                                Submit Review
                            </button>
                            {toastMessage && <p className="mt-2 text-green-600">{toastMessage}</p>}
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};
export default ProductPage;
