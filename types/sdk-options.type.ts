import { RedisOptions } from "./redis-options.type";

export interface SDKOptions {
	mode?: "default" | "polling";
	redis?: RedisOptions;
}
