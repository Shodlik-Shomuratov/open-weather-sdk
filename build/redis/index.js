"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
async function redisClient(options) {
    try {
        let client;
        if (options.username && options.password) {
            client = (0, redis_1.createClient)({
                url: `redis://${options.username}:${options.password}@${options.host}:${options.port}`,
            });
        }
        else {
            client = (0, redis_1.createClient)({
                url: `redis://${options.host}:${options.port}`,
            });
        }
        await client.connect();
        client.on("error", (error) => {
            throw error;
        });
        return client;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}
exports.redisClient = redisClient;
