import moment from "moment";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import Consts from "../utils/consts";
import Weather, { ApiState } from "../utils/weather";
import { useInterval } from "../utils/useInterval";
import { QuoteData } from "../utils/quoteInterface";

function Quote() {
  const [quotedata, setQuoteData] = useState<QuoteData>();
  useEffect(() => {
    fetch("https://favqs.com/api/qotd")
      .then((response) => response.json())
      .then((response) => {
        setQuoteData(response as QuoteData);
      })
      .catch((reason) => console.log("Error fetching quote"));
  }, []);

  if (!quotedata) {
    return <>Whoops...</>;
  }

  return <>{`"${quotedata.quote.body}" - ${quotedata.quote.author}`}</>;
}

function WeatherDisplay() {
  const weatherDataRequest = Weather.useForecast();

  if (weatherDataRequest.state === ApiState.Loading) {
    return <>Loading weather...</>;
  }

  if (
    weatherDataRequest.state === ApiState.Failure ||
    weatherDataRequest.data == null
  ) {
    return <>Failed to load weather data: {weatherDataRequest.state}</>;
  }

  const data = weatherDataRequest.data;

  const temp = Weather.kelvinToFahrenheit(data.main.temp);
  const max = Weather.kelvinToFahrenheit(data.main.temp_max);
  const min = Weather.kelvinToFahrenheit(data.main.temp_min);

  const weather = data.weather;
  const iconKey = weather && weather.length > 0 ? weather[0].icon : "";

  return (
    <>
      <img src={Weather.getIcon(iconKey)} width="50px" />
      <p>{`${temp}° (max ${max}°, min ${min}°)`}</p>
    </>
  );
}

function WeightDisplay() {
  return (
    <div className={styles.weight_charts}>
      <img src={Consts.WEIGHT_MONTH_URL} width="30%" />
      <img src={Consts.WEIGHT_YEAR_URL} width="30%" />
    </div>
  );
}

function Heading() {
  const [currentMoment, setMoment] = useState(moment());
  useInterval(() => {
    setMoment(moment());
  }, 5000);

  return (
    <>
      <h1 className={styles.title}>Happy {currentMoment.format("dddd")}</h1>
      <h2>{currentMoment.format("MMM Do, h:mma")}</h2>{" "}
    </>
  );
}

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>G'day</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Heading />
        <WeatherDisplay />
        <WeightDisplay />
      </main>

      <footer className={styles.footer}>
        <Quote />
      </footer>
    </div>
  );
}
