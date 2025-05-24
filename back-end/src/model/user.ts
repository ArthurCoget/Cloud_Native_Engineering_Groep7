import { Role } from '../types';

export abstract class User {
    private id?: number;
    private firstName: string;
    private lastName: string;
    private email: string;
    private password: string;
    private role: Role;

    constructor(user: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: Role;
        id?: number;
    }) {
        this.validate(user);
        this.id = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password;
        this.role = user.role;
    }

    getId(): number | undefined {
        return this.id;
    }

    getFirstName(): string {
        return this.firstName;
    }

    getLastName(): string {
        return this.lastName;
    }

    getEmail(): string {
        return this.email;
    }

    getPassword(): string {
        return this.password;
    }

    getRole(): Role {
        return this.role;
    }

    validate(user: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: Role;
    }) {
        if (!user.firstName.trim()) throw new Error('The first name is required.');

        if (user.firstName.length < 2 || user.firstName.length > 50)
            throw new Error('The first name must be between 2 and 50 characters.');

        if (!user.lastName.trim()) throw new Error('The last name is required.');

        if (user.lastName.length < 2 || user.lastName.length > 50)
            throw new Error('The last name must be between 2 and 50 characters.');

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!user.email.trim()) throw new Error('The email is required.');

        if (!emailRegex.test(user.email)) throw new Error('The email format is invalid.');

        if (!user.password.trim()) throw new Error('The password is required.');

        if (user.password.length < 8)
            throw new Error('The password must be at least 8 characters long.');
        if (!user.role) {
            throw new Error('Role is required');
        }
    }

    updateUser(user: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: Role;
    }) {
        this.validate(user);
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password;
        this.role = user.role;
    }
}
