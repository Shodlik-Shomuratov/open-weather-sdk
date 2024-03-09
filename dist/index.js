"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var openweather_sdk_exports = {};
__export(openweather_sdk_exports, {
  default: () => openweather_sdk_default
});
module.exports = __toCommonJS(openweather_sdk_exports);
var import_axios = __toESM(require("axios"));

// utils/generate-weather.util.ts
function generateWeatherData(data) {
  const weatherData = {
    weather: {
      main: data.weather[0].main,
      description: data.weather[0].description
    },
    temperature: {
      temp: data.main.temp,
      feels_like: data.main.feels_like
    },
    visibility: data.visibility,
    wind: {
      speed: data.wind.speed
    },
    datetime: data.dt,
    sys: {
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    },
    timezone: data.timezone,
    name: data.name
  };
  return weatherData;
}

// redis/index.ts
var import_redis = require("redis");
async function redisClient(options) {
  try {
    let client;
    if (options.username && options.password) {
      client = (0, import_redis.createClient)({
        url: `redis://${options.username}:${options.password}@${options.host}:${options.port}`
      });
    } else {
      client = (0, import_redis.createClient)({
        url: `redis://${options.host}:${options.port}`
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

// index.ts
var apiKeys = [];
var OpenWeatherSDK = class {
  constructor(API_KEY, options) {
    this.API_KEY = "";
    this.mode = "default";
    this.cities = [];
    this.redis = null;
    this.intervals = [];
    const key = apiKeys.find((key2) => key2 === API_KEY);
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
  async getCurrentWeather(cityName) {
    try {
      if (this.mode === "polling") {
        if (this.redis) {
          const redis = await redisClient({
            ...this.redis
          });
          if (!redis) {
            return {
              data: null,
              status: "ERROR",
              errorMessage: "Check your REDIS credentials!"
            };
          }
          const raw = await redis.HGET("cities", cityName);
          if (raw) {
            const cityData2 = JSON.parse(raw);
            return {
              data: cityData2.weather,
              status: "OK",
              errorMessage: null
            };
          }
          const { data } = await import_axios.default.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.API_KEY}`
          );
          const weatherData = generateWeatherData(data);
          const cityData = {
            name: data.name,
            country: data.sys.country,
            weather: weatherData
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
            errorMessage: null
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
              errorMessage: null
            };
          }
          const { data } = await import_axios.default.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.API_KEY}`
          );
          const weatherData = generateWeatherData(data);
          const cityData = {
            name: data.name,
            country: data.sys.country,
            weather: weatherData
          };
          if (this.cities.length >= 10) {
            this.cities.shift();
          }
          this.cities.push(cityData);
          return {
            data: cityData.weather,
            status: "OK",
            errorMessage: null
          };
        }
      } else {
        const { data } = await import_axios.default.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.API_KEY}`
        );
        const weatherData = generateWeatherData(data);
        return {
          data: weatherData,
          status: "OK",
          errorMessage: null
        };
      }
    } catch (error) {
      if (error.response.data.cod === 401 && error.response.data.message.includes("Invalid API key")) {
        return {
          data: null,
          status: "ERROR",
          errorMessage: "Invalid API Key!"
        };
      } else if (error.response.data.cod === "404" && error.response.data.message === "city not found") {
        return {
          data: null,
          status: "ERROR",
          errorMessage: "City not found!"
        };
      }
      console.log(error.response.data.message);
      return {
        data: null,
        status: "ERROR",
        errorMessage: error.response.data.message
      };
    }
  }
  removeKey(API_KEY) {
    const index = apiKeys.findIndex((key) => key === API_KEY);
    apiKeys.splice(index, 1);
  }
  destroy() {
    this.intervals.forEach((intervalId) => clearInterval(intervalId));
    this.intervals = [];
  }
  async updateWeatherData() {
    if (this.redis) {
      const redis = await redisClient({
        ...this.redis
      });
      if (redis) {
        const intervalId = setInterval(async () => {
          const cities = await redis.HGETALL("cities");
          for (const key in cities) {
            const raw = cities[key];
            const city = JSON.parse(raw);
            const { data } = await import_axios.default.get(
              `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${this.API_KEY}`
            );
            city.weather = generateWeatherData(data);
            await redis.HSET(
              "cities",
              city.name,
              JSON.stringify(city)
            );
          }
        }, 1e3 * 60 * 10);
        this.intervals.push(intervalId);
      } else {
        throw new Error("Check REDIS credentials!");
      }
    } else {
      const intervalId = setInterval(async () => {
        const updatedData = await Promise.all(
          this.cities.map(async (city) => {
            const { data } = await import_axios.default.get(
              `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${this.API_KEY}`
            );
            city.weather = generateWeatherData(data);
            return city;
          })
        );
        this.cities = updatedData;
      }, 1e3 * 60 * 10);
      this.intervals.push(intervalId);
    }
  }
};
var openweather_sdk_default = OpenWeatherSDK;
//# sourceMappingURL=index.js.map