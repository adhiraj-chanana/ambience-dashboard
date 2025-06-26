import React, { useEffect, useState } from "react";
import api from "../api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification", err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Notifications</h1>
      {notifications.length === 0 ? (
        <p style={styles.empty}>No new notifications.</p>
      ) : (
        notifications.map((notif) => (
          <div key={notif.id} style={styles.card}>
            <span>{notif.message}</span>
            <button onClick={() => handleDelete(notif.id)} style={styles.close}>✕</button>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px" },
  heading: { fontSize: "2rem", marginBottom: "30px", color: "#004080" },
  empty: { color: "#777" },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eaf4ff",
    padding: "15px 20px",
    marginBottom: "15px",
    borderRadius: "8px",
    boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
  },
  close: {
    background: "transparent",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#003366",
  },
};

export default Notifications;
