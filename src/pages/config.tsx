import { useAppBridge, withAuthorization } from "@saleor/app-sdk/app-bridge";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { FormProvider, useForm } from "react-hook-form";
import { checkTokenPermissions } from "../modules/jwt/check-token-offline";
import {
  PaymentProviderConfig,
  paymentProviderSchema,
} from "../modules/payment-configuration/payment-config";
import { AppContainer } from "../modules/ui/AppContainer/AppContainer";
import { Input } from "../modules/ui/Input/Input";
import { Form } from "../modules/ui/Form/Form";
import { FetchError, useFetch, usePost } from "../lib/use-fetch";

const actionId = "payment-form";

const ConfigPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const { token } = appBridgeState ?? {};

  const hasPermissions = checkTokenPermissions(token, ["MANAGE_APPS", "MANAGE_SETTINGS"]);

  const [isLoading, setIsLoading] = useState(true);

  const formMethods = useForm<PaymentProviderConfig>({
    resolver: zodResolver(paymentProviderSchema),
    defaultValues: {
      fakeApiKey: "",
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { isSubmitting },
  } = formMethods;

  useFetch("/api/config", {
    schema: paymentProviderSchema,
    onFinished: () => setIsLoading(false),
    onSuccess: (data) => {
      reset(data);
    },
    onError: async (err) => {
      const message = err instanceof FetchError ? err.body : err.message;
      await appBridge?.dispatch({
        type: "notification",
        payload: {
          title: "Form error",
          text: "Error while fetching initial form data",
          status: "error",
          actionId,
          apiMessage: message,
        },
      });
    },
  });

  const postForm = usePost("/api/config", {
    onDone: async () => {
      await appBridge?.dispatch({
        type: "notification",
        payload: {
          title: "Form saved",
          text: "App configuration was saved successfully",
          status: "success",
          actionId: "payment-form",
        },
      });
    },
    onError: async (err) => {
      const apiMessage = err instanceof FetchError ? err.body : err.name;
      await appBridge?.dispatch({
        type: "notification",
        payload: {
          title: "Form error",
          text: err.message,
          status: "error",
          actionId,
          apiMessage,
        },
      });
      setError("root", { message: err.message });
    },
  });

  if (!hasPermissions) {
    return (
      <AppContainer>
        <Text variant="hero">{"You don't have permissions to configure this app"}</Text>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Box display="flex" flexDirection="column" gap={8}>
        <FormProvider {...formMethods}>
          <Form
            method="post"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit((data) => postForm(data))}
          >
            <Text variant="heading">Payment Provider settings</Text>

            <Input
              control={control}
              autoClearEncrypted
              label="API_KEY"
              name="fakeApiKey"
              disabled={isLoading}
            />

            <div>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {isLoading ? "Loading" : isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </Form>
        </FormProvider>
      </Box>
    </AppContainer>
  );
};

export default withAuthorization()(ConfigPage);
