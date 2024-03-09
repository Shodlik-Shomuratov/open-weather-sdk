"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const API_KEY = process.env.OPEN_WEATHER_API_KEY;
describe("Testing SDK Methods", () => {
    test("should return proper instance of the class", () => {
        const sdk = new index_1.default(API_KEY);
        expect(sdk).toBeInstanceOf(index_1.default);
        sdk.removeKey(API_KEY);
    });
    test("should return proper error if API_KEY is invalid", async () => {
        const sdk = new index_1.default("invalid_api_key");
        const response = await sdk.getCurrentWeather("Some City");
        expect(response).toMatchObject({
            data: null,
            status: "ERROR",
            errorMessage: "Invalid API Key!",
        });
        sdk.removeKey(API_KEY);
    });
    test("should return weather data", async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let sdk = new index_1.default(API_KEY);
        const weatherData = await sdk.getCurrentWeather("Tashkent");
        expect(weatherData.data).toBeDefined();
        expect(typeof ((_a = weatherData.data) === null || _a === void 0 ? void 0 : _a.name)).toBe("string");
        expect(typeof ((_b = weatherData.data) === null || _b === void 0 ? void 0 : _b.datetime)).toBe("number");
        expect(typeof ((_c = weatherData.data) === null || _c === void 0 ? void 0 : _c.sys)).toBe("object");
        expect(typeof ((_d = weatherData.data) === null || _d === void 0 ? void 0 : _d.temperature)).toBe("object");
        expect(typeof ((_e = weatherData.data) === null || _e === void 0 ? void 0 : _e.timezone)).toBe("number");
        expect(typeof ((_f = weatherData.data) === null || _f === void 0 ? void 0 : _f.visibility)).toBe("number");
        expect(typeof ((_g = weatherData.data) === null || _g === void 0 ? void 0 : _g.weather)).toBe("object");
        expect(typeof ((_h = weatherData.data) === null || _h === void 0 ? void 0 : _h.wind)).toBe("object");
        expect(weatherData.status).toBe("OK");
        expect(weatherData.errorMessage).toBeNull();
        sdk.removeKey(API_KEY);
    });
    test("should return error if city name is invalid", async () => {
        let sdk = new index_1.default(API_KEY);
        const response = await sdk.getCurrentWeather("some_invalid_name");
        expect(response.data).toBeNull();
        expect(response.status).toBe("ERROR");
        expect(response.errorMessage).toBe("City not found!");
        sdk.removeKey(API_KEY);
    });
    test("should return proper weather data in polling mode also", async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const sdk = new index_1.default(API_KEY, {
            mode: "polling",
        });
        const response = await sdk.getCurrentWeather("New York");
        expect(response.data).toBeDefined();
        expect(typeof ((_a = response.data) === null || _a === void 0 ? void 0 : _a.name)).toBe("string");
        expect(typeof ((_b = response.data) === null || _b === void 0 ? void 0 : _b.datetime)).toBe("number");
        expect(typeof ((_c = response.data) === null || _c === void 0 ? void 0 : _c.sys)).toBe("object");
        expect(typeof ((_d = response.data) === null || _d === void 0 ? void 0 : _d.temperature)).toBe("object");
        expect(typeof ((_e = response.data) === null || _e === void 0 ? void 0 : _e.timezone)).toBe("number");
        expect(typeof ((_f = response.data) === null || _f === void 0 ? void 0 : _f.visibility)).toBe("number");
        expect(typeof ((_g = response.data) === null || _g === void 0 ? void 0 : _g.weather)).toBe("object");
        expect(typeof ((_h = response.data) === null || _h === void 0 ? void 0 : _h.wind)).toBe("object");
        expect(response.status).toBe("OK");
        expect(response.errorMessage).toBeNull();
        sdk.removeKey(API_KEY);
        sdk.destroy();
    });
    test("should return error if we are going to create 2 instance with 1 api key", async () => {
        try {
            const sdk1 = new index_1.default(API_KEY);
            const sdk2 = new index_1.default(API_KEY);
        }
        catch (error) {
            expect(error.message).toBe("Only 1 instance for 1 key!");
        }
    });
});
