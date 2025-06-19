import { Customer } from '../model/customer';
import { Product } from '../model/product';
import database from './database';
import { Customer as customerPrisma } from '@prisma/client';

const getCustomers = async (): Promise<Customer[]> => {
    try {
        const customersPrisma = await database.customer.findMany({
            include: { wishlist: true },
        });
        return customersPrisma.map((customerPrisma) => Customer.from(customerPrisma));
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const getCustomerById = async ({ id }: { id: number }): Promise<Customer | null> => {
    try {
        const customerPrisma = await database.customer.findUnique({
            where: { id: id },
            include: { wishlist: true },
        });

        if (!customerPrisma) {
            return null;
        }
        return Customer.from(customerPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const getCustomerByEmail = async ({ email }: { email: string }): Promise<Customer | null> => {
    try {
        const customerPrisma = await database.customer.findUnique({
            where: { email: email },
            include: { wishlist: true },
        });

        if (!customerPrisma) {
            return null;
        }
        return Customer.from(customerPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const createCustomer = async (customer: Customer): Promise<Customer> => {
    try {
        const customerPrisma = await database.customer.create({
            data: {
                firstName: customer.getFirstName(),
                lastName: customer.getLastName(),
                email: customer.getEmail(),
                password: customer.getPassword(),
                role: customer.getRole(),
            },
            include: { wishlist: true },
        });
        return Customer.from(customerPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const updateCustomer = async (updatedCustomer: Customer): Promise<Customer> => {
    try {
        const customerPrisma = await database.customer.update({
            where: { id: updatedCustomer.getId() },
            data: {
                firstName: updatedCustomer.getFirstName(),
                lastName: updatedCustomer.getLastName(),
                email: updatedCustomer.getEmail(),
                password: updatedCustomer.getPassword(),
                role: updatedCustomer.getRole(),
            },
            include: { wishlist: true },
        });
        return Customer.from(customerPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const deleteCustomer = async ({ email }: { email: string }): Promise<string> => {
    try {
        await database.customer.delete({
            where: { email: email },
        });
        return 'Customer has been deleted.';
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const addProductToWishlist = async (customer: Customer, product: Product): Promise<Product> => {
    try {
        await database.customer.update({
            where: { id: customer.getId() },
            data: {
                wishlist: {
                    connect: { id: product.getId() },
                },
            },
        });
        const productPrisma = await database.product.findUnique({
            where: { id: product.getId() },
        });

        if (!productPrisma) {
            throw new Error('Product not found.');
        }
        return Product.from(productPrisma);
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

const removeProductFromWishlist = async (customer: Customer, product: Product): Promise<string> => {
    try {
        await database.customer.update({
            where: { id: customer.getId() },
            data: {
                wishlist: {
                    disconnect: { id: product.getId() },
                },
            },
        });

        return 'Product has been removed from the wishlist.';
    } catch (error) {
        console.error(error);
        throw new Error('Database error. See server log for details.');
    }
};

export default {
    getCustomers,
    getCustomerById,
    createCustomer,
    getCustomerByEmail,
    updateCustomer,
    deleteCustomer,
    addProductToWishlist,
    removeProductFromWishlist,
};
