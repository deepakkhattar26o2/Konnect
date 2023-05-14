import React, { useState, useCallback, useEffect } from "react";
import Video from "twilio-video";
import Lobby from "./Lobby";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [_self, setSelf] = useState({});
  const handleUsernameChange = useCallback((event) => {
    setUsername(event.target.value);
  }, []);

  const handleRoomNameChange = useCallback((event) => {
    setRoomName(event.target.value);
  }, []);

  const handleRequestAccepted = useCallback((_data) => {
    console.log("request accepted, sending request", _data);
    setSelf(_data.participant);
    const roomName = _data.roomName;
    const userName = _data.participant?.userName;
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
      .catch((err) => console.log(err));
  }, []);

  const handleRequestRejected = useCallback((_data) => {
    console.log(`your request for room ${_data.roomName} is rejected!`);
    setConnecting(false);
    toast.error(`Request for joining room ${_data.roomName} was declined!`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      });
    //show toast
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (isConnected && socket) {
        console.log("sending socket request to join the room");
        socket.emit(`room-join-request`, {
          id: socket.id,
          roomName: roomName,
          userName: userName,
        });
        // return;
        setConnecting(true);
      }
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
  }, [room]);

  useEffect(() => {
    if (isConnected) {
      socket.on(`join-request`, (data) => {
        console.log("received joining request", data);
        setJoiningRequests((prevJoiningRequests) => [
          ...prevJoiningRequests,
          data,
        ]);
      });
      socket.on("request-accepted", (data) => {
        handleRequestAccepted(data);
      });

      socket.on("request-rejected", (data) => {
        handleRequestRejected(data);
      });

      socket.on("test-socket", (data) => {
        console.log("test-socket-data", data);
      });
    }
  }, [isConnected, socket]);

  // useEffect(() => {
  //   if (room) {
  //     const tidyUp = (event) => {
  //       socket.emit("disconnected-from-room", {
  //         roomName: roomName,
  //         participant: _self,
  //       });
  //       console.log("room left with", _self, roomName, socket)
  //       event.preventDefault();
  //       if (event.persisted) {
  //         return;
  //       }
  //       if (room) {
  //         handleLogout();
  //       }
  //     };
  //     window.addEventListener("pagehide", tidyUp);
  //     window.addEventListener("beforeunload", tidyUp);
  //     return () => {
  //       window.removeEventListener("pagehide", tidyUp);
  //       window.removeEventListener("beforeunload", tidyUp);
  //     };
  //   }
  // }, [room, handleLogout]);

  let render;
  if (room) {
    render = (
      <Room
        roomName={roomName}
        room={room}
        handleLogout={handleLogout}
        joiningRequests={joiningRequests}
        setJoiningRequests={setJoiningRequests}
      />
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
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Same as */}
      <ToastContainer />
      {render}
    </div>
  );
};

export default VideoChat;
