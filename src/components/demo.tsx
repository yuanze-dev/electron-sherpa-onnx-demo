import React from "react";
import { useOnnxServer } from "../hook/useOnnxServer";

export const DemoPage: React.FC = () => {
  const {
    isConnected,
    isRecognizing,
    lastResult,
    error,
    connect,
    disconnect,
    startRecognition,
    stopRecognition,
    clearResults,
    microphones,
    selectedDeviceId,
    selectMicrophone,
    refreshDevices,
  } = useOnnxServer({
    serverAddr: "localhost",
    serverPort: 6006,
  });

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleStartRecognition = async () => {
    await startRecognition();
  };

  const handleStopRecognition = () => {
    stopRecognition();
  };

  const handleClearResults = () => {
    clearResults();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>ONNX Speech Recognition Demo</h2>

      {/* Connection Status */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Connection Status</h3>
        <div
          style={{
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: isConnected ? "#d4edda" : "#f8d7da",
            color: isConnected ? "#155724" : "#721c24",
            border: `1px solid ${isConnected ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {isConnected
            ? "✅ Connected to ONNX Server"
            : "❌ Disconnected from ONNX Server"}
        </div>
      </div>

      {/* Connection Controls */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Connection Controls</h3>
        <button
          onClick={handleConnect}
          disabled={isConnected}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: isConnected ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isConnected ? "not-allowed" : "pointer",
          }}
        >
          Connect
        </button>
        <button
          onClick={handleDisconnect}
          disabled={!isConnected}
          style={{
            padding: "10px 20px",
            backgroundColor: !isConnected ? "#6c757d" : "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: !isConnected ? "not-allowed" : "pointer",
          }}
        >
          Disconnect
        </button>
      </div>

      {/* Recognition Controls */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Speech Recognition</h3>
        {/* Microphone selector */}
        <div style={{ marginBottom: "10px", display: "flex", gap: 8, alignItems: "center" }}>
          <label htmlFor="mic-select" style={{ fontWeight: 600 }}>Microphone:</label>
          <select
            id="mic-select"
            value={selectedDeviceId ?? ""}
            onChange={async (e) => {
              const id = e.target.value;
              await selectMicrophone(id);
            }}
            disabled={microphones.length === 0}
            style={{ padding: "6px 8px", minWidth: 280 }}
          >
            {microphones.length === 0 ? (
              <option value="">No microphone found</option>
            ) : (
              microphones.map((m) => (
                <option key={m.deviceId} value={m.deviceId}>
                  {m.label}
                </option>
              ))
            )}
          </select>
          <button
            onClick={() => refreshDevices()}
            style={{ padding: "6px 10px" }}
          >
            Refresh
          </button>
        </div>
        <div
          style={{
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: isRecognizing ? "#d1ecf1" : "#e2e3e5",
            color: isRecognizing ? "#0c5460" : "#495057",
            border: `1px solid ${isRecognizing ? "#bee5eb" : "#ced4da"}`,
            marginBottom: "10px",
          }}
        >
          {isRecognizing ? "🎤 Recording..." : "🔇 Not recording"}
        </div>

        <button
          onClick={handleStartRecognition}
          disabled={!isConnected || isRecognizing}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor:
              !isConnected || isRecognizing ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: !isConnected || isRecognizing ? "not-allowed" : "pointer",
          }}
        >
          Start Recognition
        </button>

        <button
          onClick={handleStopRecognition}
          disabled={!isRecognizing}
          style={{
            padding: "10px 20px",
            backgroundColor: !isRecognizing ? "#6c757d" : "#ffc107",
            color: !isRecognizing ? "white" : "#212529",
            border: "none",
            borderRadius: "5px",
            cursor: !isRecognizing ? "not-allowed" : "pointer",
          }}
        >
          Stop Recognition
        </button>
      </div>

      {/* Results */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Recognition Results</h3>
        <div
          style={{
            minHeight: "100px",
            padding: "15px",
            border: "1px solid #ced4da",
            borderRadius: "5px",
            backgroundColor: "#f8f9fa",
            fontFamily: "monospace",
            fontSize: "14px",
            whiteSpace: "pre-wrap",
            overflow: "auto",
          }}
        >
          {lastResult || "No results yet..."}
        </div>

        <button
          onClick={handleClearResults}
          style={{
            padding: "8px 16px",
            marginTop: "10px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Clear Results
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Error</h3>
          <div
            style={{
              padding: "10px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
              borderRadius: "5px",
            }}
          >
            ❌ {error}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#e9ecef",
          borderRadius: "5px",
          fontSize: "14px",
        }}
      >
        <h4>Instructions:</h4>
        <ol>
          <li>
            Make sure your ONNX speech recognition server is running on
            localhost:6006
          </li>
          <li>Click "Connect" to establish WebSocket connection</li>
          <li>Click "Start Recognition" to begin speech recognition</li>
          <li>Speak into your microphone</li>
          <li>Recognition results will appear in real-time above</li>
          <li>Click "Stop Recognition" when finished</li>
        </ol>
      </div>
    </div>
  );
};
