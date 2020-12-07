import { useEffect, useState } from "react";
import { WeatherData } from "./openWeatherMapInterfaces";

export enum ApiState {
  Loading = "Loading",
  Success = "Success",
  Failure = "Failure",
}

export interface WeatherApiStatus {
  state: ApiState;
  data?: WeatherData;
}

export default class Weather {
  static readonly ZIP_CODE: string = "94114";
  static readonly API_KEY: string = "fdeb56ea588891439fd8f658fe75e6a7"; // "21911463fcda2cf5698e65f90ed064f2"; // TODO move to env variable
  static readonly WEATHER_ICONS: Record<string, string> = {
    "00d": "unknown.png",
    "01d": "clear.png",
    "02d": "cloudy.png",
    "03d": "partlycloudy.png",
    "04d": "partlysunny.png",
    "09d": "chancerain.png",
    "10d": "rain.png",
    "11d": "tstorms.png",
    "13d": "snow.png",
    "50d": "hazy.png",
    "00n": "nt_unknown.png",
    "01n": "nt_clear.png",
    "02n": "nt_cloudy.png",
    "03n": "nt_partlycloudy.png",
    "04n": "nt_partlysunny.png",
    "09n": "nt_chancerain.png",
    "10n": "nt_rain.png",
    "11n": "nt_tstorms.png",
    "13n": "nt_snow.png",
    "50n": "nt_hazy.png",
  };

  static getIcon(icon: string) {
    const forceDay = true;
    const iconKey = forceDay ? icon.replace("n", "d") : icon;
    var icon_file =
      this.WEATHER_ICONS[iconKey] != undefined
        ? this.WEATHER_ICONS[iconKey]
        : this.WEATHER_ICONS["00d"];
    return "weather_icons/" + icon_file;
  }

  static useForecast() {
    const [apiState, setApiState] = useState<WeatherApiStatus>({
      state: ApiState.Loading,
    });

    useEffect(() => {
      fetch(
        `http://api.openweathermap.org/data/2.5/weather?zip=${this.ZIP_CODE},us&appid=${this.API_KEY}`
      )
        .then((response) => response.json())
        .then((response) => {
          setApiState({
            state: ApiState.Success,
            data: response as WeatherData,
          });
        })
        .catch((err) => {
          console.log(err);
          setApiState({ state: ApiState.Failure });
        });
    }, []);

    return apiState;
  }

  static kelvinToFahrenheit(temp: number) {
    return (((temp - 273.15) * 9) / 5 + 32).toFixed();
  }
}
