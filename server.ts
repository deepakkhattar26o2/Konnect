import express, { Application } from "express";
import http from "http";
import { Socket, Server as ioServer } from "socket.io";
import connect from "./connectDb";
import apiRouter from "./api";
require("dotenv").config();
const cors = require("cors");

const port = Number(process.env.PORT) || 5000;
const app: Application = express();

const httpServer = http.createServer(app);

const io = new ioServer(httpServer, {
  cors: {
    origin: "*",
  },
});

enum Role {
  HOST,
  MEMBER,
}

interface Participant {
  id: string;
  userName: string;
  role: Role;
}

// Map for rooms and participants
let roomMap: Map<string, Participant[]> = new Map();

io.on("connection", (socket: Socket) => {
  console.log(`${socket.id} has connected!`);

  socket.on("room-join-request", (data) => {
    let { id, roomName, userName } = data;
    if (!id || !roomName || !userName) return;
    let room: Participant[] | undefined = roomMap.get(roomName);
    let participant: Participant = {
      id: id,
      userName: userName,
      role: Role.MEMBER,
    };
    if (!room) {
      //create map entry with this user role as host!
      participant.role = Role.HOST;
      roomMap.set(roomName, [participant]);
      io.to(participant.id).emit("request-accepted", { roomName: roomName, participant : participant });
      return;
    }
    //send socket request to host socket id

    let host: Participant | undefined = room?.find(
      (member) => member.role === Role.HOST
    );
    if (!host) return;

    io.to(host.id).emit(`join-request`, participant);
  });

  interface responseData {
    participant?: Participant;
    roomName: string;
  }

  socket.on("join-request-accepted", (data: responseData) => {
    const { participant, roomName } = data;
    if (!participant || !roomName) return;
    let room: Participant[] | undefined = roomMap.get(roomName);
    if (!room) return;
    roomMap.set(roomName, [...room, participant]);
    console.log('request accepted for', roomName, participant)
    io.to(participant.id).emit("request-accepted", { roomName: roomName, participant : participant });
  });

  socket.on("join-request-rejected", (data: responseData) => {
    const { participant, roomName } = data;
    if (!participant || !roomName) return;
    console.log('join request rejected for', data)
    io.to(participant.id).emit("request-rejected", { roomName: roomName, participant : participant });
  });

  socket.on("test", () => {
    for (let entry of roomMap) {
      console.log(entry[0], entry[1]);
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} has disconnected!`);
  });
});

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

httpServer.listen(port, async () => {
  await connect();
  console.log(`Server Listening at http://localhost:${port}`);
});
