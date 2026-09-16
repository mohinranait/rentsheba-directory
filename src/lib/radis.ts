import { createClient } from "redis";

import config from "./config";

export const redisClient = createClient({
  username: config.radis_user,
  password: config.radis_password,
  socket: {
    host: config.radis_host,
    port: Number(config.radis_port),
  },
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
};