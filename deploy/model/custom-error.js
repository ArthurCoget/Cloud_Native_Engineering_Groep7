"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
    static internal(message) {
        return new CustomError(500, message);
    }
    static invalid(message) {
        return new CustomError(400, message);
    }
    static notFound(message) {
        return new CustomError(404, message);
    }
    static conflict(message) {
        return new CustomError(409, message);
    }
    static unauthenticated(message) {
        return new CustomError(401, message);
    }
    static unauthorized(message) {
        return new CustomError(403, message);
    }
    static authenticated(message) {
        return new CustomError(403, message);
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=custom-error.js.map