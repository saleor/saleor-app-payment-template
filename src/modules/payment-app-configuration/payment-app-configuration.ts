import { encrypt, type MetadataEntry } from "@saleor/app-sdk/settings-manager";
import {
  type AppConfigurator,
  PrivateMetadataAppConfigurator,
} from "../app-configuration/app-configuration";
import { type BrandedEncryptedMetadataManager } from "../app-configuration/metadata-manager";
import {
  type PaymentAppConfigFullyConfigured,
  paymentAppFullyConfiguredEntrySchema,
  type PaymentAppConfig,
  type PaymentAppFormConfig,
} from "./config-entry";
import { env } from "@/lib/env.mjs";
import { BaseError } from "@/errors";

export const privateMetadataKey = "payment-app-config-private";
export const hiddenMetadataKey = "payment-app-config-hidden";
export const publicMetadataKey = "payment-app-config-public";

export const AppNotConfiguredError = BaseError.subclass(`AppNotConfiguredError`);

export class PaymentAppConfigurator implements AppConfigurator<PaymentAppConfig> {
  private configurator: PrivateMetadataAppConfigurator<PaymentAppConfig>;
  public saleorApiUrl: string;

  constructor(privateMetadataManager: BrandedEncryptedMetadataManager, saleorApiUrl: string) {
    this.configurator = new PrivateMetadataAppConfigurator(
      privateMetadataManager,
      saleorApiUrl,
      privateMetadataKey,
    );
    this.saleorApiUrl = saleorApiUrl;
  }

  async getConfig(): Promise<PaymentAppConfig | undefined> {
    const config = await this.configurator.getConfig();
    // TODO: validate against schema
    return config;
  }

  async getConfigSafe(): Promise<PaymentAppConfigFullyConfigured> {
    const config = await this.getConfig();
    const result = paymentAppFullyConfiguredEntrySchema.safeParse(config);

    if (result.success) {
      return result.data;
    }

    throw new AppNotConfiguredError("App is missing configuration fields", { cause: result.error });
  }

  async getRawConfig(): Promise<MetadataEntry[]> {
    const encryptFn = (data: string) => encrypt(data, env.SECRET_KEY);

    return this.configurator.getRawConfig(encryptFn);
  }

  async getConfigObfuscated() {
    // TODO: Handle nested obfuscation in config entries
    return this.configurator.getConfigObfuscated();
  }

  /** Saves config that is available to user */
  async setConfigPublic(newConfig: PaymentAppFormConfig, replace = false) {
    // TODO: Do a runtime validation
    return this.configurator.setConfig(newConfig, replace);
  }

  // TODO: Add methods for setting entries and mapping
  // TODO: Add methods for deleting entries and mapping

  /** Saves config including hidden fields */
  async setConfig(newConfig: Partial<PaymentAppConfig>, replace = false) {
    return this.configurator.setConfig(newConfig, replace);
  }

  async clearConfig() {
    return this.configurator.clearConfig();
  }
}
