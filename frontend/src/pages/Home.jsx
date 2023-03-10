import React, {useEffect, useState, useContext, useCallback} from 'react'
import { SocketContext } from '../providers/Socket';
import {useNavigate} from 'react-router-dom'
const submitHandler = (emailId, roomId, socket) => {
  console.log(`Email : ${emailId}\nroomId : ${roomId}`)
  socket.emit("join_room", {roomId : roomId, emailId : emailId})
}


function Home() {
  const navigate = useNavigate(); 
  const socket = useContext(SocketContext);
  const [emailId, setEmailId] = useState("");
  const [roomId, setRoomId] = useState("");
  const handleJoinedRoom = useCallback((roomId) =>{
    navigate(`room/${roomId}`)
  }, [navigate]
  )
  
  useEffect(() => {
    socket.on("joined_room", (data)=>{handleJoinedRoom(data.roomId)})
  
    return () => {
      socket.off("joined_room", handleJoinedRoom)
    }
  }, [socket])
  

  return (
    <div className='homepage-container'>
            <input type='email' onChange={(e)=>{setEmailId(e.target.value)}} placeholder='Enter your email here'/>
            <input type='text'  onChange={(e)=>{setRoomId(e.target.value)}}  placeholder='Enter Room id'/>
            <button onClick={(e)=>{e.preventDefault(); submitHandler(emailId, roomId, socket);}}>Enter Room</button>
    </div>
  )
}

export default Home


