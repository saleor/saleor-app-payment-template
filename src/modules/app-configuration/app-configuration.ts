import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { merge } from "lodash/fp";

export interface AppConfigurator<TConfig extends Record<string, unknown>> {
  setConfig(config: TConfig): Promise<void>;
  getConfig(): Promise<TConfig | undefined>;
}

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

  async setConfig(newConfig: TConfig, replace = false) {
    const existingConfig = replace ? {} : await this.getConfig();

    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(merge(existingConfig, newConfig)),
      domain: this.saleorApiUrl,
    });
  }
}
