import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const login = (email, password) => {
        let loggedInUser = null;

        if (email === "admin@zaminwale.in" && password === "zamin@crm") {
            loggedInUser = { email, role: "admin" };
        } else if (email === "emp@zaminwale.in" && password === "emp@crm") {
            loggedInUser = { email, role: "employee" };
        }

        if (loggedInUser) {
            setUser(loggedInUser);
            localStorage.setItem("user", JSON.stringify(loggedInUser));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
