import Header from '@components/header';
import { Customer, Product } from '@types';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import ProductService from '@services/ProductService';
import ProductOverviewTable from '@components/products/ProductOverviewTable';
import CartService from '@services/CartService';
import useSWR, { mutate } from 'swr';
import useInterval from 'use-interval';
import CustomerService from '@services/CustomerService';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ProductEditor from '@components/products/ProductEditor';

const Products: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useState<Customer | null>(null);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [uniqueColors, setUniqueColors] = useState<string[]>([]);
    const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(1000);
    const { t } = useTranslation();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
    const openCreateProduct = () => {
        setSelectedProduct(null);
        setIsCreateProductOpen(true);
    };
    const closeCreateProduct = () => setIsCreateProductOpen(false);

    const reloadProducts = () => {
        mutate('products', getProducts());
    };

    const openUpdateProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsCreateProductOpen(true);
    };

    const handleSaveProduct = async () => {
        setSelectedProduct(null);
        setIsCreateProductOpen(false);
        mutate('products', getProducts());
    };

    const filterProducts = (productData: Product[]) => {
        if (minPrice < 0) {
            setMinPrice(0);
        }
        if (maxPrice < 0) {
            setMaxPrice(1000);
        } else if (maxPrice < minPrice) {
            setMaxPrice(minPrice);
        }
        return productData.filter(
            (product) =>
                (selectedSizes.length === 0 ||
                    product.sizes.some((size) => selectedSizes.includes(size))) &&
                (selectedColors.length === 0 ||
                    product.colors.some((color) => selectedColors.includes(color))) &&
                (selectedCategories.length === 0 ||
                    product.categories.some((category) => selectedCategories.includes(category))) &&
                (searchQuery === '' ||
                    product.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                product.price >= minPrice &&
                product.price <= maxPrice
        );
    };

    const getUniqueColorsAndCategories = (products: Product[]) => {
        const colors = new Set<string>(products.flatMap((product: Product) => product.colors));
        const categories = new Set<string>(
            products.flatMap((product: Product) => product.categories)
        );
        setUniqueColors(Array.from(colors));
        setUniqueCategories(Array.from(categories));
    };

    const handleSizeChange = (inputSize: string) => {
        if (selectedSizes.includes(inputSize)) {
            setSelectedSizes(selectedSizes.filter((size) => size !== inputSize));
        } else {
            setSelectedSizes([...selectedSizes, inputSize]);
        }
    };

    const handleColorChange = (inputColor: string) => {
        if (selectedColors.includes(inputColor)) {
            setSelectedColors(selectedColors.filter((color) => color !== inputColor));
        } else {
            setSelectedColors([...selectedColors, inputColor]);
        }
    };

    const handleCategoryChange = (inputCategory: string) => {
        if (selectedCategories.includes(inputCategory)) {
            setSelectedCategories(
                selectedCategories.filter((category) => category !== inputCategory)
            );
        } else {
            setSelectedCategories([...selectedCategories, inputCategory]);
        }
    };

    const getProducts = async () => {
        const response = await ProductService.getAllProducts();
        if (response.ok) {
            const products = await response.json();
            getUniqueColorsAndCategories(products);
            return filterProducts(products);
        }
    };

    const { data: products, isLoading, error } = useSWR('products', getProducts);

    useEffect(() => {
        setLoggedInUser(JSON.parse(sessionStorage.getItem('loggedInUser')!));
    }, []);

    useInterval(() => {
        mutate('products', getProducts());
    }, 4000);

    useEffect(() => {
        mutate('products', getProducts());
    }, [selectedSizes, selectedColors, selectedCategories, searchQuery, minPrice, maxPrice]);

    return (
        <>
            <Head>
                <title>Products</title>
            </Head>
            <Header />
            <main className="d-flex flex-column justify-content-center align-items-center">
                {error && <div className="text-red-800">{error}</div>}
                {isLoading && <p className="text-green-800">Loading...</p>}
                <section className="block mb-2 text-sm font-medium">
                    <input
                        type="text"
                        value={searchQuery ?? ''}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="What are you looking for?"
                        className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
                    />
                </section>

                <section className="flex">
                    <div className="w-1/5 p-4">
                        <div className="flex flex-col mb-2 text-sm font-medium">
                            <p className="font-medium border-b-2 border-yellow-400 mb-2">Sizes</p>
                            <div className="flex flex-col max-h-60 overflow-y-auto">
                                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                                    <label key={size} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value={size}
                                            checked={selectedSizes.includes(size)}
                                            onChange={() => handleSizeChange(size)}
                                            className="border border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        {size}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {uniqueColors && (
                            <div className="flex flex-col mb-2 text-sm font-medium">
                                <p className="font-medium border-b-2 border-yellow-400 mb-2">
                                    Colors
                                </p>
                                <div className="flex flex-col max-h-60 overflow-y-auto">
                                    {uniqueColors.map((color) => (
                                        <label key={color} className="flex items-center gap-2 mb-1">
                                            <input
                                                type="checkbox"
                                                value={color}
                                                checked={selectedColors.includes(color)}
                                                onChange={() => handleColorChange(color)}
                                                className="border border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            {color}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {uniqueCategories && (
                            <div className="flex flex-col mb-2 text-sm font-medium">
                                <p className="font-medium border-b-2 border-yellow-400 mb-2">
                                    Categories
                                </p>
                                <div className="flex flex-col max-h-60 overflow-y-auto">
                                    {uniqueCategories.map((category) => (
                                        <label
                                            key={category}
                                            className="flex items-center gap-2 mb-1"
                                        >
                                            <input
                                                type="checkbox"
                                                value={category}
                                                checked={selectedCategories.includes(category)}
                                                onChange={() => handleCategoryChange(category)}
                                                className="border border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            {category}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col mb-2 text-sm font-medium">
                            <p className="font-medium border-b-2 border-yellow-400 mb-2">Price</p>
                            <div className="flex flex-col max-h-60 overflow-y-auto">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(Number(e.target.value))}
                                        className="border border-gray-300 rounded focus:ring-blue-500 w-16"
                                    />
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                                        className="border border-gray-300 rounded focus:ring-blue-500 w-16"
                                    />
                                </label>
                            </div>
                        </div>
                        {loggedInUser && loggedInUser.role === 'admin' && (
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <button
                                    type="button"
                                    onClick={() => openCreateProduct()}
                                    className="w-min bg-black text-white py-2 rounded px-1"
                                >
                                    Create product
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-4/5 p-4">
                        {products && loggedInUser && (
                            <ProductOverviewTable
                                products={products}
                                forWishlistpage={false}
                                loggedInUser={loggedInUser}
                                updateProduct={openUpdateProduct}
                                reloadProducts={reloadProducts}
                            />
                        )}
                        <ProductEditor
                            isOpen={isCreateProductOpen}
                            onClose={closeCreateProduct}
                            onSave={handleSaveProduct}
                            productToUpdate={selectedProduct}
                        />
                    </div>
                </section>
            </main>
        </>
    );
};

export const getServerSideProps = async (context: { locale: any }) => {
    const { locale } = context;

    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    };
};

export default Products;
