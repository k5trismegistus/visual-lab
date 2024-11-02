import { useEffect, useMemo, useState } from "react";
import { Aesthetic, ColorScheme, Style } from "../../types/Style";
import { styleLabels } from "../../locales/style";
import { useLocale } from "../../context/locale";
import { TextField } from "@mui/material";
import IconRadioButton from "../parts/IconRadioButton";

export default ({
  handleSelectStyle,
}: {
  handleSelectStyle: (style: Style) => void;
}) => {
  const { locale } = useLocale();

  const [aesthetic, setAesthetic] = useState<Aesthetic>("photoreal");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("natural");

  const labels = useMemo(() => styleLabels[locale], [locale]);

  useEffect(() => {
    handleSelectStyle({ aesthetic, colorScheme });
  }, [aesthetic, colorScheme]);

  const aestheticOptions = useMemo<
    Array<{
      value: Aesthetic;
      label: string;
    }>
  >(() => {
    return [
      { value: "photoreal", label: labels.aesthetic.photoreal },
      { value: "illustration", label: labels.aesthetic.illustration },
      { value: "anime", label: labels.aesthetic.anime },
      { value: "manga", label: labels.aesthetic.manga },
      { value: "abstract", label: labels.aesthetic.abstract },
    ];
  }, [locale]);

  const colorSchemeOptions = useMemo<
    Array<{ value: ColorScheme; label: string }>
  >(() => {
    return [
      { value: "natural", label: labels.colorScheme.natural },
      { value: "vivid", label: labels.colorScheme.vivid },
      { value: "soft", label: labels.colorScheme.soft },
      { value: "monotone", label: labels.colorScheme.monotone },
    ];
  }, [locale]);

  return (
    <div className="gap-4" style={{ width: 400, padding: "12px 12px 60px" }}>
      <h2 className="font-bold" style={{ fontSize: 24 }}>
        {labels.title}
      </h2>

      <div style={{ marginBottom: 12 }}>
        <h3 className="font-bold">{labels.aesthetic.chooseStyle}</h3>

        <div className="flex justify-between">
          {aestheticOptions.map((option) => (
            <IconRadioButton
              src={`/images/aesthetic/${option.value}_128x128.webp`}
              label={option.label}
              selected={aesthetic === option.value}
              onClick={() => setAesthetic(option.value)}
            />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <h3 className="font-bold">{labels.colorScheme.chooseStyle}</h3>

        <div className="flex justify-between">
          {colorSchemeOptions.map((option) => (
            <IconRadioButton
              src={`/images/color_scheme/${option.value}_128x128.webp`}
              label={option.label}
              selected={colorScheme === option.value}
              onClick={() => setColorScheme(option.value)}
            />
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <h3 className="font-bold">{labels.freeInput.title}</h3>
        <TextField
          id="outlined-multiline-static"
          fullWidth
          multiline
          rows={4}
          placeholder={labels.freeInput.description}
          style={{ color: "white" }}
        />
      </div>
    </div>
  );
};
