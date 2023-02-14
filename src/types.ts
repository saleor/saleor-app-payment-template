export type JSONValue = string | number | boolean | JSONObject | JSONArray | null;

interface JSONObject {
  [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}
