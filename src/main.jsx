import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { useThemeDetector } from "./hooks/theme";

import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
} from "@fluentui/react-components";

const Main = () => {
  const isDarkTheme = useThemeDetector();
  return (
    <StrictMode>
      <FluentProvider theme={isDarkTheme ? webDarkTheme : webLightTheme}>
        <App />
      </FluentProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById("root")).render(<Main />);
