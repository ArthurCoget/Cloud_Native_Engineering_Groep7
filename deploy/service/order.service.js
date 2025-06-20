"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = require("express-jwt");
const cosmos_order_repository_1 = require("../repository/cosmos-order-repository"); // Replace orderDb
const getOrders = async ({ email, role, }) => {
    if (role === "admin" || role === "salesman") {
        const repo = await cosmos_order_repository_1.CosmosOrderRepository.getInstance();
        return repo.getOrders();
    }
    else if (role === "customer") {
        const repo = await cosmos_order_repository_1.CosmosOrderRepository.getInstance();
        return repo.getOrdersByCustomer(email); // Pass email directly
    }
    else {
        throw new express_jwt_1.UnauthorizedError("credentials_required", {
            message: "You must be logged in to access orders.",
        });
    }
};
const getOrderById = async (id, email, role) => {
    const repo = await cosmos_order_repository_1.CosmosOrderRepository.getInstance();
    const order = await repo.getOrderById(id);
    if (!order)
        throw new Error(`Order with id ${id} does not exist.`);
    if (role === "admin" ||
        role === "salesman" ||
        (role === "customer" && email === order.getCustomer().getEmail())) {
        return order;
    }
    else {
        throw new express_jwt_1.UnauthorizedError("credentials_required", {
            message: "You must be a salesman, admin, or be logged in as the customer who the order belongs to to access an order by id.",
        });
    }
};
const deleteOrder = async (orderId, email, role) => {
    if (role === "admin" || role === "salesman") {
        const repo = await cosmos_order_repository_1.CosmosOrderRepository.getInstance();
        const existingOrder = await repo.getOrderById(orderId);
        if (!existingOrder)
            throw new Error("This order does not exist.");
        return await repo.deleteOrder(orderId);
    }
    else {
        throw new express_jwt_1.UnauthorizedError("credentials_required", {
            message: "You must be a salesman or admin to delete an order.",
        });
    }
};
exports.default = {
    getOrders,
    getOrderById,
    deleteOrder,
};
//# sourceMappingURL=order.service.js.map