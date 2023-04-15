import express, { Application } from "express";
import http from 'http';
import { Socket, Server as ioServer } from "socket.io";
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

//for sharing ICE and SDP info
io.on('connection', (socket : Socket)=>{
  console.log(`${socket.id} has connected!`)
  io.to(socket.id).emit('self', {socketId : socket.id})
  
  socket.on('disconnect', ()=>{
    console.log(`${socket.id} has disconnected!`);
  })

})

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);


httpServer.listen(port,async ()=>{
  await connect();
  console.log(`Server Listening at http://localhost:${port}`);
})
