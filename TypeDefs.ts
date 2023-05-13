import http from "http";
import { type } from "os";
enum Role {
  HOST,
  MEMBER,
}

type Participant = {
  id: string;
  userName: string;
  role: Role;
};

type ResponseData = {
  participant?: Participant;
  roomName: string;
};

type IUser = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type TokenRequestBody = {
  userName: string;
  roomName: string;
};

type CurrentUser = {
  email: string;
  firstName: string;
  lastName: string;
  _id: string;
};

type SignUpRequest = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type HttpServer = http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

type JoinEvent = {
  id : string,
  roomName : string,
  userName : string
}

export {
  Participant,
  Role,
  ResponseData,
  IUser,
  TokenRequestBody,
  CurrentUser,
  SignUpRequest,
  LoginRequest,
  HttpServer,
  JoinEvent
};
