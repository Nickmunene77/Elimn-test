import React from "react";

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "green";
      case "PENDING":
        return "orange";
      case "CANCELLED":
        return "red";
      default:
        return "gray";
    }
  };

  const color = getStatusColor(status);
  
  return (
    <span style={{
      padding: "4px 8px",
      borderRadius: "12px",
      backgroundColor: color,
      color: "white",
      fontSize: "12px",
      fontWeight: "bold"
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;
