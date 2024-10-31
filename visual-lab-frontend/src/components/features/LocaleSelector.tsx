import { Locale } from "../../context/locale";

export default ({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}) => {
  return (
    <div>
      <div className="flex">
        <div>
          <input
            type="radio"
            id="en"
            name="locale"
            value="en"
            checked={locale === "en"}
            onChange={() => setLocale("en")}
          />
          <label htmlFor="en">English</label>
        </div>
        <div>
          <input
            type="radio"
            id="ja"
            name="locale"
            value="ja"
            checked={locale === "ja"}
            onChange={() => setLocale("ja")}
          />
          <label htmlFor="ja">Japanese</label>
        </div>
      </div>
    </div>
  );
};
