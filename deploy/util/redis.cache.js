"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const redis_1 = require("redis");
class RedisCache {
    static instance;
    cacheClient;
    constructor(redisClient) {
        if (!redisClient) {
            throw new Error("A Redis client is required.");
        }
        this.cacheClient = redisClient;
    }
    static async createClient() {
        const cacheHostName = process.env.REDIS_HOST_NAME;
        const cachePassword = process.env.REDIS_ACCESS_KEY;
        const cachePort = process.env.REDIS_PORT || "6380";
        if (!cacheHostName)
            throw new Error("REDIS_HOST_NAME is empty");
        if (!cachePassword)
            throw new Error("REDIS_ACCESS_KEY is empty");
        const cacheConnection = (0, redis_1.createClient)({
            url: `rediss://${cacheHostName}:${cachePort}`,
            password: cachePassword,
            protocol: 3,
        });
        await cacheConnection.connect();
        return cacheConnection;
    }
    static async getInstance() {
        if (!this.instance) {
            const cacheConnection = await this.createClient();
            this.instance = new RedisCache(cacheConnection);
        }
        else if (!this.instance.cacheClient.isOpen ||
            !this.instance.cacheClient.isReady) {
            try {
                await this.instance.cacheClient.connect();
            }
            catch (error) {
                console.error("Redis reconnection failed:", error);
                this.instance = new RedisCache(await this.createClient());
            }
        }
        return this.instance;
    }
    async get(key) {
        return await this.cacheClient.get(key);
    }
    async set(key, value) {
        // 600 --> 10 minutes
        // 15 s for testing
        await this.cacheClient.set(key, value, { EX: 600 });
    }
    async delete(key) {
        await this.cacheClient.del(key);
    }
    async quit() {
        await this.cacheClient.quit();
    }
}
exports.RedisCache = RedisCache;
//# sourceMappingURL=redis.cache.js.map