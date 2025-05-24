"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const product_1 = require("./product");
const user_1 = require("./user");
class Customer extends user_1.User {
    constructor(customer) {
        super(customer);
        this.wishlist = customer.wishlist;
    }
    getWishlist() {
        return this.wishlist;
    }
    addProductToWishlist(product) {
        if (this.wishlist.includes(product)) {
            throw new Error('Product is already in the wishlist.');
        }
        this.wishlist.push(product);
        return product;
    }
    removeProductFromWishlist(product) {
        const productIndex = this.wishlist.indexOf(product);
        if (productIndex === -1) {
            throw new Error('Product is not in the wishlist.');
        }
        this.wishlist = this.wishlist.filter((item) => item !== product);
        return 'Product removed from wishlist.';
    }
    static from({ id, firstName, lastName, email, password, role, wishlist, }) {
        return new Customer({
            id,
            firstName,
            lastName,
            email,
            password,
            role: role,
            wishlist: wishlist.map((product) => product_1.Product.from(product)),
        });
    }
    static fromWithoutWishlist({ id, firstName, lastName, email, password, role }) {
        return new Customer({
            id,
            firstName,
            lastName,
            email,
            password,
            role: role,
            wishlist: [],
        });
    }
}
exports.Customer = Customer;
