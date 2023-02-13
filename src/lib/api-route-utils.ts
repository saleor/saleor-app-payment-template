import ModernError from "modern-errors";
import { z } from "zod";
import { NextApiRequest } from "next";
import { ObjectSchema } from "yup";
import { JSONValue } from "../types";

export const JsonParseError = ModernError.subclass("JsonParseError");
export const parseJsonRequest = async <S extends ObjectSchema<{}>>(req: Request, schema: S) => {
  try {
    const json = (await req.json()) as JSONValue;
    return [null, schema.validateSync(json)] as const;
  } catch (err) {
    return [JsonParseError.normalize(err), null] as const;
  }
};

export const parseRawBodyToJson = async <T extends z.AnyZodObject>(
  req: NextApiRequest,
  schema: T,
) => {
  try {
    if (typeof req.body !== "string") {
      throw new JsonParseError("Invalid body type");
    }
    if (req.body === "") {
      throw new JsonParseError("No request body");
    }
    const json = JSON.parse(req.body) as unknown;
    return [null, schema.parse(json) as z.infer<T>] as const;
  } catch (err) {
    return [JsonParseError.normalize(err), null] as const;
  }
};

export const tryJsonParse = (text: string | undefined) => {
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as JSONValue;
  } catch (e) {
    return text;
  }
};

export const tryIgnore = (fn: () => void) => {
  try {
    fn();
  } catch {
    // noop
  }
};

export const toStringOrUndefined = (value: string | string[] | undefined) =>
  value ? value.toString() : undefined;

export const toStringOrEmpty = (value: unknown) => {
  if (typeof value === "string") return value;
  return "";
};

export const unknownToError = (maybeError: unknown) => {
  if (maybeError instanceof Error) {
    return maybeError;
  }

  if (typeof maybeError === "string") {
    return new Error(maybeError);
  }

  return new Error(String(maybeError));
};

type PromiseToTupleResult<T> = [Error, null] | [null, Awaited<T>];
export const unpackPromise = async <T extends Promise<unknown>>(
  promise: T,
): Promise<PromiseToTupleResult<T>> => {
  try {
    const result = await promise;
    return [null, result];
  } catch (maybeError) {
    const error = unknownToError(maybeError);
    return [error, null];
  }
};

type ThrowableToTupleResult<T> = [Error, null] | [null, T];
export const unpackThrowable = <T>(throwable: () => T): ThrowableToTupleResult<T> => {
  try {
    const result = throwable();
    return [null, result];
  } catch (maybeError) {
    const error = unknownToError(maybeError);
    return [error, null];
  }
};
