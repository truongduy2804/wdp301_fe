import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store/store.ts";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
      <ToastContainer autoClose={3000} />
      <Toaster position="bottom-right" />
    </Provider>
  </BrowserRouter>,
);
