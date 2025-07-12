import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
<<<<<<< HEAD
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import { Login } from "./auth";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<App />} />
        </Route>
        <Route path="/login" element={<Login />} />
        {/* Add other routes here as needed */}
      </Routes>
    </Router>
=======

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
>>>>>>> 54da1e2444e4e2684bee973159cc90a22b56bdb6
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
