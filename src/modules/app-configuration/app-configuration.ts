import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { merge } from "lodash/fp";
import { toStringOrEmpty } from "../../lib/api-route-utils";

export interface AppConfigurator<TConfig extends Record<string, unknown>> {
  setConfig(config: TConfig): Promise<void>;
  getConfig(): Promise<TConfig | undefined>;
}

export const OBFUSCATION_DOTS = "••••";

export class PrivateMetadataAppConfigurator<TConfig extends Record<string, unknown>>
  implements AppConfigurator<TConfig>
{
  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
    private metadataKey: string,
  ) {
    this.metadataKey = metadataKey;
  }

  async getConfig(): Promise<TConfig | undefined> {
    const data = await this.metadataManager.get(this.metadataKey, this.saleorApiUrl);
    if (!data) {
      return undefined;
    }

    try {
      return JSON.parse(data) as TConfig;
    } catch (e) {
      throw new Error("Invalid metadata value, cant be parsed");
    }
  }

  obfuscateValue(value: string) {
    const unbofuscatedLength = Math.min(4, value.length - 4);

    if (unbofuscatedLength <= 0) {
      return OBFUSCATION_DOTS;
    }

    const visibleValue = value.slice(-unbofuscatedLength);
    return `${OBFUSCATION_DOTS}${visibleValue}`;
  }

  obfuscateConfig(config: TConfig): TConfig {
    const entries = Object.entries(config).map(([key, value]) => [
      key,
      this.obfuscateValue(toStringOrEmpty(value)),
    ]);

    return Object.fromEntries(entries) as TConfig;
  }

  async getConfigObfuscated(): Promise<TConfig | undefined> {
    const config = await this.getConfig();
    if (!config) {
      return undefined;
    }
    return this.obfuscateConfig(config);
  }

  async setConfig(newConfig: TConfig, replace = false) {
    const existingConfig = replace ? {} : await this.getConfig();

    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(merge(existingConfig, newConfig)),
      domain: this.saleorApiUrl,
    });
  }
}
