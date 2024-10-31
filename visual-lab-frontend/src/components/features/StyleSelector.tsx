import { useEffect, useMemo, useState } from "react";
import { Aesthetic, ColorScheme, Style } from "../../types/Style";
import { styleLabels } from "../../locales/style";
import { useLocale } from "../../context/locale";
import { TextareaAutosize } from "@mui/material";

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

  return (
    <div className="gap-4">
      <h2>{labels.title}</h2>

      <div>
        <h3>{labels.aesthetic.chooseStyle}</h3>

        <div className="flex">
          <div>
            <input
              type="radio"
              id="photoreal"
              name="aesthetic"
              value="photoreal"
              checked={aesthetic === "photoreal"}
              onChange={() => setAesthetic("photoreal")}
            />
            <label htmlFor="photoreal">{labels.aesthetic.photoreal}</label>
          </div>
          <div>
            <input
              type="radio"
              id="illustration"
              name="aesthetic"
              value="illustration"
              checked={aesthetic === "illustration"}
              onChange={() => setAesthetic("illustration")}
            />
            <label htmlFor="illustration">
              {labels.aesthetic.illustration}
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="anime"
              name="aesthetic"
              value="anime"
              checked={aesthetic === "anime"}
              onChange={() => setAesthetic("anime")}
            />
            <label htmlFor="anime">{labels.aesthetic.anime}</label>
          </div>
          <div>
            <input
              type="radio"
              id="manga"
              name="aesthetic"
              value="manga"
              checked={aesthetic === "manga"}
              onChange={() => setAesthetic("manga")}
            />
            <label htmlFor="manga">{labels.aesthetic.manga}</label>
          </div>
          <div>
            <input
              type="radio"
              id="abstract"
              name="aesthetic"
              value="abstract"
              checked={aesthetic === "abstract"}
              onChange={() => setAesthetic("abstract")}
            />
            <label htmlFor="abstract">{labels.aesthetic.abstract}</label>
          </div>
        </div>
      </div>
      <div>
        <h3>{labels.colorScheme.chooseStyle}</h3>

        <div className="flex">
          <div>
            <input
              type="radio"
              id="natural"
              name="colorScheme"
              value="natural"
              checked={colorScheme === "natural"}
              onChange={() => setColorScheme("natural")}
            />
            <label htmlFor="natural">{labels.colorScheme.natural}</label>
          </div>
          <div>
            <input
              type="radio"
              id="vivid"
              name="colorScheme"
              value="vivid"
              checked={colorScheme === "vivid"}
              onChange={() => setColorScheme("vivid")}
            />
            <label htmlFor="vivid">{labels.colorScheme.vivid}</label>
          </div>
          <div>
            <input
              type="radio"
              id="soft"
              name="colorScheme"
              value="soft"
              checked={colorScheme === "soft"}
              onChange={() => setColorScheme("soft")}
            />
            <label htmlFor="soft">{labels.colorScheme.soft}</label>
          </div>
          <div>
            <input
              type="radio"
              id="monotone"
              name="colorScheme"
              value="monotone"
              checked={colorScheme === "monotone"}
              onChange={() => setColorScheme("monotone")}
            />
            <label htmlFor="monotone">{labels.colorScheme.monotone}</label>
          </div>
        </div>
      </div>
      <div>
        <h3>{labels.freeInput.title}</h3>
        <TextareaAutosize placeholder={labels.freeInput.description} />
      </div>
    </div>
  );
};
