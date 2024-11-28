import { useState } from "react";
import { Instruction } from "../types/Style";
import { useSignedUrlForUploadSketch, useCreateGenerateRequest } from "./apis";
import { ASPECTS } from "../context/sketchContext";

export const useHandleGenerateRequest = () => {
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  // Get a function to fetch a signed URL
  const { fetchSignedUrl, error: presignedError } =
    useSignedUrlForUploadSketch();

  // Get a function to create a generate request
  const {
    createGenerateRequest,
    isLoading: createLoading,
    error: createError,
  } = useCreateGenerateRequest();

  const generateRequest = async ({
    imageBlob,
    instruction,
    aspectRatio,
  }: {
    imageBlob: Blob;
    instruction: Instruction;
    aspectRatio: ASPECTS;
  }) => {
    setLoading(true);

    const fileExtension = imageBlob.type.split("/")[1];
    const { signedUrl, objectKey } = await fetchSignedUrl({ fileExtension });

    if (presignedError || !signedUrl || !objectKey) {
      setError(true);
      window.alert(
        `Failed to fetch signed URL: ${presignedError || "UNKNOW_ERROR"}`
      );
      setLoading(false);
      return;
    }

    try {
      // Upload the image to S3
      await fetch(signedUrl, {
        method: "PUT",
        body: imageBlob,
      });
    } catch (err) {
      console.error(err);
      setError(true);
      window.alert("Failed to upload image to S3");
      setLoading(false);
      return;
    }

    // Create a generate request
    await createGenerateRequest({
      objectKey: objectKey,
      instruction,
      aspectRatio,
    });

    if (createError) {
      setError(true);
      window.alert(`Failed to complete generate request: ${createError}`);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return {
    isLoading,
    isError,
    generateRequest,
  };
};
