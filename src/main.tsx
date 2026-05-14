import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store";
import App from "./App";
import "./index.css";

// 🔐 Token de développement (valide 90 jours — regénéré le 14 mai 2026)
const DEV_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZXYtdXNlci0wMDEiLCJlbWFpbCI6InRlc3RAZXRhZmFrbmEuY29tIiwiaWF0IjoxNzc4NzE0MTQ5LCJleHAiOjE3ODY0OTAxNDl9.VA73wZI0tiX3MXciXZpl2lhc3UucFZESD1HdIOmfRjg";

if (import.meta.env.DEV) {
  localStorage.setItem("access_token", DEV_TOKEN);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
