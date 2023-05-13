import { Socket, Server as ioServer } from "socket.io";
import { HttpServer, JoinEvent, ResponseData } from "../../TypeDefs";
import { Participant, Role } from "../../TypeDefs";

class SocketHandler {
  //socket server
  private io: ioServer;
  
  // Map for rooms and participants
  private participantToRoom: Map<string, string> = new Map();
  private roomMap: Map<string, Participant[]> = new Map();

  constructor(server: HttpServer) {
    this.io = new ioServer(server, {
      cors: {
        origin: "*",
      },
    });
    this.io.on("connection", this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket) {
    console.log(socket.id, "has connected!");

    // handles socket event for a room joining request by a new user, creates new room if the user is hosting
    socket.on("room-join-request", this.handleRoomJoin.bind(this, socket));

    // handles socket event for room-join after request's accepted by host
    socket.on("join-request-accepted", this.handleRequestAccepted.bind(this, socket));

    // handles socket event for room-join after request's rejected by host
    socket.on("join-request-rejected", this.handleRequestRejected.bind(this, socket));

    // handles socket event when a participant leaves the room
    socket.on("disconnected-from-room", this.handleLeave.bind(this, socket));

    // handles socket event when a participant is disconnected
    socket.on("disconnect", this.handleDisconnect.bind(this, socket));
  }

  private handleRoomJoin = (socket: Socket, data: JoinEvent) => {
    let { id, roomName, userName } = data;
    if (!id || !roomName || !userName) return;

    let room: Participant[] | undefined = this.roomMap.get(roomName);
    let participant: Participant = {
      id: id,
      userName: userName,
      role: Role.MEMBER,
    };

    if (!room) {
      // create map entry with this user role as host!
      participant.role = Role.HOST;
      this.roomMap.set(roomName, [participant]);
      this.io
        .to(participant.id)
        .emit("request-accepted", {
          roomName: roomName,
          participant: participant,
        });
      this.participantToRoom.set(participant.id, roomName);
      return;
    }

    // send socket request to host socket id
    let host: Participant | undefined = room?.find(
      (member) => member.role === Role.HOST
    );
    if (!host) return;
    this.io.to(host.id).emit(`join-request`, participant);
  };

  private handleRequestAccepted = (socket : Socket, data : ResponseData)=>{
    const { participant, roomName } = data;
    if (!participant || !roomName) return;
    let room: Participant[] | undefined = this.roomMap.get(roomName);
    if (!room) return;
    this.roomMap.set(roomName, [...room, participant]);
    console.log('request accepted for', roomName, participant)
    this.participantToRoom.set(participant.id, roomName);
    this.io.to(participant.id).emit("request-accepted", { roomName: roomName, participant : participant });
    socket.join(roomName);

  }

  private handleRequestRejected =(socket : Socket, data : ResponseData) =>{
    const { participant, roomName } = data;
    if (!participant || !roomName) return;
    console.log('join request rejected for', data)
    this.io.to(participant.id).emit("request-rejected", { roomName: roomName, participant : participant });

  }

  private handleLeave = (socket : Socket, data : ResponseData) =>{
    const {participant, roomName} = data;
    console.log("data for leaving room : ", data)
    if(!roomName || !participant) return;
    socket.leave(data.roomName);
    // participantToRoom.delete(socket.id);
    this.io.to(data.roomName).emit('user-left', {roomName : roomName, participant : participant});
  }

  private handleDisconnect = (socket : Socket)=>{
    let roomName : string  | undefined= this.participantToRoom.get(socket.id);
    if(roomName){
      this.io.to(roomName).emit('user-left', {roomName : roomName});
    }
  }
}

export default SocketHandler;
