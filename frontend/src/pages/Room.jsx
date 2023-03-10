import React, { useState, useEffect, useContext, useCallback } from "react";
import { SocketContext } from "../providers/Socket";
import ReactPlayer from "react-player";
import {
  PeerContext,
  createAnswer,
  createOffer,
  sendStream,
  setRemoteAnswer,
} from "../providers/Peer";

function Room() {
  const [myStream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);
  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    sendStream(peer, stream);
    setStream(stream);
  }, [sendStream]);
  const socket = useContext(SocketContext);

  const peer = useContext(PeerContext);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log(`User ${emailId} joined the room!`);
      const offer = await createOffer(peer);
      setRemoteEmailId(emailId);
      socket.emit("call_user", { emailId: emailId, offer: offer });
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      setRemoteEmailId(from);
      console.log(`Incoming call from ${from}`, offer);
      const ans = await createAnswer(peer, offer);
      socket.emit("call_accepted", { emailId: from, ans: ans });
    },
    [createAnswer, socket]
  );

  const handleTrackEvent = useCallback((ev) => {
    const streams = ev.streams;
    setRemoteStream(streams[0]);
  }, []);

  const handleCallAccepted = useCallback(async (data) => {
    const { ans } = data;
    console.log("Call got accepted!");
    await setRemoteAnswer(peer, ans);
  }, []);

  useEffect(() => {
    socket.on("user_joined", (data) => {
      handleNewUserJoined(data);
    });
    socket.on("incoming_call", (data) => {
      handleIncomingCall(data);
    });
    socket.on("call_accepted", (data) => {
      handleCallAccepted(data);
    });

    return () => {
      socket.off("user_joined", handleNewUserJoined);
      socket.off("incoming_call", handleIncomingCall);
      socket.off("calls_accepted", handleCallAccepted);
    };
  }, [handleIncomingCall, handleNewUserJoined, socket]);

  const handleNegotiation = useCallback(() => {
    console.log("Neg. needed!");
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);
    peer.addEventListener("negotiationeeded", handleNegotiation);
    return () => {
      peer.removeEventListener("track", handleTrackEvent);
      peer.removeEventListener("negotiationeeded", handleNegotiation);
    };
  }, [handleTrackEvent, peer]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div>
      <h1>Room Page</h1>
      <h3>You're connected to {remoteEmailId}</h3>
      <ReactPlayer url={myStream} playing muted />
      <ReactPlayer url={remoteStream} playing muted />
    </div>
  );
}

export default Room;
