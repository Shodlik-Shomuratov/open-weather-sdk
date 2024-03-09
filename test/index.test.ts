import SDK from "../index";
import { config } from "dotenv";
import { ResponseType } from "../types/response.type";
config();

const API_KEY = process.env.OPEN_WEATHER_API_KEY as string;

describe("Testing SDK Methods", () => {
	test("should return proper instance of the class", () => {
		const sdk = new SDK(API_KEY);

		expect(sdk).toBeInstanceOf(SDK);

		sdk.removeKey(API_KEY);
	});

	test("should return proper error if API_KEY is invalid", async () => {
		const sdk = new SDK("invalid_api_key");
		const response = await sdk.getCurrentWeather("Some City");

		expect(response).toMatchObject<ResponseType<null>>({
			data: null,
			status: "ERROR",
			errorMessage: "Invalid API Key!",
		});

		sdk.removeKey(API_KEY);
	});

	test("should return weather data", async () => {
		let sdk = new SDK(API_KEY);

		const weatherData = await sdk.getCurrentWeather("Tashkent");

		expect(weatherData.data).toBeDefined();
		expect(typeof weatherData.data?.name).toBe("string");
		expect(typeof weatherData.data?.datetime).toBe("number");
		expect(typeof weatherData.data?.sys).toBe("object");
		expect(typeof weatherData.data?.temperature).toBe("object");
		expect(typeof weatherData.data?.timezone).toBe("number");
		expect(typeof weatherData.data?.visibility).toBe("number");
		expect(typeof weatherData.data?.weather).toBe("object");
		expect(typeof weatherData.data?.wind).toBe("object");

		expect(weatherData.status).toBe("OK");
		expect(weatherData.errorMessage).toBeNull();

		sdk.removeKey(API_KEY);
	});

	test("should return error if city name is invalid", async () => {
		let sdk = new SDK(API_KEY);

		const response = await sdk.getCurrentWeather("some_invalid_name");

		expect(response.data).toBeNull();
		expect(response.status).toBe("ERROR");
		expect(response.errorMessage).toBe("City not found!");

		sdk.removeKey(API_KEY);
	});

	test("should return proper weather data in polling mode also", async () => {
		const sdk = new SDK(API_KEY, {
			mode: "polling",
		});

		const response = await sdk.getCurrentWeather("New York");

		expect(response.data).toBeDefined();
		expect(typeof response.data?.name).toBe("string");
		expect(typeof response.data?.datetime).toBe("number");
		expect(typeof response.data?.sys).toBe("object");
		expect(typeof response.data?.temperature).toBe("object");
		expect(typeof response.data?.timezone).toBe("number");
		expect(typeof response.data?.visibility).toBe("number");
		expect(typeof response.data?.weather).toBe("object");
		expect(typeof response.data?.wind).toBe("object");

		expect(response.status).toBe("OK");
		expect(response.errorMessage).toBeNull();

		sdk.removeKey(API_KEY);
		sdk.destroy();
	});

	test("should return error if we are going to create 2 instance with 1 api key", async () => {
		try {
			const sdk1 = new SDK(API_KEY);
			const sdk2 = new SDK(API_KEY);
		} catch (error: any) {
			expect(error.message).toBe("Only 1 instance for 1 key!");
		}
	});
});
