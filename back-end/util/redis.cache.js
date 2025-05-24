"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
// @ts-ignore
const redis_1 = require("redis");
class RedisCache {
    constructor(redisClient) {
        if (!redisClient) {
            throw new Error('A Redis client is required.');
        }
        this.cacheClient = redisClient;
    }
    static createClient() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheHostName = process.env.REDIS_HOST_NAME;
            const cachePassword = process.env.REDIS_ACCESS_KEY;
            const cachePort = process.env.REDIS_PORT || '6380';
            if (!cacheHostName)
                throw new Error('REDIS_HOST_NAME is empty');
            if (!cachePassword)
                throw new Error('REDIS_ACCESS_KEY is empty');
            const cacheConnection = (0, redis_1.createClient)({
                url: `rediss://${cacheHostName}:${cachePort}`,
                password: cachePassword,
                protocol: 3,
            });
            yield cacheConnection.connect();
            return cacheConnection;
        });
    }
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.instance) {
                const cacheConnection = yield this.createClient();
                this.instance = new RedisCache(cacheConnection);
            }
            else if (!this.instance.cacheClient.isOpen || !this.instance.cacheClient.isReady) {
                try {
                    yield this.instance.cacheClient.connect();
                }
                catch (error) {
                    console.error('Redis reconnection failed:', error);
                    this.instance = new RedisCache(yield this.createClient());
                }
            }
            return this.instance;
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cacheClient.get(key);
        });
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            // 600 --> 10 minutes
            // 15 s for testing
            yield this.cacheClient.set(key, value, { EX: 15 });
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cacheClient.del(key);
        });
    }
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cacheClient.quit();
        });
    }
}
exports.RedisCache = RedisCache;
