import React from "react";
import VideoChat from "./VideoChat";
function Home() {    
  return (
    <div className="app">
      <header>
        <h1>Konnect</h1>
      </header>
      <main>
        <VideoChat />
      </main>
      <footer>Team Konnect</footer>
    </div>
  );
}

export default Home;
