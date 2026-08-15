import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";

createRoot(document.getElementById("root")!).render(
	<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
		<App />
	</ThemeProvider>
);
