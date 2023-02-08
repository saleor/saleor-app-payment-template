import { z } from "zod";

export const paymentProviderSchema = z.object({
  fakeApiKey: z.string({ required_error: "API key is required" }),
});

export type PaymentProviderConfig = z.infer<typeof paymentProviderSchema>;

export const defaultPaymentProviderConfig: PaymentProviderConfig = {
  fakeApiKey: "",
};
