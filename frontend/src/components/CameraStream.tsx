import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const CameraStream: React.FC = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // 現在のホストのIPアドレスを取得してバックエンドのURLを動的に生成
    const hostname = window.location.hostname;
    const backendUrl = `http://${hostname}:3001`;

    console.log("Connecting to:", backendUrl);

    // サーバーに接続
    const newSocket = io(backendUrl, {
      transports: ["polling", "websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      setError("");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    newSocket.on("frame", (frameData: string) => {
      if (imgRef.current) {
        imgRef.current.src = `data:image/jpeg;base64,${frameData}`;
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("サーバーに接続できません");
      setIsConnected(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: isConnected ? "#d4edda" : "#f8d7da",
          color: isConnected ? "#155724" : "#721c24",
          border: `1px solid ${isConnected ? "#c3e6cb" : "#f5c6cb"}`,
        }}
      >
        状態: {isConnected ? "接続中" : "切断中"}
        {error && ` - ${error}`}
      </div>

      <div
        style={{
          border: "2px solid #333",
          borderRadius: "10px",
          padding: "10px",
          backgroundColor: "#000",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        <img
          ref={imgRef}
          alt="カメラ映像"
          style={{
            width: "640px",
            height: "480px",
            display: "block",
            backgroundColor: "#000",
          }}
          onError={() => setError("映像の表示に失敗しました")}
        />
      </div>

      <div
        style={{
          fontSize: "14px",
          color: "#666",
          textAlign: "center",
        }}
      >
        ELP USBカメラからのライブ映像
      </div>
    </div>
  );
};

export default CameraStream;
