import { Link } from "@tanstack/react-router";
import LocaleSelector from "../features/LocaleSelector";
import { useLocale } from "../../context/locale";

export default () => {
  const { locale, setLocale } = useLocale();

  return (
    <>
      <div className="flex justify-between">
        <h1>Visual Lab</h1>
        <LocaleSelector locale={locale} setLocale={setLocale} />
      </div>
    </>
  );
};
