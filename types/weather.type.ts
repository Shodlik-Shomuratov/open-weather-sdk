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

export type WeatherType = {
	weather: IWeatherInfo;
	temperature: ITemperatureInfo;
	visibility: number;
	wind: IWindInfo;
	datetime: number;
	sys: ISysInfo;
	timezone: number;
	name: string;
};
