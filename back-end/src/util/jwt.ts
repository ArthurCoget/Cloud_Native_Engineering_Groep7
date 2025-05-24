import * as jwt from 'jsonwebtoken';
import { Role } from '../types';

export interface JwtPayload {
    email: string;
    role: string;
    // add other claims as needed
}

export function verifyJwt(token: string): JwtPayload | null {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Secret is undefined');
    }
    try {
        const decoded = jwt.verify(token, secret);
        if (typeof decoded === 'object' && decoded !== null) {
            // Optionally validate payload shape here
            return decoded as JwtPayload;
        }
        return null;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

const generateJwtToken = ({ email, role }: { email: string; role: Role }): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Secret is undefined');
    }
    const hoursStr = process.env.JWT_EXPIRES_HOURS;
    if (!hoursStr) {
        throw new Error('Hours are undefined');
    }

    const hours = Number(hoursStr);
    if (isNaN(hours)) {
        throw new Error('Hours must be a number');
    }

    const options = {
        expiresIn: hours * 3600, // convert hours to seconds (number)
        issuer: 'courses_app',
    };

    try {
        return jwt.sign({ email, role }, secret, options);
    } catch (error) {
        console.log(error);
        throw new Error('Error generating JWT token, see server log for details.');
    }
};

export { generateJwtToken };
