import React from "react";
import { Header, Footer } from "./Chrome.jsx";
import { HomeScreen } from "../features/home/HomeScreen.jsx";
import { WorkspaceApp } from "../features/workspace/WorkspaceApp.jsx";
import { DEFAULT_TOOL_ID, getToolFromHash, getToolHref, isWorkspaceRoute } from "./toolRoutes.js";
import { applyTheme, getInitialTheme, migrateLegacyThemePreference, persistExplicitTheme } from "./theme.js";

function getInitialScreen() {
  return isWorkspaceRoute() ? "workspace" : "home";
}

export function App() {
  const [lang, setLang] = React.useState("id");
  const [theme, setTheme] = React.useState(getInitialTheme);
  const [screen, setScreen] = React.useState(getInitialScreen);

  const setExplicitTheme = React.useCallback((nextTheme) => {
    setTheme(nextTheme);
    persistExplicitTheme(nextTheme);
  }, []);

  React.useEffect(() => {
    applyTheme(theme);
    document.documentElement.setAttribute("lang", lang);
  }, [theme, lang]);

  React.useEffect(() => {
    migrateLegacyThemePreference();
  }, []);

  React.useEffect(() => {
    const syncScreen = () => setScreen(getInitialScreen());
    window.addEventListener("hashchange", syncScreen);
    window.addEventListener("popstate", syncScreen);
    return () => {
      window.removeEventListener("hashchange", syncScreen);
      window.removeEventListener("popstate", syncScreen);
    };
  }, []);

  React.useEffect(() => {
    if (screen === "workspace" && !getToolFromHash()) {
      window.history.replaceState(null, "", getToolHref(DEFAULT_TOOL_ID));
    }
  }, [screen]);

  const openHome = () => {
    window.history.pushState(null, "", import.meta.env.BASE_URL);
    setScreen("home");
  };

  const openWorkspace = (toolId = DEFAULT_TOOL_ID) => {
    window.history.pushState(null, "", getToolHref(toolId));
    setScreen("workspace");
  };

  const focusHomeMain = (event) => {
    event.preventDefault();
    const target = document.getElementById("home-main");
    if (target) target.focus();
  };

  if (screen === "workspace") {
    return <WorkspaceApp initialLang={lang} initialTheme={theme} onHome={openHome} />;
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--surface-page)" }}>
      <a className="skip-link" href="#home-main" onClick={focusHomeMain}>
        {lang === "id" ? "Lewati ke katalog alat" : "Skip to tool catalog"}
      </a>
      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setExplicitTheme}
        current="home"
        onHome={openHome}
        onWorkspace={() => openWorkspace(DEFAULT_TOOL_ID)}
      />
      <div style={{ flex: 1 }} data-screen-label="Homepage">
        <HomeScreen lang={lang} />
      </div>
      <Footer lang={lang} />
    </div>
  );
}
