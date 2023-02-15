/** Code snippet from zod documentation */
import { z } from "zod";

export const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];

export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);

export const isJson = (val: unknown): val is Json => {
  return jsonSchema.safeParse(val).success;
};

export const getJsonOrText = (val: unknown) => {
  const result = jsonSchema.safeParse(val);

  if (result.success) {
    return {
      isJson: true,
      json: result.data,
    };
  }

  if (typeof val === "string") {
    return {
      isJson: false,
      text: val,
    };
  }

  return {
    isJson: false,
  };
};
