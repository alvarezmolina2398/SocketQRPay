var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var messages = [];

app.use(express.static("public"));


app.get("/hello", function (req, res) {
  res.status(200).send("Hello World!");
});


io.on("connection", function (socket) {
  console.log("Alguien se ha conectado con Sockets");

  // Manejar el evento de unirse a una sala
  socket.on("join-room", function (username) {
    socket.join(username);
    console.log(`${username} se ha unido a la sala ${username}`);
  });

  // Emitir los mensajes a la sala específica del usuario
  socket.on("new-message", function (data) {
    //console.log(data);
    messages.push(data);
    const messagesReturn = messages.filter(m => m.sesion == data.sesion);
    const validos =  messagesReturn.filter(m => m.accion == 1);

    console.log(validos.length);
   // console.log(messages);
   // console.log(messagesReturn);
    // Enviar mensajes solo a la sala del usuario que los envió
    io.to(data.sesion).emit("messages", validos.length != 0 ?  messagesReturn : []);
  });


});



server.listen(8080, function () {
  console.log("Servidor corriendo en http://localhost:8080");
});


