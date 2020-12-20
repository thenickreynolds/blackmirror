import { NextApiRequest } from "next";
import Assert from "./assert";
import Strings from "./strings";

type ParamsMap = any;

export default class Params {
  static prepareBody(req: NextApiRequest) {
    if (typeof req.body !== "string" || Strings.isEmptyOrNull(req.body)) {
      return {};
    }

    return JSON.parse(req.body) as ParamsMap;
  }

  static getString(req: ParamsMap, key: string) {
    const v = req[key] as string;
    return Assert.notNull(v, `${key} was missing from request`);
  }

  static getStringOrDefault<T>(req: ParamsMap, key: string, def: T) {
    const val = req[key] as string;
    return val || def;
  }

  static getStringOrEmpty(req: ParamsMap, key: string) {
    return Params.getStringOrDefault(req, key, "");
  }

  static getStringOrNull(req: ParamsMap, key: string) {
    return Params.getStringOrDefault(req, key, null);
  }

  static getNumber(req: ParamsMap, key: string) {
    const val = req[key] as string;
    const num = Number.parseInt(val, 10);
    Assert.true(Number.isNaN(num), `${key} was not a number`);
    return num;
  }

  static getNumberOrDefault<T>(req: ParamsMap, key: string, def: T) {
    const val = req[key] as string;
    if (val === null || val === undefined) {
      return def;
    }
    const num = Number.parseInt(val, 10);
    if (Number.isNaN(num)) {
      return def;
    }

    return num;
  }

  static getNumberOrNull(req: ParamsMap, key: string) {
    return Params.getNumberOrDefault(req, key, null);
  }
}
