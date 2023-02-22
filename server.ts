import express, { Application } from "express";
import http from 'http';
require("dotenv").config();
const cors = require("cors");

const port = Number(process.env.PORT) || 5000;

const app : Application = express();

app.use(cors());

app.use(express.json());


const httpServer = http.createServer(app);

httpServer.listen(port, ()=>{
  console.log(`Server Listening at http://localhost:${port}`);
})