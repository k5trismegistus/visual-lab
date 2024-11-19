import { useState } from "react";
import { Instruction } from "../types/Style";
import {
  useCreateGenerateRequest,
  useShowSignedUrlForUploadSketch,
} from "./apis";
import { ASPECTS } from "../context/sketchContext";

export const useHandleGenerateRequest = () => {
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);

  // Generate request
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

    const {
      data: presignedData,
      isLoading: presignedLoading,
      isError: presignedError,
    } = useShowSignedUrlForUploadSketch({ fileExtension: "jpeg" });

    const presignedUrl = presignedData?.signed_url;
    if (!presignedUrl) {
      setError(true);
      window.alert("Failed to upload image");
      return;
    }

    try {
      await fetch(presignedUrl, {
        method: "PUT",
        body: imageBlob,
      });
    } catch (err) {
      console.error(err);
      window.alert("Failed to upload image");
      setError(true);
      return;
    }

    try {
      await useCreateGenerateRequest({
        objectKey: presignedData.object_key,
        instruction,
        aspectRatio,
      });
    } catch (err) {
      console.error(err);
      window.alert("Failed to generate request");
      setError(true);
      return;
    }

    setLoading(false);
  };

  return { isLoading, isError, generateRequest };
};
