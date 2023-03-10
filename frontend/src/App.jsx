import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { SocketContext, socket } from "./providers/Socket";
import { PeerContext, peer } from "./providers/Peer";
import Room from "./pages/Room";

function App() {
  return (
    <SocketContext.Provider value={socket}>
      <PeerContext.Provider value={peer}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </div>
      </PeerContext.Provider>
    </SocketContext.Provider>
  );
}
//try useCallBack hook for functions???
export default App;
