# Open Weather SDK in Node.js

## Introduction

Open Weather SDK is used to work with famous weather forecaster Open Weather features using Node.js, TypeScript. The package provides method(s) to get weather condition by city name.

This page presents the installation, basic usage and examples with different type of modes.

Used technologies:

<!-- ![node.js](https://w7.pngwing.com/pngs/562/102/png-transparent-nodejs-hd-logo.png) -->

<a href="https://nodejs.org/en"><img src="https://w7.pngwing.com/pngs/562/102/png-transparent-nodejs-hd-logo.png" width="80px"></a><a href="https://www.typescriptlang.org/"><img src="https://cdn.iconscout.com/icon/free/png-256/free-typescript-1174965.png" width="80px"></a><a href="https://jestjs.io/"><img src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Jest.svg" width="80px"></a><a href="https://openweathermap.org/"><img src="https://pbs.twimg.com/profile_images/1763208293281894400/5MVDq7In_400x400.jpg" width="80px"></a><a href="https://redis.io/"><img src="https://cdn.icon-icons.com/icons2/2415/PNG/512/redis_original_logo_icon_146368.png" width="80px"></a>

## Contents

-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Modes](#modes)
-   [Redis Store](#redis-store)
-   [Testing purposes](#testing-purposes)

## Installation

-   **npm** - `npm install @shodlik_shomuratov/openweather-sdk`
-   **yarn** - `yarn add @shodlik_shomuratov/openweather-sdk`
-   **pnpm** - `pnpm add @shodlik_shomuratov/openweather-sdk`

## Configuration

1. Obtain your API_KEY from [OpenWeather](https://openweathermap.org/appid) to use package properly!
2. Instantiate SDK client and pass it to KameleoonProvider

```ts
import SDK from "@shodlik_shomuratov/openweather-sdk";

const sdk = new SDK("your_api_key");

async function outputWeather() {
	const weatherData = await sdk.getCurrentWeather("Tashkent");
	console.log(weatherData);
}

outputWeather();
```

## Modes

1. **Default mode.** In this mode you every time call the _getCurrentWeather()_ method SDK makes a new request.

```ts
import SDK from "@shodlik_shomuratov/openweather-sdk";

cosnt sdk = new SDK("your_api_key", {
    mode: "default"
});

async function outputWeather () {
    const weatherData = await sdk.getCurrentWeather("Tashkent");
    console.log(weatherData);
}

outputWeather();
```

2. **Polling mode.** In polling mode in order to maintenance zero latency response, you get data from stored weather data and SDK makes a new request for you every 10 minutes.

```ts
import SDK from "@shodlik_shomuratov/openweather-sdk";

cosnt sdk = new SDK("your_api_key", {
    mode: "polling"
});

async function outputWeather () {
    const weatherData = await sdk.getCurrentWeather("Tashkent");
    console.log(weatherData);
}

outputWeather();
```

## Redis Store

If you want you can save updated weather data in your redis store. Only thing you have to do is give SDK redis options in the redis field.

```ts
import SDK from "@shodlik_shomuratov/openweather-sdk";

cosnt sdk = new SDK("your_api_key", {
    mode: "polling",
    redis: {
        host: "127.0.0.1", // your redis host
        port: 6379, // your redis port
        username: "my_redis_username", // optional, if you have one
        password: "my_redis_password", // optional, if you have one
    }
});

async function outputWeather () {
    const weatherData = await sdk.getCurrentWeather("Tashkent");
    console.log(weatherData);
}

outputWeather();
```

## Testing purposes

1. You have to clone this repository into your local machine and install dependencies

```
    npm install
```

2. Change `.env.sample` into `.env` and write your credentials in it.

```
    OPEN_WEATHER_API_KEY=my_api_key
```

3. Run test command

```
    npm run test
```

Created by [Shodlik Shomuratov](https://www.linkedin.com/in/shodlik-shomuratov/)
