import { z } from "zod";
import { deobfuscateValues } from "../app-configuration/app-configuration";

export const paymentAppConfigEntryInternalSchema = z.object({
  apiKeyId: z.string().nullish(),
});

export const paymentAppConfigEntryEncryptedSchema = z.object({
  apiKey: z.string({ required_error: "Private API key is required" }).min(1).nullable(),
});

export const paymentAppConfigEntryPublicSchema = z.object({
  clientKey: z.string().min(1).nullish(),
});

export const paymentAppEntrySchema = paymentAppConfigEntryInternalSchema
  .merge(paymentAppConfigEntryEncryptedSchema)
  .merge(paymentAppConfigEntryPublicSchema)
  .default({
    apiKey: null,
    apiKeyId: null,
    clientKey: null,
  });

// Fully configured app - all fields are required
// Zod doesn't have a utility for marking fields as non-nullable, we need to use unwrap
export const paymentAppFullyConfiguredEntrySchema = z
  .object({
    apiKey: paymentAppConfigEntryEncryptedSchema.shape.apiKey.unwrap(),
    apiKeyId: paymentAppConfigEntryInternalSchema.shape.apiKeyId.unwrap().unwrap(),
    clientKey: paymentAppConfigEntryPublicSchema.shape.clientKey.unwrap().unwrap(),
  })
  .required();

// Schema used as input validation for saving config entires
export const paymentAppFormConfigEntrySchema = paymentAppConfigEntryEncryptedSchema
  .merge(paymentAppConfigEntryPublicSchema)
  .strict()
  .default({
    apiKey: null,
    clientKey: null,
  })
  .brand("PaymentAppFormConfig");

/** Schema used in front-end forms
 * Replaces obfuscated values with null */
export const paymentAppEncryptedFormSchema = paymentAppConfigEntryEncryptedSchema.transform(
  (values) => deobfuscateValues(values),
);

// Schema used for front-end forms
export const paymentAppCombinedFormSchema = z.intersection(
  paymentAppEncryptedFormSchema,
  paymentAppConfigEntryPublicSchema,
);

export type PaymentAppInternalConfig = z.infer<typeof paymentAppConfigEntryInternalSchema>;
export type PaymentAppEncryptedConfig = z.infer<typeof paymentAppConfigEntryEncryptedSchema>;
export type PaymentAppPublicConfig = z.infer<typeof paymentAppConfigEntryPublicSchema>;

export type PaymentAppConfig = z.infer<typeof paymentAppEntrySchema>;
export type PaymentAppConfigFullyConfigured = z.infer<typeof paymentAppFullyConfiguredEntrySchema>;
export type PaymentAppFormConfig = z.infer<typeof paymentAppFormConfigEntrySchema>;

export const defaultPaymentAppConfig: PaymentAppConfig = paymentAppEntrySchema.parse(undefined);
export const defaultPaymentAppFormConfig: PaymentAppFormConfig =
  paymentAppFormConfigEntrySchema.parse(undefined);
