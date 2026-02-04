import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.js";
import { BrowserRouter } from "react-router-dom";
import { CustomerProvider } from "./context/CustomerContext.js";
import "./styles/Login.css";
import "./styles/Sidebar.css";
import "./styles/Customers.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <CustomerProvider>
                <App />
            </CustomerProvider>
        </BrowserRouter>
    </React.StrictMode>
);

