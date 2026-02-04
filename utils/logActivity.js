import axios from "axios";

export const logActivity = async ({ userId, userName, action, entity, entityId }) => {
  try {
    await axios.post("/api/activity-log", {
      userId,
      userName,
      action,
      entity,
      entityId,
    });
  } catch (err) {
    console.error("Activity Log Error:", err.message);
  }
};
