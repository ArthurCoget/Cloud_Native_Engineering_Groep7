import { Customer } from '@types';

const loginCustomer = (customer: Customer) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + '/customers/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
    });
};

const createCustomer = (customer: Customer) => {
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/customers/signup`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
    });
};

const getWishlist = (email: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/customers/${email}/wishlist/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

const addToWishlist = (email: string, productId: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/customers/addWishlist/${email}/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

const removeFromWishlist = (email: string, productId: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(
        process.env.NEXT_PUBLIC_API_URL + `/customers/removeWishlist/${email}/${productId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

const CustomerService = {
    loginCustomer,
    createCustomer,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};

export default CustomerService;
