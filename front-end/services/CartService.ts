const getAllCarts = () => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + '/carts', {
        method: 'GET',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

const getCartById = (cartId: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/carts/${cartId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

const getCartByEmail = (email: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/carts/email/${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

const getOwnCartByEmail = (email: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/carts/email/own/${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

const addItemToCart = (email: string, productId: string, quantity: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(
        process.env.NEXT_PUBLIC_API_URL + `/carts/addItems/${email}/${productId}/${quantity}`,
        {
            method: 'PUT',
            headers: {
                'content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

const removeItemFromCart = (email: string, productId: string, quantity: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(
        process.env.NEXT_PUBLIC_API_URL + `/carts/removeItems/${email}/${productId}/${quantity}`,
        {
            method: 'PUT',
            headers: {
                'content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

const addDiscountCodeToCart = (email: string, code: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(process.env.NEXT_PUBLIC_API_URL + `/carts/addDiscountCode/${email}/${code}`, {
        method: 'PUT',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
};

const convertCartToOrder = (email: string, paymentStatus: string) => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    return fetch(
        process.env.NEXT_PUBLIC_API_URL +
            `/carts/convertToOrder/${email}?paymentStatus=${paymentStatus}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

const CartService = {
    getAllCarts,
    getCartById,
    getCartByEmail,
    addItemToCart,
    removeItemFromCart,
    addDiscountCodeToCart,
    convertCartToOrder,
    getOwnCartByEmail,
};

export default CartService;
