import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import ModernError from "modern-errors";
import { useCallback, useEffect, useRef } from "react";
import { z } from "zod";
import { JSONValue } from "../types";

export const FetchError = ModernError.subclass("FetchError", {
  props: {
    body: "",
    code: 500,
  },
});
export const FetchParseError = ModernError.subclass("FetchParseError");

type FetchConfigWithSchema<T> = {
  schema: z.ZodType<T>;
  onSuccess?: (data: z.infer<z.ZodType<T>>) => void | Promise<void>;
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

type FetchConfig<T> = FetchConfigWithoutSchema | FetchConfigWithSchema<T>;

const isConfigWithSchema = <T>(
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

async function handleResponse<T>(res: Response, config: FetchConfig<T> | undefined): Promise<void> {
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
      const data = config.schema.parse(json);
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

/** Fetch function, can be replaced to any fetching library, e.g. React Query, useSWR */
export const useFetch = <T>(endpoint: string, config?: FetchConfigWithSchema<T>) => {
  const { fetch, isReady } = useFetchFn();
  const configRef = useRef(config);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void (async () => {
      const res = await fetch(endpoint);
      await handleResponse(res, configRef.current);
    })();
  }, [endpoint, fetch, isReady]);
};

export const usePost = <T>(endpoint: string, config?: FetchConfig<T>) => {
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
