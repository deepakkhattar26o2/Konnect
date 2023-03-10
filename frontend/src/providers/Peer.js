import React, { useMemo } from "react";

const peer = new RTCPeerConnection({
  
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
  ],
});

const createOffer = async (peer) => {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  return offer;
};

const createAnswer = async (peer, offer) => {
  await peer.setRemoteDescription(offer);
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  return answer;
};

const setRemoteAnswer = async (peer, ans) =>{
  await peer.setRemoteDescription(ans);
}

const sendStream = async(peer, stream)=>{
  const tracks = stream.getTracks();
  for(const track of tracks){
    peer.addTrack(track, stream);
  }
}

const PeerContext = React.createContext(peer);

export {peer, createOffer, createAnswer, PeerContext, setRemoteAnswer, sendStream}