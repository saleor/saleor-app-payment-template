import { Static, Type } from "@sinclair/typebox";
import {
  DateTimeSchema,
  JSONSchema,
  PositiveDecimalSchema,
  TransactionResultSchema,
} from "../../schemas";

export const TransactionInitializeSessionResponseSchema = Type.Object({
  pspReference: Type.String(),
  data: JSONSchema,
  result: TransactionResultSchema,
  amount: PositiveDecimalSchema,
  time: DateTimeSchema,
  externalUrl: Type.String(),
  message: Type.String(),
});
export type TransactionInitializeSessionResponse = Static<
  typeof TransactionInitializeSessionResponseSchema
>;
