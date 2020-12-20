import { NextApiRequest, NextApiResponse } from "next";
import Assert from "../../utils/assert";

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  try {
    const zip = Assert.notNull(req.query["zip"]);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${getApiKey()}`
    );
    const body = await response.text();
    res.status(response.status).end(body);
  } catch (error) {
    console.error(error);
    res.status(error.status || 400).end(error.message);
  }
}

function getApiKey() {
  return Assert.notNull(process.env.OPEN_WEATHER_API_KEY, "Missing API key");
}
