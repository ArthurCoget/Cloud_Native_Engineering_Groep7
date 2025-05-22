import { Product } from '@types';

const getAllProducts = () => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + '/products', {
        method: 'GET',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

const createProduct = (product: Product) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
    });
};

const updateProduct = (productId: string, product: Product) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
    });
};

const deleteProduct = (productId: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

export const addReviewToProduct = (productId: number, rating: number, comment?: string) => {
    // grab token & customerId from sessionStorage
    const { token, email, role } = JSON.parse(sessionStorage.getItem('loggedInUser')!);
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/rating`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            rating,
            comment: comment ?? null,
            email,
            role,
        }),
    });
};

const getProductById = (productId: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/products/${productId}`, {
        method: 'GET',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

const ProductService = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    addReviewToProduct,
};

export default ProductService;
