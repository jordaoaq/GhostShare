import { useEffect, useRef, useState } from "react";
import SimplePeer, { Instance } from "simple-peer";
import { io, Socket } from "socket.io-client";

// Determine the socket URL based on environment
// Determine the socket URL based on environment
const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD
    ? "https://ghostshare-zw6q.onrender.com"
    : "http://localhost:3000");

interface WebRTCState {
  peers: Instance[];
  connected: boolean;
  socketRef: React.MutableRefObject<Socket | null>;
  sendData: (data: string | Uint8Array) => void;
}

/**
 * Custom hook to handle WebRTC connections via Socket.io signaling.
 * Manages peer connections, signaling events, and data transmission.
 */
export const useWebRTC = (roomId: string): WebRTCState => {
  const [peers, setPeers] = useState<Instance[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<{ peerID: string; peer: Instance }[]>([]);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    }) as any as Socket;
    socketRef.current = socket;

    // Join the specific room
    socket.emit("join-room", roomId);

    // Handle existing users in the room (we are the joiner)
    socket.on("all-users", (users: string[]) => {
      const peers: Instance[] = [];
      users.forEach((userID) => {
        // Create a peer that initiates the connection
        const peer = createPeer(userID, socket.id!, socket);
        peersRef.current.push({
          peerID: userID,
          peer,
        });
        peers.push(peer);
      });
      setPeers(peers);
    });

    // Handle a new user joining (we are the existing user)
    socket.on("user-joined", (payload: { signal: any; callerID: string }) => {
      // Create a peer that accepts the connection
      const peer = addPeer(payload.signal, payload.callerID, socket);
      peersRef.current.push({
        peerID: payload.callerID,
        peer,
      });
      setPeers((users) => [...users, peer]);
    });

    // Handle receiving a returned signal (handshake completion)
    socket.on(
      "receiving-returned-signal",
      (payload: { signal: any; id: string }) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        item?.peer.signal(payload.signal);
      }
    );

    // Handle room full event
    socket.on("room-full", () => {
      alert("Room is full");
      window.location.href = "/";
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      peersRef.current.forEach(({ peer }) => peer.destroy());
    };
  }, [roomId]);

  // Create a new peer (Initiator)
  function createPeer(userToSignal: string, callerID: string, socket: Socket) {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }, // Use Google's public STUN server
        ],
      },
    });

    peer.on("signal", (signal) => {
      socket.emit("sending-signal", { userToSignal, callerID, signal });
    });

    peer.on("connect", () => {
      console.log("Peer connected");
      setConnected(true);
    });

    peer.on("close", () => {
      setConnected(false);
    });

    return peer;
  }

  // Add a peer (Receiver)
  function addPeer(incomingSignal: any, callerID: string, socket: Socket) {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    });

    peer.on("signal", (signal) => {
      socket.emit("returning-signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    peer.on("connect", () => {
      console.log("Peer connected");
      setConnected(true);
    });

    peer.on("close", () => {
      setConnected(false);
    });

    return peer;
  }

  // Send data to all connected peers
  const sendData = (data: string | Uint8Array) => {
    peersRef.current.forEach(({ peer }) => {
      if (peer.connected) {
        peer.send(data);
      }
    });
  };

  return { peers, connected, socketRef, sendData };
};
