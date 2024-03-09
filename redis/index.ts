import { RedisClientType, createClient } from "redis";
import { RedisOptions } from "../types/redis-options.type";

export async function redisClient(options: RedisOptions) {
	try {
		let client: RedisClientType;

		if (options.username && options.password) {
			client = createClient({
				url: `redis://${options.username}:${options.password}@${options.host}:${options.port}`,
			});
		} else {
			client = createClient({
				url: `redis://${options.host}:${options.port}`,
			});
		}

		await client.connect();

		client.on("error", (error) => {
			throw error;
		});

		return client;
	} catch (error) {
		console.log(error);

		return null;
	}
}
