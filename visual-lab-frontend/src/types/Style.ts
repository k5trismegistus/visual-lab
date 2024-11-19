export type Aesthetic =
  | "photoreal"
  | "illustration"
  | "anime"
  | "manga"
  | "abstract";
export type ColorScheme = "natural" | "monotone" | "vivid" | "soft";

export type Style = {
  aesthetic: Aesthetic;
  colorScheme: ColorScheme;
};

export type Instruction = Style & { freeInput: string };
