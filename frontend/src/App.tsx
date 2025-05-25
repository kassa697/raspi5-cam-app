import React from "react";
import CameraStream from "./components/CameraStream";

const App: React.FC = () => {
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f0f0f0",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#333",
          marginBottom: "30px",
        }}
      >
        ラズパイ5 監視カメラ
      </h1>
      <CameraStream />
    </div>
  );
};

export default App;
