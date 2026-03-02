const socket=io();

function join(){

localStorage.name=name.value;
localStorage.room=room.value;
localStorage.color=color.value;

socket.emit("joinRoom",{
name:name.value,
room:room.value,
color:color.value
});

location="/game";
}
