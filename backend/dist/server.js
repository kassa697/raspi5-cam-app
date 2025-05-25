"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const child_process_1 = require("child_process");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://192.168.10.114:5173"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://192.168.10.114:5173"],
    credentials: true,
}));
app.use(express_1.default.json());
// カメラストリーミング用のFFmpegプロセス
let ffmpegProcess = null;
// カメラストリーミング開始
const startCameraStream = () => {
    if (ffmpegProcess) {
        ffmpegProcess.kill();
    }
    // ELP USBカメラからのストリーミング設定
    ffmpegProcess = (0, child_process_1.spawn)("ffmpeg", [
        "-f",
        "v4l2",
        "-i",
        "/dev/video0", // USBカメラデバイス
        "-vf",
        "scale=640:480", // 解像度調整
        "-r",
        "15", // フレームレート
        "-f",
        "mjpeg",
        "-q:v",
        "5", // 品質設定
        "pipe:1",
    ]);
    ffmpegProcess.stdout.on("data", (data) => {
        // 映像データをクライアントに送信
        io.emit("frame", data.toString("base64"));
    });
    ffmpegProcess.stderr.on("data", (data) => {
        console.log("FFmpeg stderr:", data.toString());
    });
    ffmpegProcess.on("close", (code) => {
        console.log(`FFmpeg process closed with code ${code}`);
    });
};
// Socket.io接続処理
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    // クライアント接続時にストリーミング開始
    if (!ffmpegProcess) {
        startCameraStream();
    }
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        // 全クライアントが切断された場合はストリーミング停止
        if (io.engine.clientsCount === 0 && ffmpegProcess) {
            ffmpegProcess.kill();
            ffmpegProcess = null;
        }
    });
});
// ヘルスチェック用エンドポイント
app.get("/health", (req, res) => {
    res.json({ status: "ok", camera: ffmpegProcess ? "running" : "stopped" });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// プロセス終了時のクリーンアップ
process.on("SIGINT", () => {
    if (ffmpegProcess) {
        ffmpegProcess.kill();
    }
    process.exit();
});
