import React from 'react';
import './App.css';
import VideoChat from './VideoChat';

const App = () => {
  return (
    <div className="app">
      <header>
        <h1>Konnect</h1>
      </header>
      <main>
        <VideoChat />
      </main>
      <footer>
        footer
      </footer>
    </div>
  );
};

export default App;
