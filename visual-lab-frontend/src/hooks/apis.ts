import { useState, useEffect } from "react";
import { Style } from "../types/Style";

const useApiFetchHook = <T>({
  method,
  path,
  query,
  body,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  query?: Record<string, string>;
  body?: Record<string, string | Record<string, string>>;
}) => {
  const [data, setData] = useState<T>(); // <-- Generics で受け取った型を data の型とする
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);

  const url = (() => {
    const url = new URL(path, process.env.VITE_API_HOST);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  })();

  const params = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(url, params); // <-- 引数で受け取った url を fetch する
        const data = await res.json();
        setData(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, isLoading, isError };
};

export const useShowSignedUrlForUploadSketch = ({
  fileExtension,
}: {
  fileExtension: string;
}) => {
  return useApiFetchHook<{
    signed_url: string;
    object_key: string;
  }>({
    method: "GET",
    path: `${process.env.VITE_API_URL}/signed-url?file_extension=${fileExtension}`,
  });
};

export const useCreateGenerateRequest = ({
  objectKey,
  instruction,
  aspectRatio,
}: {
  objectKey: string;
  instruction: Style & { freeInput: string };
  aspectRatio: string;
}) => {
  return useApiFetchHook({
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
};
