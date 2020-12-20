import { NextApiRequest, NextApiResponse } from "next";

export default function createPassthroughApi(
  requestCreator: (req: NextApiRequest) => Promise<Response>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const request = requestCreator(req);
      const response = await request;
      const body = await response.text();
      res.status(response.status).end(body);
    } catch (error) {
      res.status(error.status || 400).end(error.message);
    }
  };
}
