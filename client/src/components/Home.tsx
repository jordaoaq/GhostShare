import React from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Share2 } from "lucide-react";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const createRoom = () => {
    const id = uuidv4();
    navigate(`/room/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-600 rounded-full bg-opacity-20">
            <Share2 className="w-16 h-16 text-blue-500" />
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          GhostShare
        </h1>
        <p className="text-gray-400 text-lg">
          Secure, serverless P2P file sharing. No databases, no logs, just you
          and your peer.
        </p>

        <button
          onClick={createRoom}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
        >
          Create Room
        </button>
      </div>
    </div>
  );
};

export default Home;
