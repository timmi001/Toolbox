import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
