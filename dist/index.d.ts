type ResponseType<T> = {
    data: T | null;
    status: "OK" | "ERROR";
    errorMessage: string | null;
};

interface IWeatherInfo {
    main: string;
    description: string;
}
interface ITemperatureInfo {
    temp: number;
    feels_like: number;
}
interface IWindInfo {
    speed: number;
}
interface ISysInfo {
    sunrise: number;
    sunset: number;
}
type WeatherType = {
    weather: IWeatherInfo;
    temperature: ITemperatureInfo;
    visibility: number;
    wind: IWindInfo;
    datetime: number;
    sys: ISysInfo;
    timezone: number;
    name: string;
};

interface RedisOptions {
    host: string;
    port: number;
    username?: string;
    password?: string;
}

interface SDKOptions {
    mode?: "default" | "polling";
    redis?: RedisOptions;
}

declare class OpenWeatherSDK {
    private API_KEY;
    private mode;
    private cities;
    private redis;
    private intervals;
    constructor(API_KEY: string, options?: SDKOptions);
    getCurrentWeather(cityName: string): Promise<ResponseType<WeatherType>>;
    removeKey(API_KEY: string): void;
    destroy(): void;
    private updateWeatherData;
}

export { OpenWeatherSDK as default };
