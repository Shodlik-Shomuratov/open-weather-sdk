import axios from "axios";
import { CityData } from "./types/city-data.type";
import { ResponseType } from "./types/response.type";
import { WeatherType } from "./types/weather.type";
import { SDKOptions } from "./types/sdk-options.type";
import { generateWeatherData } from "./utils/generate-weather.util";
import { redisClient } from "./redis";
import { RedisOptions } from "./types/redis-options.type";

const apiKeys: string[] = [];

class OpenWeatherSDK {
	private API_KEY: string = "";
	private mode: "default" | "polling" = "default";
	private cities: CityData[] = [];
	private redis: RedisOptions | null = null;
	private intervals: NodeJS.Timeout[] = [];

	constructor(API_KEY: string, options?: SDKOptions) {
		const key = apiKeys.find((key) => key === API_KEY);

		if (key) {
			throw new Error("Only 1 instance for 1 key!");
		}

		this.API_KEY = API_KEY;
		apiKeys.push(API_KEY);

		if (options) {
			if (options.mode) {
				this.mode = options.mode;

				if (this.mode === "polling") {
					this.updateWeatherData();

					if (options.redis) {
						this.redis = options.redis;
					}
				}
			}
		}
	}

	async getCurrentWeather(
		cityName: string
	): Promise<ResponseType<WeatherType>> {
		try {
			if (this.mode === "polling") {
				if (this.redis) {
					const redis = await redisClient({
						...this.redis,
					});

					if (!redis) {
						return {
							data: null,
							status: "ERROR",
							errorMessage: "Check your REDIS credentials!",
						};
					}

					const raw = await redis.HGET("cities", cityName);

					if (raw) {
						const cityData = JSON.parse(raw);

						return {
							data: cityData.weather,
							status: "OK",
							errorMessage: null,
						};
					}

					const { data } = await axios.get(
						`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.API_KEY}`
					);

					const weatherData = generateWeatherData(data);
					const cityData = {
						name: data.name,
						country: data.sys.country,
						weather: weatherData,
					};

					const keys = await redis.HKEYS("cities");

					if (keys.length >= 10) {
						redis.HDEL("cities", keys[0]);
					}

					await redis.HSET(
						"cities",
						String(cityName),
						JSON.stringify(cityData)
					);

					return {
						data: cityData.weather,
						status: "OK",
						errorMessage: null,
					};
				} else {
					const isCityExists = this.cities.find(
						(city) => city.name === cityName
					);

					if (isCityExists) {
						console.log("Exist");

						return {
							data: isCityExists.weather,
							status: "OK",
							errorMessage: null,
						};
					}

					const { data } = await axios.get(
						`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.API_KEY}`
					);

					const weatherData = generateWeatherData(data);
					const cityData = {
						name: data.name,
						country: data.sys.country,
						weather: weatherData,
					};

					if (this.cities.length >= 10) {
						this.cities.shift();
					}

					this.cities.push(cityData);

					return {
						data: cityData.weather,
						status: "OK",
						errorMessage: null,
					};
				}
			} else {
				const { data } = await axios.get(
					`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.API_KEY}`
				);

				const weatherData = generateWeatherData(data);

				return {
					data: weatherData,
					status: "OK",
					errorMessage: null,
				};
			}
		} catch (error: any) {
			if (
				error.response.data.cod === 401 &&
				error.response.data.message.includes("Invalid API key")
			) {
				return {
					data: null,
					status: "ERROR",
					errorMessage: "Invalid API Key!",
				};
			} else if (
				error.response.data.cod === "404" &&
				error.response.data.message === "city not found"
			) {
				return {
					data: null,
					status: "ERROR",
					errorMessage: "City not found!",
				};
			}

			console.log(error.response.data.message);

			return {
				data: null,
				status: "ERROR",
				errorMessage: error.response.data.message,
			};
		}
	}

	removeKey(API_KEY: string) {
		const index = apiKeys.findIndex((key) => key === API_KEY);
		apiKeys.splice(index, 1);
	}

	destroy() {
		this.intervals.forEach((intervalId) => clearInterval(intervalId));
		this.intervals = [];
	}

	private async updateWeatherData() {
		if (this.redis) {
			const redis = await redisClient({
				...this.redis,
			});

			if (redis) {
				const intervalId = setInterval(async () => {
					const cities = await redis.HGETALL("cities");

					for (const key in cities) {
						const raw = cities[key];
						const city = JSON.parse(raw);

						const { data } = await axios.get(
							`https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${this.API_KEY}`
						);

						city.weather = generateWeatherData(data);

						await redis.HSET(
							"cities",
							city.name,
							JSON.stringify(city)
						);
					}
				}, 1000 * 60 * 10);

				this.intervals.push(intervalId);
			} else {
				throw new Error("Check REDIS credentials!");
			}
		} else {
			const intervalId = setInterval(async () => {
				const updatedData = await Promise.all(
					this.cities.map(async (city) => {
						const { data } = await axios.get(
							`https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${this.API_KEY}`
						);

						city.weather = generateWeatherData(data);

						return city;
					})
				);

				this.cities = updatedData;
			}, 1000 * 60 * 10);
			this.intervals.push(intervalId);
		}
	}
}

export default OpenWeatherSDK;
