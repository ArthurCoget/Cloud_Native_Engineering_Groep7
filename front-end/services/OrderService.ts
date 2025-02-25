import { Order } from '@types';

const getAllOrders = async (): Promise<Order[]> => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/orders', {
        method: 'GET',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return await response.json();
};

const getOrderById = async (id: string): Promise<Order> => {
    const token = JSON.parse(sessionStorage.getItem('loggedInUser')!).token;
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/orders/${id}`, {
        method: 'GET',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return await response.json();
};

const OrderService = {
    getAllOrders,
    getOrderById,
};

export default OrderService;
