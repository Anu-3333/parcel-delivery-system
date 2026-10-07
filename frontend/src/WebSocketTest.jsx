import { useEffect, useState } from "react";

function WebSocketTest() {
  const [parcelId, setParcelId] = useState("4");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Disconnected");

  const connectWebSocket = () => {
    if (!parcelId) {
      alert("Please enter Parcel ID");
      return;
    }

    setStatus("Connecting...");
    setMessage("");

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/tracking/${parcelId}`
    );

    socket.onopen = () => {
      setStatus("WebSocket Connected ✅");

      socket.send(
        JSON.stringify({
          parcel_id: Number(parcelId),
          status: "Tracking Started",
        })
      );
    };

    socket.onmessage = (event) => {
      setMessage(event.data);
    };

    socket.onerror = () => {
      setStatus("WebSocket Error ❌");
    };

    socket.onclose = () => {
      setStatus("WebSocket Disconnected");
    };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "40px 20px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "auto",
          backgroundColor: "white",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1>📡 WebSocket Live Tracking</h1>

        <label>
          <strong>Parcel ID</strong>
        </label>

        <input
          type="number"
          value={parcelId}
          onChange={(e) => setParcelId(e.target.value)}
          placeholder="Enter Parcel ID"
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={connectWebSocket}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Start Live Tracking
        </button>

        <h2 style={{ marginTop: "30px" }}>
          {status}
        </h2>

        <p>
          <strong>Parcel ID:</strong> {parcelId}
        </p>

        <p>
          <strong>Message:</strong>{" "}
          {message || "Waiting for message..."}
        </p>
      </div>
    </div>
  );
}

export default WebSocketTest;