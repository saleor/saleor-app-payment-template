import { Static, Type } from "@sinclair/typebox";
import { JSONSchema } from "../../schemas";

export const PaymentGatewayInitializeSessionResponseSchema = Type.Object({
  data: JSONSchema,
});
export type PaymentGatewayInitializeSessionResponse = Static<
  typeof PaymentGatewayInitializeSessionResponseSchema
>;
