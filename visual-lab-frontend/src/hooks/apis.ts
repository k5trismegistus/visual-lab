import { useState, useEffect, useCallback } from "react";
import { Style } from "../types/Style";
import { TApiError } from "../types/ApiErrors";

const fetchApi = async <T>({
  method,
  path,
  query,
  body,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  query?: Record<string, string>;
  body?: Record<string, string | Record<string, string>>;
}): Promise<{ data: T | null; error: TApiError | null }> => {
  const url = (() => {
    const url = new URL(`${process.env.VITE_API_BASE}${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  })();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Api-Key": process.env.VITE_API_KEY!,
  };

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = (() => {
        switch (response.status) {
          case 400:
            return "BAD_REQUEST";
          case 401:
            return "UNAUTHORIZED";
          case 403:
            return "FORBIDDEN";
          case 404:
            return "NOT_FOUND";
          case 429:
            return "TOO_MANY_REQUESTS";
          case 500:
            return "INTERNAL_SERVER_ERROR";
          default:
            return "UNKNOW_ERROR";
        }
      })();

      return { data: null, error };
    }

    const data = response.body && ((await response.json()) as T);
    return { data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "NETWORK_ERROR" };
  }
};

export const useSignedUrlForUploadSketch = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<TApiError | null>(null);

  const fetchSignedUrl = async ({
    fileExtension,
  }: {
    fileExtension: string;
  }) => {
    setLoading(true);
    const { data, error } = await fetchApi<{
      signed_url: string;
      object_key: string;
    }>({
      method: "GET",
      path: `/signed-url?file_extension=${fileExtension}`,
    });

    if (error || data === null) {
      setError(error || "UNKNOW_ERROR");
      setLoading(false);
      return { signedUrl: "", objectKey: "" };
    }

    return { signedUrl: data.signed_url, objectKey: data.object_key };
  };

  return { fetchSignedUrl, isLoading, error };
};

export const useCreateGenerateRequest = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<TApiError | null>(null);

  const createGenerateRequest = async ({
    objectKey,
    instruction,
    aspectRatio,
  }: {
    objectKey: string;
    instruction: Style & { freeInput: string };
    aspectRatio: string;
  }) => {
    setLoading(true);
    const { error } = await fetchApi<null>({
      method: "POST",
      path: "/generate-request",
      body: {
        object_key: objectKey,
        instruction: {
          aesthetic: instruction.aesthetic,
          color_scheme: instruction.colorScheme,
          free_input: instruction.freeInput,
        },
        aspect_ratio: aspectRatio,
      },
    });
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return { createGenerateRequest, isLoading, error };
};
