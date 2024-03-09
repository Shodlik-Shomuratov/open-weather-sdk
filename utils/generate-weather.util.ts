import { WeatherType } from "../types/weather.type";

export function generateWeatherData(data: any): WeatherType {
	const weatherData = {
		weather: {
			main: data.weather[0].main,
			description: data.weather[0].description,
		},
		temperature: {
			temp: data.main.temp,
			feels_like: data.main.feels_like,
		},
		visibility: data.visibility,
		wind: {
			speed: data.wind.speed,
		},
		datetime: data.dt,
		sys: {
			sunrise: data.sys.sunrise,
			sunset: data.sys.sunset,
		},
		timezone: data.timezone,
		name: data.name,
	};

	return weatherData;
}
