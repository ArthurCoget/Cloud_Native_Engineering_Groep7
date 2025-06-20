"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    firstName;
    lastName;
    email;
    password;
    role;
    constructor(user) {
        this.validate(user);
        this.id = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password;
        this.role = user.role;
    }
    getId() {
        return this.id;
    }
    getFirstName() {
        return this.firstName;
    }
    getLastName() {
        return this.lastName;
    }
    getEmail() {
        return this.email;
    }
    getPassword() {
        return this.password;
    }
    getRole() {
        return this.role;
    }
    validate(user) {
        if (!user.firstName.trim())
            throw new Error("The first name is required.");
        if (user.firstName.length < 2 || user.firstName.length > 50)
            throw new Error("The first name must be between 2 and 50 characters.");
        if (!user.lastName.trim())
            throw new Error("The last name is required.");
        if (user.lastName.length < 2 || user.lastName.length > 50)
            throw new Error("The last name must be between 2 and 50 characters.");
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!user.email.trim())
            throw new Error("The email is required.");
        if (!emailRegex.test(user.email))
            throw new Error("The email format is invalid.");
        if (!user.password.trim())
            throw new Error("The password is required.");
        if (user.password.length < 8)
            throw new Error("The password must be at least 8 characters long.");
        if (!user.role) {
            throw new Error("Role is required");
        }
    }
    updateUser(user) {
        this.validate(user);
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password;
        this.role = user.role;
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map