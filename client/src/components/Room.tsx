import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useWebRTC } from "../hooks/useWebRTC";
import {
  Upload,
  File as FileIcon,
  CheckCircle,
  Download,
  Send,
  MessageSquare,
  Clock,
} from "lucide-react";
import streamSaver from "streamsaver";
import { v4 as uuidv4 } from "uuid";

const CHUNK_SIZE = 16 * 1024; // 16KB chunks

interface Message {
  id: string;
  text: string;
  sender: "me" | "peer";
  timestamp: number;
}

interface FileHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  direction: "sent" | "received";
  timestamp: number;
}

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { peers, connected, sendData } = useWebRTC(roomId || "");
  const [dragActive, setDragActive] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferStatus, setTransferStatus] = useState<
    "idle" | "uploading" | "downloading" | "completed"
  >("idle");
  const [currentFile, setCurrentFile] = useState<{
    name: string;
    size: number;
  } | null>(null);

  // Chat & History State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Receiving state
  const fileWriter = useRef<WritableStreamDefaultWriter | null>(null);
  const receivingFile = useRef<{
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const receivedSize = useRef(0);

  useEffect(() => {
    if (peers.length > 0) {
      const peer = peers[0]; // Assuming 1 peer for MVP

      peer.on("data", (data: Uint8Array) => {
        handleData(data);
      });
    }
  }, [peers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle incoming data from peer (File chunks or Chat messages)
  const handleData = async (data: Uint8Array) => {
    try {
      const textDecoder = new TextDecoder();
      // Try to decode as JSON first (for header/end/chat)
      let msg;
      try {
        // Optimization: Only try to parse if it looks like JSON (small enough)
        if (data.byteLength < 5000) {
          const str = textDecoder.decode(data);
          msg = JSON.parse(str);
        }
      } catch (e) {
        // Not JSON, treat as binary chunk
      }

      if (msg && msg.type) {
        if (msg.type === "chat") {
          // Handle Chat Message
          setMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              text: msg.text,
              sender: "peer",
              timestamp: msg.timestamp,
            },
          ]);
        } else if (msg.type === "header") {
          // Handle File Start (Header)
          receivingFile.current = {
            name: msg.fileName,
            size: msg.fileSize,
            type: msg.fileType,
          };
          receivedSize.current = 0;
          setTransferStatus("downloading");
          setCurrentFile({ name: msg.fileName, size: msg.fileSize });
          setTransferProgress(0);

          // Add to history
          setFileHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              fileName: msg.fileName,
              fileSize: msg.fileSize,
              direction: "received",
              timestamp: Date.now(),
            },
          ]);

          // Initialize StreamSaver to write file directly to disk
          const fileStream = streamSaver.createWriteStream(msg.fileName, {
            size: msg.fileSize,
          });
          fileWriter.current = fileStream.getWriter();
        } else if (msg.type === "end") {
          // Handle File End
          if (fileWriter.current) {
            await fileWriter.current.close();
            fileWriter.current = null;
          }
          setTransferStatus("completed");
          setTransferProgress(100);
          // Reset UI after delay
          setTimeout(() => {
            setTransferStatus("idle");
            setCurrentFile(null);
            receivingFile.current = null;
            receivedSize.current = 0;
          }, 3000);
        }
      } else {
        // Handle Binary Chunk (File Data)
        if (fileWriter.current && receivingFile.current) {
          await fileWriter.current.write(data);
          receivedSize.current += data.byteLength;
          const progress = Math.min(
            100,
            Math.round(
              (receivedSize.current / receivingFile.current.size) * 100
            )
          );
          setTransferProgress(progress);
        }
      }
    } catch (err) {
      console.error("Error handling data", err);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !connected) return;

    const msg = {
      type: "chat",
      id: uuidv4(),
      text: newMessage,
      timestamp: Date.now(),
    };

    sendData(JSON.stringify(msg));
    setMessages((prev) => [
      ...prev,
      {
        id: msg.id,
        text: msg.text,
        sender: "me",
        timestamp: msg.timestamp,
      },
    ]);
    setNewMessage("");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!connected) {
      alert("Wait for a peer to connect!");
      return;
    }

    setTransferStatus("uploading");
    setCurrentFile({ name: file.name, size: file.size });
    setTransferProgress(0);

    // Add to history
    setFileHistory((prev) => [
      ...prev,
      {
        id: uuidv4(),
        fileName: file.name,
        fileSize: file.size,
        direction: "sent",
        timestamp: Date.now(),
      },
    ]);

    // Send Header
    const header = JSON.stringify({
      type: "header",
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    sendData(header);

    // Send Chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let offset = 0;

    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      const buffer = await chunk.arrayBuffer();
      sendData(new Uint8Array(buffer));
      offset += CHUNK_SIZE;

      const progress = Math.min(100, Math.round((offset / file.size) * 100));
      setTransferProgress(progress);

      // Small delay to prevent flooding buffer
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    // Send End
    sendData(JSON.stringify({ type: "end" }));
    setTransferStatus("completed");
    setTimeout(() => {
      setTransferStatus("idle");
      setCurrentFile(null);
    }, 3000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <div className="h-screen bg-gray-900 text-white p-4 md:p-8 overflow-hidden flex flex-col">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Left Column: File Transfer & History */}
        <div className="lg:col-span-2 flex flex-col gap-8 h-full min-h-0">
          <div className="flex justify-between items-center shrink-0">
            <h2 className="text-xl font-bold">
              Room:{" "}
              <span className="text-blue-400 font-mono text-base">
                {roomId}
              </span>
            </h2>
            <div
              className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                connected
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  connected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                }`}
              />
              {connected ? "Peer Connected" : "Waiting for Peer..."}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            className={`
                    border-4 border-dashed rounded-3xl h-48 flex flex-col items-center justify-center transition-all shrink-0
                    ${
                      dragActive
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 bg-gray-800/50"
                    }
                    ${
                      !connected
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:border-gray-600"
                    }
                `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {transferStatus === "idle" ? (
              <>
                <Upload
                  className={`w-12 h-12 mb-4 ${
                    dragActive ? "text-blue-500" : "text-gray-500"
                  }`}
                />
                <p className="text-lg text-gray-400 font-medium">
                  Drag & Drop file to share
                </p>
                <p className="text-sm text-gray-600 mt-2">or paste anywhere</p>
              </>
            ) : (
              <div className="w-full max-w-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileIcon className="text-blue-400" />
                    <div>
                      <p className="font-medium">{currentFile?.name}</p>
                      <p className="text-sm text-gray-500">
                        {currentFile?.size
                          ? (currentFile.size / 1024 / 1024).toFixed(2)
                          : "0.00"}{" "}
                        MB
                      </p>
                    </div>
                  </div>
                  {transferStatus === "completed" ? (
                    <CheckCircle className="text-green-500" />
                  ) : (
                    <Download className="text-blue-500 animate-bounce" />
                  )}
                </div>

                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${transferProgress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>
                    {transferStatus === "uploading"
                      ? "Sending..."
                      : transferStatus === "downloading"
                      ? "Receiving..."
                      : "Completed"}
                  </span>
                  <span>{transferProgress}%</span>
                </div>
              </div>
            )}
          </div>

          {/* File History */}
          <div className="bg-gray-800/50 rounded-2xl p-4 flex-1 min-h-0 overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 shrink-0">
              <Clock size={20} /> File History
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {fileHistory.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">
                  No files transferred yet.
                </p>
              ) : (
                fileHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-800 p-3 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          item.direction === "sent"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {item.direction === "sent" ? (
                          <Upload size={16} />
                        ) : (
                          <Download size={16} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px]">
                          {item.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatSize(item.fileSize)} •{" "}
                          {formatTime(item.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="bg-gray-800/50 rounded-2xl p-4 h-full min-h-0 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 shrink-0">
            <MessageSquare size={20} /> Chat
          </h3>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center mt-20">
                Start the conversation!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] break-words rounded-2xl px-4 py-2 ${
                      msg.sender === "me"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-700 text-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className="text-[10px] opacity-70 text-right mt-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !connected}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-xl transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Room;
