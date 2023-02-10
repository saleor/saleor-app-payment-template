import { Type } from "@sinclair/typebox";

export const IDSchema = Type.String();
export const JSONSchema = Type.Object({}, { additionalProperties: true });
export const DateTimeSchema = Type.String({ format: "date-time" });
// PositiveDecimal in Saleor accepts 0
export const PositiveDecimalSchema = Type.Number({ minimum: 0 });
export const TransactionResultSchema = Type.Union([
  Type.Literal("CHARGE_SUCCESS"),
  Type.Literal("CHARGE_FAILURE"),
  Type.Literal("CHARGE_REQUESTED"),
  Type.Literal("AUTHORIZATION_SUCCESS"),
  Type.Literal("AUTHORIZATION_FAILURE"),
  Type.Literal("AUTHORIZATION_REQUESTED"),
]);
