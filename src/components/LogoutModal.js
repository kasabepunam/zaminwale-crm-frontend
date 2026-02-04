import React from "react";
import "./LogoutModal.css";

function LogoutModal({ onConfirm, onCancel }) {
    return (
        <div className="logout-overlay">
            <div className="logout-modal">
                <h3>Confirm Logout</h3>
                <p>Are you sure you want to logout?</p>
                <div className="logout-actions">
                    <button className="btn cancel" onClick={onCancel}>Cancel</button>
                    <button className="btn confirm" onClick={onConfirm}>Logout</button>
                </div>
            </div>
        </div>
    );
}

export default LogoutModal;
