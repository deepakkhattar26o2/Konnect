import express, { Application } from "express";
import http from "http";
import connect from "./connectDb";
import apiRouter from "./api";
require("dotenv").config();
import SocketHandler from "./src/Helpers/SocketHandler";
const cors = require("cors");

const port = Number(process.env.PORT) || 5000;
const app: Application = express();
const httpServer = http.createServer(app);

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

httpServer.listen(port, async () => {
  await connect();
  console.log(`Server Listening at http://localhost:${port}`);
  new SocketHandler(httpServer);
});
