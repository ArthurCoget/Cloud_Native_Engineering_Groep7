"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const user_1 = require("./user");
// import { Product as ProductPrisma, Customer as CustomerPrisma } from '@prisma/client';
class Customer extends user_1.User {
    wishlist;
    constructor(customer) {
        super(customer);
        this.wishlist = customer.wishlist;
    }
    getWishlist() {
        return this.wishlist;
    }
    addProductToWishlist(product) {
        if (this.wishlist.includes(product)) {
            throw new Error("Product is already in the wishlist.");
        }
        this.wishlist.push(product);
        return product;
    }
    removeProductFromWishlist(product) {
        const productIndex = this.wishlist.indexOf(product);
        if (productIndex === -1) {
            throw new Error("Product is not in the wishlist.");
        }
        this.wishlist = this.wishlist.filter((item) => item !== product);
        return "Product removed from wishlist.";
    }
}
exports.Customer = Customer;
//# sourceMappingURL=customer.js.map