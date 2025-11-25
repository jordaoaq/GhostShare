# 👻 GhostShare

> **Share files like a ghost.** No servers, no traces, just you and your peer.

![GhostShare Banner](https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop)

GhostShare is a secure, serverless P2P file sharing application designed for privacy and speed. It uses WebRTC to establish a direct connection between peers, ensuring that your files **never** touch a server. The server acts only as a signaling mechanism to introduce peers to each other.

## ✨ Features

- **🔒 Privacy First**: Files are transferred directly between browsers. No databases, no S3 buckets, no logs.
- **⚡ Blazing Fast**: P2P connection means no server bottlenecks. Transfer speed is limited only by your network.
- **📦 No Size Limits**: Powered by **StreamSaver.js**, GhostShare streams files directly to your disk, bypassing memory limits. Share 10GB+ files without crashing your browser.
- **💬 Real-time Chat**: Secure, ephemeral chat between peers.
- **📜 File History**: Keep track of what you've sent and received during the session.
- **🌐 Monorepo Architecture**: Built with a modern stack, ready for easy deployment.

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io (Signaling)
- **P2P Core**: Simple-peer (WebRTC)
- **Streaming**: StreamSaver.js

## 🏃‍♂️ How to Run

### Prerequisites

- Node.js (v18+)

### Quick Start

1. **Clone and Install**

   ```bash
   git clone https://github.com/yourusername/ghostshare.git
   cd ghostshare
   npm run install:all
   ```

2. **Build**

   ```bash
   npm run build
   ```

3. **Start**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Mode

Run frontend and backend concurrently with hot-reload:

```bash
npm run dev
```

## 📖 How to Use

1. Click **"Create Room"** on the home page.
2. Share the generated **Room URL** with a friend.
3. Wait for the **"Peer Connected"** indicator to turn green.
4. **Drag & Drop** any file to start sharing!
5. Use the chat to communicate securely.

## ⚠️ Note on "Strict Mode"

React Strict Mode is enabled for development best practices. If you encounter connection quirks in dev mode, try refreshing both tabs. In production builds, this is not an issue.

---

Made with 💙 by [Your Name]
