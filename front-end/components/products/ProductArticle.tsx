import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@styles/home.module.css';
import { Customer, Product } from '@types';
import ProductService from '@services/ProductService';

type ProductCardProps = {
    loggedInUser: Customer;
    product: Product;
    quantity?: number;
    wishlist?: Product[];
    updateProduct?: (product: Product) => void;
    addItemToCart?: (id: number) => void;
    addToWishlist?: (id: number) => void;
    removeFromWishlist?: (id: number) => void;
    deleteProduct?: (id: number) => void;
    updateQuantity?: (id: number, quantity: number) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({
    loggedInUser,
    product,
    quantity,
    wishlist,
    updateProduct,
    addItemToCart,
    addToWishlist,
    removeFromWishlist,
    deleteProduct,
    updateQuantity,
}) => {
    const [rating, setRating] = useState<number[]>([]);
    const [newRating, setNewRating] = useState<number | null>(null);
    const [isRatingInputVisible, setIsRatingInputVisible] = useState(false);
    const [ratingError, setRatingError] = useState('');

    useEffect(() => {
        if (product.rating) {
            setRating(product.rating);
        }
    }, [product.rating]);

    const handleAddRating = async () => {
        setRatingError('');
        if (newRating && newRating >= 1 && newRating <= 5) {
            if (product.id !== undefined) {
                await ProductService.addRatingToProduct(product.id, newRating);
            }
            setRating((prevRatings) => [...prevRatings, newRating]);
            setIsRatingInputVisible(false);
        } else {
            setRatingError('Please enter a valid rating between 1 and 5.');
        }
    };

    return (
        <article
            key={product.id}
            className="flex flex-row bg-gray-50 border border-gray-300 rounded-lg overflow-hidden m-4 p-4 shadow-md w-full"
            style={{ width: '100%' }}
        >
            <Image
                src={`/images/${product.images}.png`}
                alt="Product image"
                className={styles.vercelLogo}
                width={300}
                height={350}
                style={{ objectFit: 'cover' }}
            />
            <div className="flex flex-col justify-between ml-4 w-full">
                <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <div className="mt-2">
                        <p className="font-bold text-black">Price: ${product.price}</p>
                        <p className="text-gray-600">Stock: {product.stock}</p>
                        {quantity &&
                            (product.stock - quantity <= 0 ? (
                                <p className="text-red-500 font-semibold">Low stock: None left.</p>
                            ) : (
                                product.stock - quantity < 5 && (
                                    <p className="text-red-500 font-semibold">
                                        Low stock: Only {product.stock - quantity} left.
                                    </p>
                                )
                            ))}
                        {quantity && (
                            <p className="text-green-500 font-semibold">
                                Amount in cart: {quantity}
                            </p>
                        )}
                    </div>
                </div>
                <div className="mt-4">
                    <div className="text-left">
                        <strong>Categories:</strong> {product.categories.join(', ')}
                    </div>
                    <div className="text-left">
                        <strong>Sizes:</strong> {product.sizes.join(', ')}
                    </div>
                    <div className="text-left">
                        <strong>Colors:</strong> {product.colors.join(', ')}
                    </div>
                    <div className="text-left">
                        <strong>Average rating:</strong>{' '}
                        {rating.length > 0
                            ? Math.round(
                                  (rating.reduce((acc, curr) => acc + curr, 0) / rating.length) *
                                      100
                              ) / 100
                            : 'No ratings yet'}
                        /5
                    </div>
                    {isRatingInputVisible ? (
                        <div className="flex items-center mt-2">
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={newRating || ''}
                                onChange={(e) => setNewRating(Number(e.target.value))}
                                className="border p-2 h-10"
                            />
                            <button
                                onClick={handleAddRating}
                                className="bg-black text-white py-2 px-4 rounded h-10 ml-2"
                            >
                                Submit Rating
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsRatingInputVisible(true)}
                            className="bg-black text-white py-2 px-4 rounded h-10 mt-1"
                        >
                            Add Rating
                        </button>
                    )}
                    {ratingError && <p className="text-red-500 text-sm">{ratingError}</p>}
                </div>
            </div>
            <div className="flex flex-col justify-center items-center ml-4">
                {addItemToCart && loggedInUser && loggedInUser.role === 'customer' && (
                    <button
                        onClick={() => {
                            addItemToCart(product.id!);
                        }}
                        className="flex items-center bg-white border rounded p-2 mt-2 transition duration-200 hover:bg-gray-200"
                    >
                        <Image
                            src="/images/shopping-cart.png"
                            alt="Add to Cart"
                            width={30}
                            height={30}
                            className="mr-2"
                        />
                    </button>
                )}
                {wishlist &&
                    addToWishlist &&
                    loggedInUser &&
                    loggedInUser.role === 'customer' &&
                    !wishlist.some(
                        (productInWishlist: Product) => productInWishlist.id === product.id
                    ) && (
                        <button
                            type="button"
                            onClick={() => {
                                addToWishlist(product.id!);
                            }}
                            className="p-2 mt-2 rounded-xl text-sm font-normal transition duration-200 hover:bg-gray-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                className="w-7 h-7 fill-blue-500"
                            >
                                <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" />
                            </svg>
                        </button>
                    )}
                {wishlist &&
                    loggedInUser &&
                    loggedInUser.role === 'customer' &&
                    removeFromWishlist &&
                    wishlist.some(
                        (productInWishlist: Product) => productInWishlist.id === product.id
                    ) && (
                        <button
                            type="button"
                            onClick={() => {
                                removeFromWishlist(product.id!);
                            }}
                            className="p-2 mt-2 rounded-xl text-sm font-normal transition duration-200 hover:bg-gray-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                className="w-7 h-7 fill-red-500"
                            >
                                <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                            </svg>
                        </button>
                    )}
                {updateProduct &&
                    deleteProduct &&
                    loggedInUser &&
                    loggedInUser.role === 'admin' && (
                        <div className="flex flex-col space-y-2">
                            <button
                                type="button"
                                onClick={() => updateProduct(product)}
                                className="bg-black text-white py-2 px-4 rounded h-10 mt-1"
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteProduct(product.id!)}
                                className="bg-black text-white py-2 px-4 rounded h-10 mt-1"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                {updateQuantity && loggedInUser && loggedInUser.role === 'customer' && (
                    <div className="flex flex-col space-y-2 w-full">
                        <button
                            onClick={() => updateQuantity(product.id!, 1)}
                            className="bg-black text-white py-2 px-4 rounded h-10 mt-1 w-full"
                        >
                            Increment
                        </button>
                        <button
                            onClick={() => updateQuantity(product.id!, -1)}
                            className="bg-black text-white py-2 px-4 rounded h-10 mt-1 w-full"
                        >
                            Decrease
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
};

export default ProductCard;
