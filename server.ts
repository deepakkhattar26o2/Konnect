import express, { Application } from "express";
import http from 'http';
import { Server as ioServer } from "socket.io";
import connect from './connectDb';
import apiRouter from "./api"
require("dotenv").config();
const cors = require("cors");

const port = Number(process.env.PORT) || 5000;
const app : Application = express();

const httpServer = http.createServer(app);

const io = new ioServer(httpServer, {
  cors : {
    origin : '*'
  }
});
const emailToSocket : Map<string, string> = new Map;
const socketToEmail : Map<string, string> = new Map;
io.on('connection', (socket)=>{
  socket.on("join_room", (data)=>{
    const {roomId, emailId} = data;
    emailToSocket.set(emailId, socket.id);
    socketToEmail.set(socket.id, emailId);
    console.log(`User ${emailId} joined room ${roomId}`)
    socket.join(roomId);
    io.to(socket.id).emit("joined_room", {roomId : roomId})
    io.to(roomId).emit("user_joined", {emailId :emailId});
  })

  socket.on("call_user", (data)=>{
    const {emailId, offer} = data;
    const socketId = String(emailToSocket.get(emailId));
    const caller = socketToEmail.get(socketId);
    io.to(socketId).emit("incoming_call", {from : caller, offer : offer});
  })

  socket.on("call_accepted", (data)=>{
    const {emailId, ans} = data
    const socketId = String(emailToSocket.get(emailId));
    io.to(socketId).emit("call_accepted", {ans : ans});
  })
})

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);


httpServer.listen(port,async ()=>{
  await connect();
  console.log(`Server Listening at http://localhost:${port}`);
})
