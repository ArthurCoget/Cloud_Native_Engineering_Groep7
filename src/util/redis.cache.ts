import { createClient } from "redis";
import { RedisClientType, RedisClientOptions } from "@redis/client";

export class RedisCache {
  private static instance: RedisCache;
  private readonly cacheClient: RedisClientType;

  private constructor(redisClient: RedisClientType) {
    if (!redisClient) {
      throw new Error("A Redis client is required.");
    }
    this.cacheClient = redisClient;
  }

  private static async createClient(): Promise<RedisClientType> {
    const cacheHostName = process.env.REDIS_HOST_NAME;
    const cachePassword = process.env.REDIS_ACCESS_KEY;
    const cachePort = process.env.REDIS_PORT || "6380";

    if (!cacheHostName) throw new Error("REDIS_HOST_NAME is empty");
    if (!cachePassword) throw new Error("REDIS_ACCESS_KEY is empty");

    const cacheConnection = createClient({
      url: `rediss://${cacheHostName}:${cachePort}`,
      password: cachePassword,
      protocol: 3,
    } as RedisClientOptions);

    await cacheConnection.connect();
    return cacheConnection as RedisClientType;
  }

  static async getInstance(): Promise<RedisCache> {
    if (!this.instance) {
      const cacheConnection = await this.createClient();
      this.instance = new RedisCache(cacheConnection);
    } else if (
      !this.instance.cacheClient.isOpen ||
      !this.instance.cacheClient.isReady
    ) {
      try {
        await this.instance.cacheClient.connect();
      } catch (error) {
        console.error("Redis reconnection failed:", error);
        this.instance = new RedisCache(await this.createClient());
      }
    }
    return this.instance;
  }

  async get(key: string) {
    return await this.cacheClient.get(key);
  }

  async set(key: string, value: string) {
    // 600 --> 10 minutes
    // 15 s for testing
    await this.cacheClient.set(key, value, { EX: 600 });
  }

  async delete(key: string) {
    await this.cacheClient.del(key);
  }

  async quit() {
    await this.cacheClient.quit();
  }
}
