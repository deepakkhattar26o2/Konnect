import React from "react";
import "./App.css";
import { SocketProvider } from "./providers/SocketProvider";
import Home from "./Components/VideoChat/Home";

const App = () => {
  return (
    <SocketProvider>
      <Home/>
    </SocketProvider>
  );
};

export default App;
