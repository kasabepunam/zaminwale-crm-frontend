import React, { useState } from "react";
import "../styles/WhatsappPopup.css";


function WhatsappPopup({ customer, onClose }) {
  const [template, setTemplate] = useState("default");

  // 5 message templates with company phone/email
  const templates = {
    default: `Hello ${customer.name},

Your booking is active with Zaminwale.

Location: ${customer.location}
Village: ${customer.village}

Booking Amount: ₹${customer.bookingAmount}
Received Amount: ₹${customer.receivedAmount}
Balance: ₹${customer.balanceAmount}

Phone: 9555599299
Email: info@zaminwale.in

Head Office: Sanpada
Company: Zaminwale Pvt. Ltd.

Please contact us if required.`,

reminder: `Hi ${customer.name},

This is a friendly reminder for your booking with Zaminwale.

Location: ${customer.location}
Village: ${customer.village}

Balance Amount: ₹${customer.balanceAmount}

Phone: 9555599299
Email: info@zaminwale.in

Head Office: Sanpada
Company: Zaminwale Pvt. Ltd.

Kindly make the payment at your earliest convenience.`,

thankyou: `Hello ${customer.name},

Thank you for your payment for your booking with Zaminwale.

Location: ${customer.location}
Village: ${customer.village}

Received Amount: ₹${customer.receivedAmount}

Phone: 9555599299
Email: info@zaminwale.in

Head Office: Sanpada
Company: Zaminwale Pvt. Ltd.

We appreciate your promptness.`,

followup: `Dear ${customer.name},

We are following up regarding your booking at Zaminwale.

Status: ${customer.status}
Balance: ₹${customer.balanceAmount}

Phone: 9555599299
Email: info@zaminwale.in

Head Office: Sanpada
Company: Zaminwale Pvt. Ltd.

Please reach out to us if you need any assistance.`,

feedback: `Hi ${customer.name},

Hope you are doing well!

We would love to hear your feedback regarding your experience with Zaminwale.

Phone: 9555599299
Email: info@zaminwale.in

Head Office: Sanpada
Company: Zaminwale Pvt. Ltd.

Thank you!`
  };

  const handleSendWhatsApp = () => {
    const message = encodeURIComponent(templates[template]);
    const phoneNumber = customer.phone?.replace(/\D/g, "");
    if (!phoneNumber) return alert("Customer phone number not available!");
    const url = `https://wa.me/91${phoneNumber}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="wp-popup-overlay">
      <div className="wp-popup">
        <div className="wp-header">
          <h3>Send WhatsApp Message</h3>
          <button className="wp-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="wp-body">
          <label>Select Template:</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {Object.keys(templates).map((key) => (
              <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
            ))}
          </select>

          <textarea
            readOnly
            value={templates[template]}
            rows={12}
          />
        </div>

        <div className="wp-footer">
          <button className="wp-send-btn" onClick={handleSendWhatsApp}>
            Send WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

export default WhatsappPopup;
