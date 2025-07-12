import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { RouterProvider, BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoutes from "./ProtectedRoutes";
import { Login } from "./auth.jsx";

// const auth = getAuth()
//   .projectConfigManager()
//   .updateProjectConfig({
//     multiFactorConfig: {
//       providerConfigs: [
//         {
//           state: "ENABLED",
//         },
//       ],
//     },
//   });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<App />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
