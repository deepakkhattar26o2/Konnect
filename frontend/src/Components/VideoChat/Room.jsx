import React, { useEffect, useState } from "react";
import Participant from "./Participant";
import { useSocket } from "../../providers/SocketProvider";
const Room = ({
  roomName,
  room,
  handleLogout,
  joiningRequests,
  setJoiningRequests,
}) => {
  const [participants, setParticipants] = useState([]);
  const { socket, isConnected } = useSocket();
  
  useEffect(() => {
    const participantConnected = (participant) => {
      setParticipants((prevParticipants) => [...prevParticipants, participant]);
    };

    const participantDisconnected = (participant) => {
      console.log("particpant disconnected triggered", participant);
      setParticipants((pts) => {
        pts.filter((pt) => pt.state == "connected");
      });
    };

    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);
    room.participants.forEach(participantConnected);
    return () => {
      room.off("participantConnected", participantConnected);
      room.off("participantDisconnected", participantDisconnected);
    };
  }, [room]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.on("user-left", (data) => {
        console.log("user-left-socket-received");
        setParticipants([
          ...participants.filter((pt) => pt?.state == "connected"),
        ]);
      });
    }
  }, [socket, isConnected]);

  const remoteParticipants = [...new Set(participants)].map((participant) => (
    <Participant key={participant.sid} participant={participant} />
  ));

  return (
    <div className="room">
      <h2>Room: {roomName}</h2>
      <button
        onClick={() => {
          socket.emit("disconnected-from-room", {
            roomName: roomName,
            participant: room.localParticipant,
          });
          handleLogout();
        }}
      >
        Log out
      </button>
      <div className="local-participant">
        {room ? (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
          />
        ) : (
          ""
        )}

        <div>
          {joiningRequests.map((pt, itr) => (
            <div key={itr}>
              <div>{pt.userName} wants to join the room!</div>
              <button
                onClick={() => {
                  console.log(
                    "sending acceptance request socket with data",
                    pt,
                    roomName
                  );
                  socket.emit("join-request-accepted", {
                    participant: pt,
                    roomName: roomName,
                  });
                  setJoiningRequests((prevRequests) =>
                    prevRequests.filter((req) => req != pt)
                  );
                }}
              >
                accept
              </button>
              <button
                onClick={() => {
                  console.log(
                    "sending rejection request socket with data",
                    pt,
                    roomName
                  );
                  socket.emit("join-request-rejected", {
                    participant: pt,
                    roomName: roomName,
                  });
                  setJoiningRequests((prevRequests) =>
                    prevRequests.filter((req) => req != pt)
                  );
                }}
              >
                reject
              </button>
            </div>
          ))}
        </div>
      </div>
      <h3>Remote </h3>
      <div className="remote-participants">{remoteParticipants}</div>
    </div>
  );
};

export default Room;
