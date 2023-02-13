import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import ModernError from "modern-errors";
import { useCallback, useEffect } from "react";
import { z } from "zod";
import { JSONValue } from "../types";

export const FetchError = ModernError.subclass("FetchError", {
  props: {
    body: "",
    code: 500,
  },
});
export const FetchParseError = ModernError.subclass("FetchParseError");

type FetchConfigWithSchema<T extends z.ZodTypeAny> = {
  schema: T;
  onSuccess?: (data: z.infer<T>) => void | Promise<void>;
  onError?: (
    err: InstanceType<typeof FetchError> | InstanceType<typeof FetchParseError>,
  ) => void | Promise<void>;
  onFinished?: () => void | Promise<void>;
};

type FetchConfigWithoutSchema = {
  schema?: never;
  onDone?: () => void | Promise<void>;
  onError?: (
    err: InstanceType<typeof FetchError> | InstanceType<typeof FetchParseError>,
  ) => void | Promise<void>;
  onFinished?: () => void | Promise<void>;
};

type FetchConfig<T extends z.ZodTypeAny> = FetchConfigWithoutSchema | FetchConfigWithSchema<T>;

const isConfigWithSchema = <T extends z.ZodTypeAny>(
  config: FetchConfig<T> | undefined,
): config is FetchConfigWithSchema<T> => {
  return !!config?.schema;
};

export const useFetchFn = () => {
  const { appBridgeState } = useAppBridge();
  const { saleorApiUrl, token } = appBridgeState ?? {};

  const customFetch = useCallback(
    (info: RequestInfo | URL, init?: RequestInit | undefined) => {
      return fetch(info, {
        ...init,
        headers: {
          ...init?.headers,
          "saleor-api-url": saleorApiUrl ?? "",
          "authorization-bearer": token ?? "",
        },
      });
    },
    [saleorApiUrl, token],
  );

  return {
    fetch: customFetch,
    isReady: saleorApiUrl && token,
  };
};

async function handleResponse<T extends z.ZodTypeAny>(
  res: Response,
  config: FetchConfig<T> | undefined,
): Promise<void> {
  if (!res.ok) {
    void config?.onError?.(
      new FetchError(res.statusText, {
        props: {
          body: await res.text(),
          code: res.status,
        },
      }),
    );
    void config?.onFinished?.();
    return;
  }

  try {
    if (isConfigWithSchema(config)) {
      const json = (await res.json()) as JSONValue;
      const data = config.schema.parse(json) as T;
      void config?.onSuccess?.(data);
    } else {
      void config?.onDone?.();
    }
    void config?.onFinished?.();
  } catch (err) {
    void config?.onError?.(FetchParseError.normalize(err));
    void config?.onFinished?.();
  }
}

/** Fetch function, can be replaced to any fetching library, e.g. React Query */
export const useFetch = <T extends z.ZodTypeAny>(endpoint: string, config?: FetchConfig<T>) => {
  const { fetch, isReady } = useFetchFn();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void (async () => {
      const res = await fetch(endpoint);
      await handleResponse(res, config);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, fetch]);
};

export const usePost = <T extends z.ZodTypeAny>(endpoint: string, config?: FetchConfig<T>) => {
  const { fetch, isReady } = useFetchFn();

  const submit = useCallback(
    async (data: JSONValue, options?: RequestInit | undefined) => {
      if (!isReady) {
        return;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
        ...options,
      });
      await handleResponse(res, config);
    },
    [config, endpoint, fetch, isReady],
  );

  return submit;
};
