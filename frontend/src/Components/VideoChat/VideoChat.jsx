import React, { useState, useCallback, useEffect } from "react";
import Video from "twilio-video";
import Lobby from "./Lobby";
import Room from "./Room";
import { useSocket } from "../../providers/SocketProvider";
import axios from "axios";
const VideoChat = () => {
  const { socket, isConnected } = useSocket();

  const [userName, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [room, setRoom] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [joiningRequests, setJoiningRequests] = useState([]);

  const handleUsernameChange = useCallback((event) => {
    setUsername(event.target.value);
  }, []);

  const handleRoomNameChange = useCallback((event) => {
    setRoomName(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if(isConnected && socket){socket.emit(`room-join-request`, {id : socket.id, roomName : roomName, userName : userName});
      // return;
      setConnecting(true);
      axios
        .post(`${import.meta.env.VITE_API_URL}/twilio/video/token`, {
          roomName: roomName,
          userName: userName,
        })
        .then(({ data }) => {
          Video.connect(data.token, {
            name: roomName,
          })
            .then((room) => {
              setConnecting(false);
              setRoom(room);
            })
            .catch((err) => {
              console.error(err);
              setConnecting(false);
            });
        })
        .catch((err) => console.log(err.message));}
    },
    [roomName, userName, isConnected, socket]
  );

  const handleLogout = useCallback(() => {
    setRoom((prevRoom) => {
      if (prevRoom) {
        prevRoom.localParticipant.tracks.forEach((trackPub) => {
          trackPub.track.stop();
        });
        prevRoom.disconnect();
      }
      return null;
    });
  }, []);

  useEffect(()=>{
    if(isConnected){
      socket.on(`join-request`, (data)=>{
      console.log('join-request-received', data)
      setJoiningRequests([...joiningRequests, data]);
    })}
  }, [isConnected, socket])

  useEffect(() => {
    if (room) {
      const tidyUp = (event) => {
        if (event.persisted) {
          return;
        }
        if (room) {
          handleLogout();
        }
      };
      window.addEventListener("pagehide", tidyUp);
      window.addEventListener("beforeunload", tidyUp);
      return () => {
        window.removeEventListener("pagehide", tidyUp);
        window.removeEventListener("beforeunload", tidyUp);
      };
    }
  }, [room, handleLogout]);

  let render;
  if (room) {
    render = (
      <Room roomName={roomName} room={room} handleLogout={handleLogout} joiningRequests={joiningRequests}/>
    );
  } else {
    render = (
      <Lobby
        userName={userName}
        roomName={roomName}
        handleUsernameChange={handleUsernameChange}
        handleRoomNameChange={handleRoomNameChange}
        handleSubmit={handleSubmit}
        connecting={connecting}
      />
    );
  }
  return render;
};

export default VideoChat;
