import ModernError from "modern-errors";
import { JSONValue } from "../types";

export const JsonParseError = ModernError.subclass("JsonParseError");
export const parseJsonRequest = async (
  req: Request,
): Promise<[Error, null] | [null, JSONValue]> => {
  try {
    const json = (await req.json()) as JSONValue;
    return [null, json];
  } catch (err) {
    return [JsonParseError.normalize(err), null];
  }
};
