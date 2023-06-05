import { z } from "zod";
import {
  paymentAppConfigEntrySchema,
  paymentAppUserVisibleConfigEntrySchema,
} from "./config-entry";

export const paymentAppConfigEntriesSchema = paymentAppConfigEntrySchema.array();
export const paymentAppUserVisibleConfigEntriesSchema =
  paymentAppUserVisibleConfigEntrySchema.array();

// Record<ChannelID, AppConfigEntryId>
export const channelMappingSchema = z
  .record(z.string().min(1), z.string().min(1).nullable())
  .default({});

export const paymentAppConfigSchema = z
  .object({
    configurations: paymentAppConfigEntriesSchema,
    channelToConfigurationId: channelMappingSchema,
  })
  .default({
    configurations: [],
    channelToConfigurationId: {},
  });

export const paymentAppUserVisibleConfigSchema = z
  .object({
    configurations: paymentAppUserVisibleConfigEntriesSchema,
    channelToConfigurationId: channelMappingSchema,
  })
  .default({
    configurations: [],
    channelToConfigurationId: {},
  });
