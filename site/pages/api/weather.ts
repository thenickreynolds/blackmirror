import { NextApiRequest, NextApiResponse } from "next";
import Assert from "../../utils/assert";
import createPassthroughApi from "../../utils/passthroughApi";

export default createPassthroughApi(createRequest);

function createRequest(req: NextApiRequest) {
  const zip = Assert.notNull(req.query["zip"], "Zip code required");
  return fetch(
    `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${getApiKey()}`
  );
}

function getApiKey() {
  return Assert.notNull(process.env.OPEN_WEATHER_API_KEY, "Missing API key");
}
