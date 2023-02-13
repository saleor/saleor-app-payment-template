import { createProtectedHandler, ProtectedHandlerContext } from "@saleor/app-sdk/handlers/next";
import { NextApiRequest, NextApiResponse } from "next";
import { parseRawBodyToJson } from "../../../lib/api-route-utils";
import { createClient } from "../../../lib/create-graphq-client";
import { createSettingsManager } from "../../../modules/app-configuration/metadata-manager";
import { paymentProviderSchema } from "../../../modules/payment-configuration/payment-config";
import { PaymentProviderConfiguratior } from "../../../modules/payment-configuration/payment-configuration";
import { saleorApp } from "../../../saleor-app";

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ProtectedHandlerContext,
) => {
  const [err, json] = await parseRawBodyToJson(req, paymentProviderSchema);

  if (err) {
    return res.status(400).send(err.message);
  }

  if (!json) {
    return res.status(400).send("No input provided");
  }

  const client = createClient(ctx.authData.saleorApiUrl, async () =>
    Promise.resolve({ token: ctx.authData.token }),
  );

  const configurator = new PaymentProviderConfiguratior(
    createSettingsManager(client),
    ctx.authData.saleorApiUrl,
  );

  await configurator.setConfig(json);

  return res.status(200).send("ok");
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_SETTINGS", "MANAGE_APPS"]);
