import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Inicializa a aplicação React
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
