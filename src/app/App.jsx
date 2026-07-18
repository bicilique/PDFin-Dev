import React from "react";
import { Header, Footer } from "./Chrome.jsx";
import { HomeScreen } from "../features/home/HomeScreen.jsx";
import { PrivacySecurityPage } from "../features/privacy/PrivacySecurityPage.jsx";
import { SelfHostedPage } from "../features/selfHosted/SelfHostedPage.jsx";
import { WorkspaceApp } from "../features/workspace/WorkspaceApp.jsx";
import { DEFAULT_TOOL_ID, getToolFromHash, getToolFromPath, getToolHref, isPrivacyRoute, isSelfHostedRoute, isWorkspaceRoute } from "./toolRoutes.js";
import { applyTheme, getInitialTheme, migrateLegacyThemePreference, persistExplicitTheme } from "./theme.js";
import { getInitialLang, persistLangPreference } from "./locale.js";

function getInitialScreen() {
  if (isPrivacyRoute()) return "privacy";
  if (isSelfHostedRoute()) return "self-hosted";
  return isWorkspaceRoute() ? "workspace" : "home";
}

export function App() {
  const [lang, setLang] = React.useState(getInitialLang);
  const [theme, setTheme] = React.useState(getInitialTheme);
  const [screen, setScreen] = React.useState(getInitialScreen);

  const setExplicitTheme = React.useCallback((nextTheme) => {
    setTheme(nextTheme);
    persistExplicitTheme(nextTheme);
  }, []);

  React.useEffect(() => {
    applyTheme(theme);
    document.documentElement.setAttribute("lang", lang);
    persistLangPreference(lang);
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
    if (screen === "workspace" && !getToolFromHash() && !getToolFromPath()) {
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

  const openPrivacy = () => {
    window.history.pushState(null, "", `${import.meta.env.BASE_URL}privacy-security/`);
    setScreen("privacy");
  };

  const openSelfHosted = () => {
    window.history.pushState(null, "", `${import.meta.env.BASE_URL}self-hosted/`);
    setScreen("self-hosted");
  };

  const focusHomeMain = (event) => {
    event.preventDefault();
    const target = document.getElementById(screen === "privacy" ? "privacy-main" : screen === "self-hosted" ? "self-hosted-main" : "home-main");
    if (target) target.focus();
  };

  if (screen === "workspace") {
    return <WorkspaceApp initialLang={lang} initialTheme={theme} onHome={openHome} onLangChange={setLang} />;
  }

  const content = screen === "privacy"
    ? <PrivacySecurityPage lang={lang} />
    : screen === "self-hosted"
      ? <SelfHostedPage lang={lang} />
      : <HomeScreen lang={lang} onOpenWorkspace={openWorkspace} />;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--surface-page)" }}>
      <a className="skip-link" href={screen === "privacy" ? "#privacy-main" : screen === "self-hosted" ? "#self-hosted-main" : "#home-main"} onClick={focusHomeMain}>
        {screen === "privacy"
          ? (lang === "id" ? "Lewati ke konten privasi" : "Skip to privacy content")
          : screen === "self-hosted"
            ? (lang === "id" ? "Lewati ke konten Self-hosted" : "Skip to Self-hosted content")
          : (lang === "id" ? "Lewati ke katalog alat" : "Skip to tool catalog")}
      </a>
      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setExplicitTheme}
        current={screen === "self-hosted" ? "self-hosted" : screen === "privacy" ? "privacy" : "home"}
        onHome={openHome}
        onWorkspace={() => openWorkspace(DEFAULT_TOOL_ID)}
        onPrivacy={openPrivacy}
        onSelfHosted={openSelfHosted}
      />
      <div style={{ flex: 1 }} data-screen-label={screen === "privacy" ? "Privacy & Security" : screen === "self-hosted" ? "Self-hosted" : "Homepage"}>
        {content}
      </div>
      <Footer lang={lang} onPrivacy={openPrivacy} onSelfHosted={openSelfHosted} />
    </div>
  );
}
