import React from "react";
import './Header.css'; // optional: add CSS for better UI

const Header = ({ username = "User", onLogout }) => {
    return (
        <header className="header">
            <div className="header-left">
                <h2>Welcome, {username}</h2>
            </div>
            <div className="header-right">
                <button className="logout-button" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
