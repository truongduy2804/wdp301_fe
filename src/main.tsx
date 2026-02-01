import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";

console.log("DEBUG: VITE_API_URL =", import.meta.env.VITE_API_URL);

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <ToastContainer autoClose={3000} />
    <Toaster position="bottom-right" />
  </BrowserRouter>,
);
