import React, {
  createContext,
  useContext,
  useRef,
  ReactNode,
  useState,
} from "react";
import { Aesthetic, ColorScheme, Instruction } from "../types/Style";

export type ASPECTS = "16_9" | "4_3";

type SketchContextType = {
  aesthetic: Aesthetic;
  setAesthetic: React.Dispatch<React.SetStateAction<Aesthetic>>;
  colorScheme: ColorScheme;
  setColorScheme: React.Dispatch<React.SetStateAction<ColorScheme>>;
  freeInput: string;
  setFreeInput: React.Dispatch<React.SetStateAction<string>>;
  aspect: ASPECTS;
  setAspect: React.Dispatch<React.SetStateAction<ASPECTS>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  generateCanvasImage: () => Promise<Blob | null>;
};

const SketchContext = createContext<SketchContextType | undefined>(undefined);

export const SketchProvider = ({ children }: { children: ReactNode }) => {
  const [aesthetic, setAesthetic] = useState<Aesthetic>("photoreal");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("natural");
  const [freeInput, setFreeInput] = useState<string>("");
  const [aspect, setAspect] = useState<ASPECTS>("16_9");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCanvasImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8)
    );
    return blob;
  };

  return (
    <SketchContext.Provider
      value={{
        aesthetic,
        setAesthetic,
        colorScheme,
        setColorScheme,
        freeInput,
        setFreeInput,
        aspect,
        setAspect,
        canvasRef,
        generateCanvasImage,
      }}
    >
      {children}
    </SketchContext.Provider>
  );
};

export const useSketchContext = (): SketchContextType => {
  const context = useContext(SketchContext);
  if (!context) {
    throw new Error("useSketchContext must be used within a CanvasProvider");
  }
  return context;
};
