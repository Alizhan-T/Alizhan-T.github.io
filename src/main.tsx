import ReactDOM from "react-dom/client";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/cyrillic-400.css";
import "./index.css";
import App from "./App";
import { LangProvider } from "./i18n/LangContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <LangProvider>
    <App />
  </LangProvider>,
);
