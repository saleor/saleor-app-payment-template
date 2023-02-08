import { useAppBridge, withAuthorization } from "@saleor/app-sdk/app-bridge";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { Controller, useForm } from "react-hook-form";
import { checkTokenPermissions } from "../modules/jwt/check-token-offline";
import {
  PaymentProviderConfig,
  paymentProviderSchema,
} from "../modules/payment-configuration/payment-config";
import { AppContainer } from "../modules/ui/AppContainer";
import { Input } from "../modules/ui/Input";

const ConfigPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const { saleorApiUrl, token } = appBridgeState ?? {};
  const { handleSubmit, control, setError } = useForm<PaymentProviderConfig>({
    resolver: zodResolver(paymentProviderSchema),
    defaultValues: async () => {
      if (!saleorApiUrl || !token) return undefined;
      const res = await fetch("/api/config/fetch", {
        headers: {
          "saleor-api-url": saleorApiUrl,
          "authorization-bearer": token,
        },
      });
      if (res.ok) {
        const json: unknown = await res.json();
        return paymentProviderSchema.parse(json);
      } else {
        await appBridge?.dispatch({
          type: "notification",
          payload: {
            title: "Form error",
            text: "Error while fetching initial form data",
            status: "error",
            actionId: "payment-form",
            apiMessage: await res.text(),
          },
        });
        return undefined;
      }
    },
  });

  const hasPermissions = checkTokenPermissions(token, ["MANAGE_APPS", "MANAGE_SETTINGS"]);

  async function onSubmit(values: PaymentProviderConfig) {
    if (!saleorApiUrl || !token) {
      return;
    }

    try {
      const res = await fetch("/api/config/update", {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "saleor-api-url": saleorApiUrl,
          "authorization-bearer": token,
        },
      });
      if (res.ok) {
        return await appBridge?.dispatch({
          type: "notification",
          payload: {
            title: "Form saved",
            text: "App configuration was saved successfully",
            status: "success",
            actionId: "payment-form",
          },
        });
      }

      let message;
      if (res.status === 402) message = "Unauthorized";
      else if (res.status === 500) message = "Server error";
      else message = "Unknown error";

      setError("root", { message });
      await appBridge?.dispatch({
        type: "notification",
        payload: {
          title: "Form error",
          text: message,
          status: "error",
          actionId: "payment-form",
          apiMessage: await res.text(),
        },
      });
    } catch (err) {
      setError("root", { message: "Error while sending form" });
    }
  }

  if (!hasPermissions) {
    return (
      <AppContainer>
        <Text variant="hero">{"You don't have permissions to configure this app"}</Text>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Box
        as="form"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        display="flex"
        flexDirection="column"
        gap={8}
      >
        <Text variant="heading">Payment Provider settings</Text>

        <Controller
          control={control}
          name="fakeApiKey"
          render={({ field, fieldState }) => (
            <Input label="API_KEY" {...field} error={fieldState.error} />
          )}
        />

        <div>
          <Button type="submit">Save</Button>
        </div>
      </Box>
    </AppContainer>
  );
};

export default withAuthorization()(ConfigPage);
