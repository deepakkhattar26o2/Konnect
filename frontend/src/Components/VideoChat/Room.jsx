import React, { useEffect, useState } from "react";
import Participant from "./Participant";
import { useSocket } from "../../providers/SocketProvider";
const Room = (
  { roomName, room, handleLogout, joiningRequests },
) => {
  const [participants, setParticipants] = useState([]);
  const { socket } = useSocket();
  useEffect(() => {
    const participantConnected = (participant) => {
      setParticipants((prevParticipants) => [...prevParticipants, participant]);
    };

    const participantDisconnected = (participant) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      );
    };

    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);
    room.participants.forEach(participantConnected);
    return () => {
      room.off("participantConnected", participantConnected);
      room.off("participantDisconnected", participantDisconnected);
    };
  }, [room]);

  const remoteParticipants = [...new Set(participants)].map((participant) => (
    <Participant key={participant.sid} participant={participant} />
  ));

  return (
    <div className="room">
      <h2
        onClick={() => {
          console.log(joiningRequests);
        }}
      >
        Room: {roomName}
      </h2>
      <button onClick={handleLogout}>Log out</button>
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
              <div>{pt.userName} wants to joing the room!</div>
              <div
                onClick={() => {
                  console.log('sending acceptance request socket with data' , pt, roomName);
                  socket.emit("join-request-accepted", {
                    participant: pt,
                    roomName: roomName,
                  });
                }}
              >
                accept
              </div>
              <div
                onClick={() => {
                  console.log('sending rejection request socket with data' , pt, roomName);
                  socket.emit("join-request-rejected", {
                    participant: pt,
                    roomName: roomName,
                  });
                }}
              >
                reject
              </div>
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
