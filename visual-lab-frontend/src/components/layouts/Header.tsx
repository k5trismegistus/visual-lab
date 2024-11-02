import { Link } from "@tanstack/react-router";
import LocaleSelector from "../features/LocaleSelector";
import { useLocale } from "../../context/locale";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";

export default () => {
  const { locale, setLocale } = useLocale();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Visual Lab
          </Typography>
          <LocaleSelector locale={locale} setLocale={setLocale} />
        </Toolbar>
      </AppBar>
    </Box>
  );
};
