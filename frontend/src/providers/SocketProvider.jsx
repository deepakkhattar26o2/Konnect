import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

// WebSocket context
const SocketContext = createContext();

// Hook to access the WebSocket context
export function useSocket() {
  return useContext(SocketContext);
}
const url = import.meta.env.VITE_SOCKET_URL;
// Socket provider component
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // WebSocket connection
    const newSocket = io(url);

    // Event listeners for the WebSocket connection
    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("connect_error", (err) => setError(err));

    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const contextValue = {
    socket,
    isConnected,
    error,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}
